from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.http import FileResponse
from django.db import transaction
from django.utils import timezone

from .models import PedidoServicio, ItemPedidoServicio
from .serializers import (
    PedidoServicioSerializer,
    PedidoServicioListSerializer,
    PedidoServicioDetailSerializer,
    ItemPedidoServicioSerializer,
)

from .permissions import (
    CanViewPedidos,
    CanCreatePedidos,
    CanEditPedidos,
    CanDeletePedidos,
)

from .services import PedidoServicioService
from .pdf_generator import generate_pedido_pdf
from .filters import PedidoServicioFilter
from common.pagination import StandardPagination

import logging
logger = logging.getLogger(__name__)


# -------------------------
# VIEWSET PRINCIPAL
# -------------------------
class PedidoServicioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la API de Pedidos de Servicio.
    Aplica paginación, filtros avanzados, búsqueda y ordenamiento.
    
    Endpoints disponibles:
    - GET /pedidos-servicio/ - Lista paginada con filtros
    - POST /pedidos-servicio/ - Crear nuevo pedido
    - GET /pedidos-servicio/{id}/ - Detalle de pedido
    - PUT/PATCH /pedidos-servicio/{id}/ - Actualizar pedido
    - DELETE /pedidos-servicio/{id}/ - Eliminar pedido
    - POST /pedidos-servicio/{id}/cambiar_estado/ - Cambiar estado
    - GET /pedidos-servicio/{id}/pdf/ - Generar PDF
    
    Parámetros de consulta:
    - ?search= : Busca en numero_pedido, cliente__nombre y solicitante
    - ?estado= : Filtra por estado exacto
    - ?cliente= : Filtra por ID de cliente
    - ?manufacturador= : Filtra por ID de manufacturador
    - ?instalador= : Filtra por ID de instalador
    - ?fecha_desde= : Fecha inicio >= YYYY-MM-DD
    - ?fecha_hasta= : Fecha inicio <= YYYY-MM-DD
    - ?ordering= : Ordena por campo (ej: -created_at, numero_pedido)
    - ?page= : Número de página
    - ?page_size= : Elementos por página (máx 100)
    """

    queryset = PedidoServicio.objects.all()
    serializer_class = PedidoServicioSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    # --- CONFIGURACIÓN DE BÚSQUEDA Y FILTROS ---
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = PedidoServicioFilter
    
    # Búsqueda global por texto
    search_fields = ['numero_pedido', 'cliente__nombre', 'solicitante']
    
    # Campos permitidos para ordenamiento
    ordering_fields = [
        'created_at',
        'updated_at',
        'fecha_inicio',
        'fecha_fin',
        'numero_pedido',
        'estado',
    ]
    ordering = ['-created_at']  # Ordenamiento por defecto


    # -------------------------
    # PERMISOS POR ACCIÓN
    # -------------------------
    def get_permissions(self):

        if self.action in ['list', 'retrieve', 'mis_pedidos', 'estadisticas']:
            permission_classes = [IsAuthenticated, CanViewPedidos]

        elif self.action == 'create':
            permission_classes = [IsAuthenticated, CanCreatePedidos]

        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAuthenticated, CanEditPedidos]
        
        elif self.action == 'cambiar_estado':
            # Solo requiere autenticación, los permisos específicos se validan dentro del método
            permission_classes = [IsAuthenticated]

        elif self.action == 'destroy':
            permission_classes = [IsAuthenticated, CanDeletePedidos]

        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]


    # -------------------------
    # SERIALIZER DINÁMICO
    # -------------------------
    def get_serializer_class(self):

        if self.action == 'list':
            return PedidoServicioListSerializer

        if self.action == 'retrieve':
            return PedidoServicioDetailSerializer

        return PedidoServicioSerializer


    # -------------------------
    # FILTRADO POR GRUPOS
    # -------------------------
    def get_queryset(self):

        user = self.request.user

        queryset = PedidoServicio.objects.select_related(
            'cliente', 'manufacturador', 'instalador'
        ).prefetch_related('items')

        # ✅ Admin/Superuser: ve TODO
        if user.is_superuser:
            return queryset

        # Obtener grupos del usuario
        user_groups = user.groups.values_list('name', flat=True)
        is_comercial = any(g.lower() == 'comercial' for g in user_groups)
        is_manufacturador = any(g.lower() == 'manufacturador' for g in user_groups)
        is_instalador = any(g.lower() == 'instalador' for g in user_groups)

        # ✅ Comercial: solo los pedidos que él creó
        if is_comercial:
            return queryset.filter(usuario_creacion=user)

        # ✅ Manufacturador: solo pedidos donde está asignado como manufacturador
        if is_manufacturador:
            if hasattr(user, 'personal_manufactura'):
                return queryset.filter(manufacturador=user.personal_manufactura)
            return queryset.none()

        # ✅ Instalador: solo pedidos donde está asignado como instalador
        if is_instalador:
            if hasattr(user, 'personal_manufactura'):
                return queryset.filter(instalador=user.personal_manufactura)
            return queryset.none()

        # ✅ Manufacturador/Instalador sin grupo específico pero con personal_manufactura
        # Ver pedidos donde está asignado en cualquier rol
        if hasattr(user, 'personal_manufactura'):
            from django.db.models import Q
            personal = user.personal_manufactura
            return queryset.filter(
                Q(manufacturador=personal) | Q(instalador=personal)
            )

        # Usuario sin rol específico - no ve nada
        return queryset.none()


    # -------------------------
    # CREACIÓN (✅ solicitante corregido)
    # -------------------------
    def perform_create(self, serializer):
        user = self.request.user
        nombre = user.get_full_name() or user.username

        serializer.save(
            usuario_creacion=user,
            solicitante=nombre,
            fecha_emision=timezone.now().date()
        )


    # -------------------------
    # CREACIÓN ATÓMICA (PEDIDO + ITEMS)
    # -------------------------
    @action(detail=False, methods=['post'], url_path='crear-con-items')
    def crear_con_items(self, request):
        """
        Crea un pedido con sus items de forma atómica.
        Si algún item falla la validación, NO se crea el pedido.
        
        Body esperado:
        {
            "pedido": {
                "cliente_id": 1,
                "manufacturador_id": 2,
                "instalador_id": 3,
                "solicitante": "Juan Pérez",
                "supervisor": "María López",
                "fecha_inicio": "2025-01-15",
                "fecha_fin": "2025-01-20",
                "observaciones": "Notas adicionales",
                "estado": "ENVIADO"
            },
            "items": [
                {
                    "ambiente": "Sala",
                    "modelo": "Roller",
                    "tejido": "Screen 5%",
                    "largura": 2.50,
                    "altura": 1.80,
                    "cantidad_piezas": 2,
                    "posicion_tejido": "NORMAL",
                    "lado_comando": "DERECHO",
                    "acionamiento": "MANUAL",
                    "observaciones": ""
                }
            ]
        }
        """
        user = request.user
        pedido_data = request.data.get('pedido', {})
        items_data = request.data.get('items', [])
        
        if not items_data:
            return Response(
                {'detail': 'Debe incluir al menos un item'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # 1. Validar y crear el pedido
                pedido_serializer = PedidoServicioSerializer(data=pedido_data)
                if not pedido_serializer.is_valid():
                    return Response(
                        {'detail': 'Error en datos del pedido', 'errors': pedido_serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Guardar pedido con usuario de creación
                pedido = pedido_serializer.save(
                    usuario_creacion=user,
                    solicitante=pedido_data.get('solicitante', user.get_full_name() or user.username),
                    fecha_emision=timezone.now().date()
                )
                
                # 2. Validar TODOS los items primero (sin crear nada)
                items_validados = []
                items_errors = []
                
                for idx, item_data in enumerate(items_data):
                    item_serializer = ItemPedidoServicioSerializer(data=item_data)
                    if item_serializer.is_valid():
                        items_validados.append(item_serializer.validated_data)
                        items_errors.append(None)
                    else:
                        items_validados.append(None)
                        items_errors.append(item_serializer.errors)
                
                # Si hay errores, retornar SIN crear nada (el pedido tampoco se crea por el rollback)
                if any(items_errors):
                    return Response(
                        {
                            'detail': 'Hay errores de validación en los items del pedido',
                            'errors': {
                                'items': items_errors
                            }
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # 3. Si todo está OK, crear los items
                items_creados = []
                for idx, validated_data in enumerate(items_validados, start=1):
                    item = ItemPedidoServicio.objects.create(
                        pedido_servicio=pedido,
                        numero_item=idx,
                        **validated_data
                    )
                    items_creados.append(item)
                
                # 4. Retornar el pedido creado con sus items
                response_serializer = PedidoServicioDetailSerializer(pedido)
                return Response(
                    {
                        'detail': f'Pedido creado exitosamente con {len(items_creados)} item(s)',
                        'pedido': response_serializer.data
                    },
                    status=status.HTTP_201_CREATED
                )
                
        except Exception as e:
            # Error inesperado
            logger.exception(f'Error creando pedido con items: {str(e)}')
            return Response(
                {'detail': f'Error al crear pedido: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



    # -------------------------
    # ITEMS
    # -------------------------
    @action(detail=True, methods=['post'])
    def items(self, request, pk=None):

        pedido = self.get_object()
        serializer = ItemPedidoServicioSerializer(data=request.data)

        if serializer.is_valid():
            numero_item = PedidoServicioService.get_next_numero_item(pedido.id)
            item = ItemPedidoServicio.objects.create(
                pedido_servicio=pedido,
                numero_item=numero_item,
                **serializer.validated_data
            )
            return Response(ItemPedidoServicioSerializer(item).data, status=201)

        return Response(serializer.errors, status=400)


    @action(detail=True, methods=['delete'], url_path='items/(?P<item_id>[^/.]+)')
    def delete_item(self, request, pk=None, item_id=None):

        pedido = self.get_object()

        try:
            item = ItemPedidoServicio.objects.get(id=item_id, pedido_servicio=pedido)
            item.delete()
            return Response(status=204)
        except ItemPedidoServicio.DoesNotExist:
            return Response({'detail': 'Item no encontrado'}, status=404)


    # -------------------------
    # CAMBIO DE ESTADO (✅ SEGURIDAD POR GRUPO Y ASIGNACIÓN)
    # -------------------------
    @action(detail=True, methods=['post'])
    def cambiar_estado(self, request, pk=None):

        pedido = self.get_object()
        user = request.user
        nuevo_estado = request.data.get('estado')

        if nuevo_estado not in dict(PedidoServicio.EstadoPedido.choices):
            return Response({'detail': 'Estado inválido'}, status=400)

        # ✅ VALIDACIÓN DE PERMISOS POR ESTADO
        # Mapeo de estados a permisos requeridos
        estado_permisos = {
            'ACEPTADO': 'pedidos_servicio.can_change_to_aceptado',
            'EN_FABRICACION': 'pedidos_servicio.can_change_to_en_fabricacion',
            'LISTO_INSTALAR': 'pedidos_servicio.can_change_to_listo_instalar',
            'INSTALADO': 'pedidos_servicio.can_change_to_instalado',
            'COMPLETADO': 'pedidos_servicio.can_change_to_completado',
            'RECHAZADO': 'pedidos_servicio.can_change_to_rechazado',
            'CANCELADO': 'pedidos_servicio.can_change_to_cancelado',
        }

        # Admin tiene todos los permisos
        if not user.is_superuser:
            # Verificar si tiene el permiso específico para este estado
            permiso_requerido = estado_permisos.get(nuevo_estado)
            if permiso_requerido and not user.has_perm(permiso_requerido):
                return Response({
                    'detail': f'No tienes permiso para cambiar el estado a {nuevo_estado}'
                }, status=403)

        # ✅ Comercial solo puede cambiar estados de SUS pedidos
        if user.groups.filter(name='Comercial').exists():
            if pedido.usuario_creacion != user:
                return Response({'detail': 'No autorizado para este pedido'}, status=403)
        
        # ✅ manufacturador/instalador solo pueden cambiar SUS pedidos asignados
        elif not user.is_superuser:
            try:
                personal = user.personal_manufactura
                if pedido.manufacturador != personal and pedido.instalador != personal:
                    return Response({'detail': 'No autorizado para este pedido'}, status=403)
            except Exception:
                # Si no tiene personal_manufactura y no es admin, no puede modificar
                if not user.groups.filter(name='Comercial').exists():
                    return Response({'detail': 'Usuario sin manufactura asignada'}, status=403)

        # ✅ Validación de transición
        is_valid, error = PedidoServicioService.validate_state_transition(
            pedido.estado, nuevo_estado
        )

        if not is_valid:
            return Response({'detail': error}, status=400)

        pedido.estado = nuevo_estado
        pedido.save()

        return Response(self.get_serializer(pedido).data)


    # -------------------------
    # ELIMINAR PEDIDO
    # -------------------------
    def destroy(self, request, *args, **kwargs):
        """
        Elimina un pedido de servicio.
        Solo se puede eliminar si está en estado ENVIADO, RECHAZADO o CANCELADO.
        """
        pedido = self.get_object()
        user = request.user

        # Lista de estados que NO permiten eliminación
        estados_bloqueados = [
            'ACEPTADO',
            'EN_FABRICACION',
            'LISTO_INSTALAR',
            'INSTALADO',
            'COMPLETADO'
        ]

        # Verificar si el estado permite eliminación
        if pedido.estado in estados_bloqueados:
            return Response({
                'detail': f'No se puede eliminar un pedido en estado {pedido.get_estado_display()}. Solo se pueden eliminar pedidos en estado ENVIADO, RECHAZADO o CANCELADO.'
            }, status=400)

        # Verificar permisos de propiedad
        # Solo el creador o un admin pueden eliminar
        if not user.is_superuser:
            # Verificar si tiene el permiso estándar de Django
            if not user.has_perm('pedidos_servicio.delete_pedidoservicio'):
                return Response({
                    'detail': 'No tienes permiso para eliminar pedidos'
                }, status=403)
            
            # Comercial solo puede eliminar sus propios pedidos
            if user.groups.filter(name='Comercial').exists():
                if pedido.usuario_creacion != user:
                    return Response({
                        'detail': 'Solo puedes eliminar pedidos que tú creaste'
                    }, status=403)

        # Registrar en log antes de eliminar
        logger.info(f"Eliminando pedido {pedido.numero_pedido} (ID: {pedido.id}) por usuario {user.username}")

        # Guardar información para respuesta
        numero_pedido = pedido.numero_pedido

        # Eliminar el pedido (los items se eliminan en cascada)
        pedido.delete()

        # 204 No Content NO debe tener body
        return Response(status=status.HTTP_204_NO_CONTENT)


    # -------------------------
    # MIS PEDIDOS
    # -------------------------
    @action(detail=False, methods=['get'])
    def mis_pedidos(self, request):

        queryset = self.get_queryset()

        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(
                self.get_serializer(page, many=True).data
            )

        return Response(self.get_serializer(queryset, many=True).data)


    # -------------------------
    # ESTADÍSTICAS
    # -------------------------
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Retorna estadísticas de pedidos filtradas según el rol del usuario.
        Usa get_queryset() para aplicar el filtrado por rol automáticamente.
        """
        # Usar get_queryset() para aplicar filtros de rol
        qs = self.get_queryset()
        
        # Agrupar por estado y contar
        data = qs.values('estado').annotate(count=Count('id')).order_by('estado')

        return Response({
            'total_pedidos': qs.count(),
            'por_estado': list(data)
        })


    # -------------------------
    # PDF
    # -------------------------
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):

        pedido = self.get_object()

        try:
            pdf_buffer = generate_pedido_pdf(pedido, request)

            return FileResponse(
                pdf_buffer,
                as_attachment=True,
                filename=f'Pedido_{pedido.numero_pedido}.pdf',
                content_type='application/pdf'
            )

        except Exception as e:
            logger.exception(str(e))
            return Response({'detail': 'Error al generar PDF'}, status=500)

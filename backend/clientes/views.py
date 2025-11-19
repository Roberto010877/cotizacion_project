# clientes/views.py
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta

from .models import Cliente, Pais, TipoDocumentoConfig
from .serializers import (
    ClienteSerializer, 
    ClienteCreateSerializer,
    ClienteUpdateSerializer,
    ClienteDetailSerializer,
    PaisSerializer,
    TipoDocumentoConfigSerializer
)
from .filters import ClienteFilter
from .permissions import (
    CanViewClientes, 
    CanCreateClientes, 
    CanEditClientes, 
    CanDeleteClientes
)


class ClienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para gestionar clientes con filtros avanzados,
    estadísticas y operaciones específicas por país.
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ClienteFilter
    search_fields = [
        'nombre', 
        'numero_documento', 
        'email', 
        'telefono',
        'direccion'
    ]
    ordering_fields = [
        'nombre', 
        'numero_de_compras', 
        'total_gastado', 
        'fecha_ultima_compra',
        'created_at'
    ]
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Optimiza el queryset con select_related y prefetch_related.
        Filtra por permisos y parámetros específicos.
        """
        queryset = Cliente.objects.filter(is_active=True).select_related(
            'pais',
            'tipo_documento',
            'tipo_documento__pais',
            'usuario'
        )
        
        # Filtro adicional por acción
        if self.action == 'estadisticas':
            # Para estadísticas, no necesitamos todas las relaciones
            queryset = Cliente.objects.filter(is_active=True)
        
        return queryset

    def get_serializer_class(self):
        """
        Retorna el serializer específico según la acción.
        """
        if self.action == 'create':
            return ClienteCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return ClienteUpdateSerializer
        elif self.action == 'retrieve':
            return ClienteDetailSerializer
        return ClienteSerializer

    def get_permissions(self):
        """
        Permisos granularles según la acción.
        """
        if self.action == 'create':
            permission_classes = [IsAuthenticated, CanCreateClientes]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAuthenticated, CanEditClientes]
        elif self.action == 'destroy':
            permission_classes = [IsAuthenticated, CanDeleteClientes]
        else:
            permission_classes = [IsAuthenticated, CanViewClientes]
        
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """
        Sobrescribir creación para agregar lógica adicional.
        """
        # Podrías agregar aquí: notificaciones, auditoría, etc.
        instance = serializer.save()
        
        # Log de creación
        print(f"✅ Cliente creado: {instance.nombre} por usuario: {self.request.user.username}")

    def perform_update(self, serializer):
        """
        Sobrescribir actualización para agregar lógica adicional.
        """
        instance = serializer.save()
        
        # Log de actualización
        print(f"📝 Cliente actualizado: {instance.nombre} por usuario: {self.request.user.username}")

    def perform_destroy(self, instance):
        """
        Sobrescribir eliminación para soft delete.
        """
        instance.is_active = False
        instance.save()
        
        # Log de eliminación
        print(f"🗑️ Cliente eliminado (soft): {instance.nombre} por usuario: {self.request.user.username}")

    # --- Acciones Personalizadas ---

    @action(detail=False, methods=['get'], url_path='estadisticas')
    def estadisticas(self, request):
        """
        Endpoint para obtener estadísticas generales de clientes.
        """
        queryset = self.get_queryset()
        
        # Estadísticas básicas
        total_clientes = queryset.count()
        clientes_activos = queryset.filter(es_cliente_activo=True).count()
        total_ventas = queryset.aggregate(total=Sum('total_gastado'))['total'] or 0
        
        # Estadísticas por tipo de cliente
        por_tipo = queryset.values('tipo').annotate(
            total=Count('id'),
            ventas_totales=Sum('total_gastado')
        )
        
        # Estadísticas por país
        por_pais = queryset.values('pais__nombre', 'pais__codigo').annotate(
            total=Count('id'),
            ventas_totales=Sum('total_gastado')
        )
        
        # Clientes nuevos (últimos 30 días)
        hace_30_dias = timezone.now() - timedelta(days=30)
        clientes_nuevos = queryset.filter(created_at__gte=hace_30_dias).count()
        
        return Response({
            'estadisticas_generales': {
                'total_clientes': total_clientes,
                'clientes_activos': clientes_activos,
                'clientes_nuevos_30_dias': clientes_nuevos,
                'ventas_totales': float(total_ventas),
                'promedio_ventas_por_cliente': float(total_ventas / total_clientes) if total_clientes > 0 else 0
            },
            'distribucion_por_tipo': list(por_tipo),
            'distribucion_por_pais': list(por_pais)
        })

    @action(detail=False, methods=['get'], url_path='buscar-por-documento')
    def buscar_por_documento(self, request):
        """
        Búsqueda especializada por documento con validación de país.
        """
        pais_id = request.query_params.get('pais')
        tipo_documento_id = request.query_params.get('tipo_documento')
        numero_documento = request.query_params.get('numero_documento')
        
        if not all([pais_id, tipo_documento_id, numero_documento]):
            return Response(
                {'error': 'Se requieren los parámetros: pais, tipo_documento y numero_documento'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cliente = self.get_queryset().get(
                pais_id=pais_id,
                tipo_documento_id=tipo_documento_id,
                numero_documento=numero_documento
            )
            serializer = ClienteDetailSerializer(cliente)
            return Response(serializer.data)
        except Cliente.DoesNotExist:
            return Response(
                {'error': 'Cliente no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'], url_path='actualizar-estadisticas')
    def actualizar_estadisticas(self, request, pk=None):
        """
        Actualiza estadísticas de un cliente después de una compra.
        """
        cliente = self.get_object()
        monto_compra = request.data.get('monto_compra')
        
        if not monto_compra:
            return Response(
                {'error': 'El campo "monto_compra" es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            monto_compra = float(monto_compra)
            cliente.actualizar_estadisticas(monto_compra)
            
            return Response({
                'mensaje': 'Estadísticas actualizadas correctamente',
                'nuevo_total_gastado': float(cliente.total_gastado),
                'nuevo_numero_compras': cliente.numero_de_compras,
                'nuevo_tipo_cliente': cliente.tipo
            })
        except ValueError:
            return Response(
                {'error': 'El monto de compra debe ser un número válido'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'], url_path='opciones-filtro')
    def opciones_filtro(self, request):
        """
        Retorna opciones disponibles para filtros (países, tipos de documento, etc.)
        """
        paises = Pais.objects.filter(is_active=True)
        tipos_documento = TipoDocumentoConfig.objects.filter(is_active=True).select_related('pais')

        # Convertir choices a un formato serializable
        tipos_cliente = [{'value': choice[0], 'label': choice[1]} for choice in Cliente.TipoCliente.choices]
        origenes_cliente = [{'value': choice[0], 'label': choice[1]} for choice in Cliente.OrigenCliente.choices]

        return Response({
            'paises': PaisSerializer(paises, many=True).data,
            'tipos_documento': TipoDocumentoConfigSerializer(tipos_documento, many=True).data,
            'tipos_cliente': tipos_cliente,
            'origenes_cliente': origenes_cliente,
        })


class PaisViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet solo lectura para países.
    """
    queryset = Pais.objects.filter(is_active=True)
    serializer_class = PaisSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # No paginar países


class TipoDocumentoConfigViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet solo lectura para tipos de documento.
    """
    queryset = TipoDocumentoConfig.objects.filter(is_active=True).select_related('pais')
    serializer_class = TipoDocumentoConfigSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['pais']
    pagination_class = None
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.db.models import Q

from .models import PedidoServicio, AsignacionTarea
from .serializers import (
    PedidoServicioSerializer,
    PedidoServicioListSerializer,
    PedidoServicioDetailSerializer,
    AsignacionTareaSerializer,
)
from rest_framework.pagination import PageNumberPagination


class PedidoServicioPagination(PageNumberPagination):
    """Paginación personalizada para pedidos de servicio"""
    page_size = 25
    page_size_query_param = 'page_size'
    page_size_query_max = 100
    max_page_size = 100


class PedidoServicioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Pedidos de Servicio.
    
    Permisos:
    - Colaboradores: pueden crear pedidos propios y listar los suyos
    - Administrador: puede ver, editar y cambiar estado de todos los pedidos
    
    Endpoints:
    - GET /api/v1/pedidos-servicio/ - Listar pedidos
    - POST /api/v1/pedidos-servicio/ - Crear pedido
    - GET /api/v1/pedidos-servicio/{id}/ - Detalle de pedido
    - PUT/PATCH /api/v1/pedidos-servicio/{id}/ - Actualizar pedido
    - DELETE /api/v1/pedidos-servicio/{id}/ - Eliminar pedido
    - POST /api/v1/pedidos-servicio/{id}/cambiar-estado/ - Cambiar estado
    """
    
    queryset = PedidoServicio.objects.all()
    serializer_class = PedidoServicioSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PedidoServicioPagination
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['estado', 'cliente', 'colaborador', 'fecha_inicio']
    search_fields = [
        'numero_pedido',
        'cliente__nombre',
        'solicitante',
    ]
    ordering_fields = [
        'created_at',
        'fecha_inicio',
        'estado',
        'cliente__nombre',
    ]
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Usar serializer diferente según la acción"""
        if self.action == 'list':
            return PedidoServicioListSerializer
        elif self.action == 'retrieve':
            return PedidoServicioDetailSerializer
        return PedidoServicioSerializer
    
    def get_queryset(self):
        """Filtrar pedidos según el usuario (colaboradores ven todos, admins ver todos)"""
        queryset = super().get_queryset()
        return queryset
    
    def perform_create(self, serializer):
        """Crear pedido sin asignar colaborador automático"""
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def cambiar_estado(self, request, pk=None):
        """
        Endpoint personalizado para cambiar el estado de un pedido.
        
        Uso:
        POST /api/v1/pedidos-servicio/{id}/cambiar-estado/
        Body: {"estado": "ACEPTADO"}
        
        Solo administrador puede cambiar estados.
        """
        pedido = self.get_object()
        
        # Solo admin puede cambiar estados
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'detail': 'No tiene permisos para cambiar el estado de pedidos.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        nuevo_estado = request.data.get('estado')
        
        # Validar que el estado sea válido
        if nuevo_estado not in dict(PedidoServicio.EstadoPedido.choices):
            return Response(
                {'detail': f'Estado inválido. Debe ser uno de: {list(dict(PedidoServicio.EstadoPedido.choices).keys())}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar transiciones de estado permitidas
        transiciones_validas = {
            'ENVIADO': ['ACEPTADO', 'RECHAZADO', 'CANCELADO'],
            'ACEPTADO': ['EJECUTADO', 'CANCELADO'],
            'RECHAZADO': ['ENVIADO'],
            'EJECUTADO': [],  # No puede cambiar estado final
            'CANCELADO': ['ENVIADO'],
        }
        
        if nuevo_estado not in transiciones_validas.get(pedido.estado, []):
            return Response(
                {'detail': f'No puede cambiar de {pedido.estado} a {nuevo_estado}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pedido.estado = nuevo_estado
        pedido.save()
        
        serializer = self.get_serializer(pedido)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def mis_pedidos(self, request):
        """
        Endpoint para que colaboradores vean solo sus propios pedidos.
        
        Uso: GET /api/v1/pedidos-servicio/mis_pedidos/
        """
        queryset = PedidoServicio.objects.filter(colaborador=request.user)
        
        # Aplicar filtros
        filterset_fields = {
            'estado': request.query_params.get('estado'),
            'fecha_programada': request.query_params.get('fecha_programada'),
        }
        
        for field, value in filterset_fields.items():
            if value:
                queryset = queryset.filter(**{field: value})
        
        # Paginar
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def proximamente(self, request):
        """
        Endpoint para obtener pedidos próximos a ejecutar (próximos 7 días).
        
        Uso: GET /api/v1/pedidos-servicio/proximamente/
        """
        from datetime import timedelta
        from django.utils import timezone
        
        hoy = timezone.now().date()
        proxima_semana = hoy + timedelta(days=7)
        
        queryset = PedidoServicio.objects.filter(
            fecha_programada__gte=hoy,
            fecha_programada__lte=proxima_semana,
            estado__in=['ACEPTADO', 'ENVIADO']
        ).order_by('fecha_programada')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer_class()(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer_class()(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Endpoint para obtener estadísticas de pedidos.
        
        Uso: GET /api/v1/pedidos-servicio/estadisticas/
        """
        from django.db.models import Count
        
        # Solo admin
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'detail': 'No tiene permisos para ver estadísticas.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        stats = PedidoServicio.objects.values('estado').annotate(count=Count('id'))
        
        return Response({
            'total_pedidos': PedidoServicio.objects.count(),
            'por_estado': stats,
        })


class AsignacionTareaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Asignaciones de Tareas.
    
    Permite:
    - Listar tareas asignadas a un instalador
    - Crear nuevas asignaciones
    - Actualizar estado de tareas
    - Ver detalles de cada tarea
    """
    
    queryset = AsignacionTarea.objects.all()
    serializer_class = AsignacionTareaSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PedidoServicioPagination
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['instalador', 'tipo_tarea', 'estado']
    search_fields = ['pedido__numero_pedido', 'instalador__nombre', 'instalador__apellido']
    ordering_fields = ['pedido__numero_pedido', 'tipo_tarea', 'fecha_entrega_esperada', 'estado', 'fecha_asignacion']
    ordering = ['pedido__numero_pedido', 'tipo_tarea']
    
    def get_queryset(self):
        """Filtrar tareas según el usuario
        
        - Admins/Superusers: ven TODAS las tareas
        - Instaladores: ven solo sus tareas asignadas
        - Otros: no ven nada
        """
        queryset = super().get_queryset().select_related('pedido', 'instalador')
        
        # Los admins y superusers ven TODAS
        if self.request.user.is_staff or self.request.user.is_superuser:
            return queryset
        
        # Los colaboradores solo ven tareas de su perfil de instalador
        from instaladores.models import Instalador
        try:
            instalador = Instalador.objects.get(user=self.request.user)
            return queryset.filter(instalador=instalador)
        except Instalador.DoesNotExist:
            # Si no tiene instalador asociado, retorna vacío
            return queryset.none()



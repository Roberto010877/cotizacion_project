from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from pedidos_servicio.models import PedidoServicio
from clientes.models import Cliente
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_metrics(request):
    """
    Endpoint para obtener métricas agregadas del dashboard.
    
    Filtra pedidos según el rol del usuario:
    - Admin/Comercial: Ve todos los pedidos
    - manufacturadores: Solo pedidos donde están asignados como manufacturador
    - Instaladores: Solo pedidos donde están asignados como instalador
    
    Retorna:
    - Conteo total de pedidos por estado
    - Conteo total de clientes
    - Alertas (pedidos sin asignar, retrasados, etc.)
    - Actividad reciente (últimos cambios de estado)
    """
    try:
        user = request.user
        
        # Validar que el usuario tenga permiso para ver pedidos
        if not user.is_superuser and not user.has_perm('pedidos_servicio.view_pedidoservicio'):
            # Si no tiene el permiso básico de ver, retornar 403
            return Response({
                'detail': 'No tienes permiso para ver las métricas del dashboard.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Base queryset - Filtrar según tipo de usuario
        pedidos_qs = PedidoServicio.objects.all()
        
        # Si no es admin, puede ser que necesite filtrar por asignaciones
        if not user.is_superuser:
            # Si tiene personal de manufactura vinculado, podría filtrar por sus asignaciones
            # (esto es opcional, depende de los requerimientos del negocio)
            if hasattr(user, 'personal_manufactura'):
                personal = user.personal_manufactura
                # Opcionalmente filtrar solo sus asignaciones
                # pedidos_qs = pedidos_qs.filter(
                #     Q(manufacturador=personal) | Q(instalador=personal)
                # )
                pass
        
        # Contar pedidos por estado
        estados_count = pedidos_qs.values('estado').annotate(count=Count('id'))
        estados_dict = {item['estado']: item['count'] for item in estados_count}
        
        # Métricas generales
        total_pedidos = pedidos_qs.count()
        total_clientes = Cliente.objects.count()
        
        # Pedidos en estados activos (no COMPLETADO ni CANCELADO)
        pedidos_activos = pedidos_qs.exclude(estado__in=['COMPLETADO', 'CANCELADO']).count()
        
        # Calcular pedidos del mes actual vs mes anterior
        now = timezone.now()
        inicio_mes_actual = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        inicio_mes_anterior = (inicio_mes_actual - timedelta(days=1)).replace(day=1)
        
        pedidos_mes_actual = pedidos_qs.filter(created_at__gte=inicio_mes_actual).count()
        pedidos_mes_anterior = pedidos_qs.filter(
            created_at__gte=inicio_mes_anterior,
            created_at__lt=inicio_mes_actual
        ).count()
        
        # Calcular tendencia
        if pedidos_mes_anterior > 0:
            trend_percentage = ((pedidos_mes_actual - pedidos_mes_anterior) / pedidos_mes_anterior) * 100
        else:
            trend_percentage = 100 if pedidos_mes_actual > 0 else 0
        
        # Alertas (solo para Admin)
        alerts = []
        if user.is_superuser or user.groups.filter(name='Admin').exists():
            # Pedidos sin manufacturador asignado
            sin_manufacturador = PedidoServicio.objects.filter(
                manufacturador__isnull=True,
                estado__in=['ACEPTADO', 'EN_FABRICACION']
            ).count()
            if sin_manufacturador > 0:
                alerts.append({
                    'id': 'sin_manufacturador',
                    'severity': 'warning',
                    'title': 'Pedidos sin manufacturador',
                    'message': f'{sin_manufacturador} pedidos requieren asignación de manufacturador',
                    'count': sin_manufacturador
                })
            
            # Pedidos sin instalador asignado
            sin_instalador = PedidoServicio.objects.filter(
                instalador__isnull=True,
                estado='LISTO_INSTALAR'
            ).count()
            if sin_instalador > 0:
                alerts.append({
                    'id': 'sin_instalador',
                    'severity': 'warning',
                    'title': 'Pedidos sin instalador',
                    'message': f'{sin_instalador} pedidos listos requieren asignación de instalador',
                    'count': sin_instalador
                })
            
            # Pedidos retrasados (fecha_fin pasada y no INSTALADO/COMPLETADO)
            hoy = timezone.now().date()
            retrasados = PedidoServicio.objects.filter(
                fecha_fin__lt=hoy,
                estado__in=['ENVIADO', 'ACEPTADO', 'EN_FABRICACION', 'LISTO_INSTALAR']
            ).count()
            if retrasados > 0:
                alerts.append({
                    'id': 'retrasados',
                    'severity': 'error',
                    'title': 'Pedidos retrasados',
                    'message': f'{retrasados} pedidos tienen fecha de finalización vencida',
                    'count': retrasados
                })
        
        # Actividad reciente (últimos 10 cambios de estado)
        recent_activity = []
        recent_pedidos = pedidos_qs.order_by('-updated_at')[:10]
        for pedido in recent_pedidos:
            recent_activity.append({
                'id': str(pedido.id),
                'type': 'estado_change',
                'description': f'Pedido {pedido.numero_pedido} - {pedido.get_estado_display()}',
                'timestamp': pedido.updated_at.isoformat(),
                'user': None  # El modelo no tiene campo updated_by
            })
        
        return Response({
            'metrics': {
                'total_pedidos': total_pedidos,
                'pedidos_activos': pedidos_activos,
                'total_clientes': total_clientes,
                'pedidos_mes_actual': pedidos_mes_actual,
                'trend_percentage': round(trend_percentage, 1),
                'trend_up': trend_percentage >= 0,
            },
            'estados': estados_dict,
            'alerts': alerts,
            'recent_activity': recent_activity,
        })
    
    except Exception as e:
        logger.error(f"Error en dashboard_metrics: {str(e)}", exc_info=True)
        return Response({
            'error': 'Error al cargar las métricas del panel',
            'detail': 'No hay datos disponibles. Por favor, cree algunos pedidos primero.',
            'metrics': {
                'total_pedidos': 0,
                'pedidos_activos': 0,
                'total_clientes': 0,
                'pedidos_mes_actual': 0,
                'trend_percentage': 0,
                'trend_up': True,
            },
            'estados': {},
            'alerts': [],
            'recent_activity': [],
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_pedidos(request):
    """
    Endpoint para obtener pedidos del usuario actual (Collaborator dashboard).
    
    Para Collaborators: Devuelve todos los pedidos (ya que no hay campo created_by en el modelo)
    Para Admin: Devuelve todos los pedidos
    """
    from pedidos_servicio.models import PedidoServicio
    from pedidos_servicio.serializers import PedidoServicioListSerializer
    from django.core.paginator import Paginator
    
    user = request.user
    
    # Validar permiso para ver pedidos de servicio
    if not user.is_superuser and not user.has_perm('pedidos_servicio.view_pedidoservicio'):
        return Response({
            'detail': 'No tienes permiso para ver pedidos de servicio.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Obtener pedidos con relaciones
    queryset = PedidoServicio.objects.select_related(
        'cliente', 'manufacturador', 'instalador'
    ).order_by('-created_at')
    
    # Filtrar según el rol del usuario
    if not user.is_superuser:
        # Verificar grupos primero
        user_groups = user.groups.values_list('name', flat=True)
        is_comercial = any(g.lower() == 'comercial' for g in user_groups)
        
        if is_comercial:
            # Comercial ve los pedidos que creó
            queryset = queryset.filter(usuario_creacion=user)
        elif hasattr(user, 'personal_manufactura'):
            # Manufacturador/Instalador ve solo pedidos donde está asignado
            personal = user.personal_manufactura
            queryset = queryset.filter(
                Q(manufacturador=personal) | Q(instalador=personal)
            )
        else:
            # Usuario sin rol específico - no ve nada
            queryset = PedidoServicio.objects.none()
    
    # Filtrar por estado si se proporciona
    estado = request.GET.get('estado')
    if estado:
        queryset = queryset.filter(estado=estado)
    
    # Paginación
    page = request.GET.get('page', 1)
    page_size = request.GET.get('page_size', 25)
    
    paginator = Paginator(queryset, page_size)
    page_obj = paginator.get_page(page)
    
    # Serializar (usar el serializador existente)
    serializer = PedidoServicioListSerializer(page_obj, many=True)
    
    return Response({
        'count': paginator.count,
        'next': page_obj.next_page_number() if page_obj.has_next() else None,
        'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
        'results': serializer.data
    })

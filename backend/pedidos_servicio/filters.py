import django_filters
from .models import PedidoServicio


class PedidoServicioFilter(django_filters.FilterSet):
    """
    Filtros avanzados para el listado de Pedidos de Servicio.
    
    Filtros disponibles:
    - estado: Filtro exacto por estado del pedido
    - cliente: Filtro por ID de cliente
    - manufacturador: Filtro por ID de manufacturador
    - instalador: Filtro por ID de instalador
    - fecha_emision_desde: Fecha emisión >= valor
    - fecha_emision_hasta: Fecha emisión <= valor
    - fecha_desde: Fecha inicio >= valor
    - fecha_hasta: Fecha inicio <= valor
    
    Nota: La búsqueda de texto (?search=) es manejada por SearchFilter en el ViewSet,
    que busca en numero_pedido, cliente__nombre y solicitante.
    """

    # Filtros de rango de fecha de emisión
    fecha_emision_desde = django_filters.DateFilter(
        field_name='fecha_emision',
        lookup_expr='gte',
        label='Fecha Emisión (Desde)'
    )

    fecha_emision_hasta = django_filters.DateFilter(
        field_name='fecha_emision',
        lookup_expr='lte',
        label='Fecha Emisión (Hasta)'
    )

    # Filtros de rango de fecha de inicio
    fecha_desde = django_filters.DateFilter(
        field_name='fecha_inicio',
        lookup_expr='gte',
        label='Fecha Inicio (Desde)'
    )

    fecha_hasta = django_filters.DateFilter(
        field_name='fecha_inicio',
        lookup_expr='lte',
        label='Fecha Inicio (Hasta)'
    )

    # Filtros por relaciones
    cliente = django_filters.NumberFilter(
        field_name='cliente__id',
        label='Cliente (ID)'
    )

    manufacturador = django_filters.NumberFilter(
        field_name='manufacturador__id',
        label='Manufacturador (ID)'
    )

    instalador = django_filters.NumberFilter(
        field_name='instalador__id',
        label='Instalador (ID)'
    )

    class Meta:
        model = PedidoServicio
        fields = [
            'estado',
            'cliente',
            'manufacturador',
            'instalador',
            'fecha_desde',
            'fecha_hasta',
        ]

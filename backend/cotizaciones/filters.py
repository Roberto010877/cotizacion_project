import django_filters
from .models import Cotizacion


class CotizacionFilter(django_filters.FilterSet):
    """
    Filtros avanzados para el listado de Cotizaciones.
    
    Filtros disponibles:
    - estado: Filtro exacto por estado
    - cliente: Filtro por ID de cliente
    - vendedor: Filtro por ID de vendedor
    - fecha_desde: Fecha de emisión >= valor
    - fecha_hasta: Fecha de emisión <= valor
    - total_min: Total general >= valor
    - total_max: Total general <= valor
    
    Nota: La búsqueda de texto (?search=) es manejada por SearchFilter en el ViewSet,
    que busca en numero y cliente__nombre.
    """

    # Filtros de rango de fecha
    fecha_desde = django_filters.DateFilter(
        field_name='fecha_emision',
        lookup_expr='gte',
        label='Fecha de Emisión (Desde)'
    )

    fecha_hasta = django_filters.DateFilter(
        field_name='fecha_emision',
        lookup_expr='lte',
        label='Fecha de Emisión (Hasta)'
    )

    # Filtros por relaciones
    cliente = django_filters.NumberFilter(
        field_name='cliente__id',
        label='Cliente (ID)'
    )

    vendedor = django_filters.NumberFilter(
        field_name='vendedor__id',
        label='Vendedor (ID)'
    )

    # Filtros de rango de total
    total_min = django_filters.NumberFilter(
        field_name='total_general',
        lookup_expr='gte',
        label='Total Mínimo'
    )

    total_max = django_filters.NumberFilter(
        field_name='total_general',
        lookup_expr='lte',
        label='Total Máximo'
    )

    class Meta:
        model = Cotizacion
        fields = [
            'estado',
            'cliente',
            'vendedor',
            'fecha_desde',
            'fecha_hasta',
            'total_min',
            'total_max',
        ]

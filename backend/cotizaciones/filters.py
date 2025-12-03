import django_filters
from django.db.models import Q
from .models import Cotizacion


class CotizacionFilter(django_filters.FilterSet):
    """
    Filtros avanzados para el listado de Cotizaciones.
    Implementación de la Sección 5.3 del Documento de Arquitectura.
    """

    # 1. Búsqueda por Número de Cotización (flexible)
    numero = django_filters.CharFilter(
        lookup_expr='icontains',
        label='Número de Cotización'
    )

    # 2. Búsqueda por Nombre de Cliente (icontains en el campo nombre del modelo Cliente)
    cliente_nombre = django_filters.CharFilter(
        field_name='cliente__nombre',
        lookup_expr='icontains',
        label='Nombre del Cliente'
    )

    # 3. Filtro de Rango: Desde (mayor o igual)
    fecha_desde = django_filters.DateFilter(
        field_name='fecha_emision',
        lookup_expr='gte',
        label='Fecha de Emisión (Desde)'
    )

    # 4. Filtro de Rango: Hasta (menor o igual)
    fecha_hasta = django_filters.DateFilter(
        field_name='fecha_emision',
        lookup_expr='lte',
        label='Fecha de Emisión (Hasta)'
    )

    # 5. Búsqueda Genérica: (Parámetro ?search=)
    search = django_filters.CharFilter(
        method='filter_general_search', label='Búsqueda General')

    def filter_general_search(self, queryset, name, value):
        # Búsqueda en Número O Nombre de Cliente
        return queryset.filter(
            Q(numero__icontains=value) |
            Q(cliente__nombre__icontains=value)
        )

    class Meta:
        model = Cotizacion
        fields = ['numero', 'cliente_nombre',
                  'estado', 'fecha_desde', 'fecha_hasta']

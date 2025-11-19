# clientes/filters.py
import django_filters
from django.db import models
from django.utils import timezone
from datetime import timedelta

class ClienteFilter(django_filters.FilterSet):
    nombre = django_filters.CharFilter(lookup_expr='icontains')
    pais = django_filters.NumberFilter(field_name='pais_id')
    tipo_documento = django_filters.NumberFilter(field_name='tipo_documento_id')
    
    # SOLUCIÓN: Definir choices manualmente en lugar de importar del modelo
    tipo = django_filters.ChoiceFilter(
        choices=[
            ('NUEVO', 'Nuevo'),
            ('RECURRENTE', 'Recurrente'), 
            ('VIP', 'VIP')
        ]
    )
    
    origen = django_filters.ChoiceFilter(
        choices=[
            ('RECOMENDACION', 'Recomendación'),
            ('WEB', 'Sitio Web'),
            ('COLABORADOR', 'Colaborador'),
            ('REDES_SOCIALES', 'Redes Sociales'),
            ('FERIA', 'Feria o Evento'),
            ('OTRO', 'Otro')
        ]
    )
    
    es_empresa = django_filters.BooleanFilter(method='filter_es_empresa')
    activo = django_filters.BooleanFilter(method='filter_activo')
    fecha_desde = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    fecha_hasta = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        # Importar aquí para evitar circular dependency
        from .models import Cliente
        model = Cliente
        fields = [
            'nombre', 'pais', 'tipo_documento', 'tipo', 'origen',
            'es_empresa', 'activo', 'fecha_desde', 'fecha_hasta'
        ]
    
    def filter_es_empresa(self, queryset, name, value):
        """
        Filtra por si el cliente es empresa o persona natural.
        """
        return queryset.filter(tipo_documento__es_para_empresa=value)
    
    def filter_activo(self, queryset, name, value):
        """
        Filtra por clientes activos (con compras recientes).
        """
        six_months_ago = timezone.now() - timedelta(days=180)
        if value:
            return queryset.filter(fecha_ultima_compra__gte=six_months_ago)
        return queryset.filter(
            models.Q(fecha_ultima_compra__lt=six_months_ago) | models.Q(fecha_ultima_compra__isnull=True)
        )

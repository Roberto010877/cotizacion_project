from rest_framework import serializers
from .models import ProductoServicio


class ProductoServicioSerializer(serializers.ModelSerializer):
    """
    Serializador principal para el catálogo de productos y servicios.
    Expone el JSON de configuracion_ui al Frontend.
    """
    class Meta:
        model = ProductoServicio
        fields = [
            'id', 'codigo', 'nombre', 'tipo_producto', 'unidad_medida',
            'precio_base', 'requiere_medidas', 'configuracion_ui', 'is_active'
        ]
        read_only_fields = ['is_active']

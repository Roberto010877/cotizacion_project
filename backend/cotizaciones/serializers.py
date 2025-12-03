from rest_framework import serializers
from django.db import transaction
from .models import Cotizacion, ItemCotizacion
from productos_servicios.models import ProductoServicio


class ItemCotizacionSerializer(serializers.ModelSerializer):
    """Serializador para el detalle (Items) de la Cotización."""

    # Campo de solo lectura para el nombre del producto (utilidad para el Frontend)
    producto_nombre = serializers.CharField(
        source='producto.nombre', read_only=True)

    class Meta:
        model = ItemCotizacion
        fields = [
            'id', 'numero_item', 'producto', 'producto_nombre', 'cantidad',
            'ancho', 'alto', 'atributos_especificos', 'descripcion_completa',
            'precio_unitario', 'precio_total'
        ]
        read_only_fields = ['precio_total']


class CotizacionSerializer(serializers.ModelSerializer):
    """Serializador para el encabezado de la Cotización."""

    # Relación de escritura: Permite crear o actualizar items al guardar la cotización
    items = ItemCotizacionSerializer(many=True)

    # Campos de solo lectura para visibilidad en el listado
    cliente_nombre = serializers.CharField(
        source='cliente.nombre', read_only=True)
    vendedor_nombre = serializers.CharField(
        source='vendedor.nombre', read_only=True)

    class Meta:
        model = Cotizacion
        fields = [
            'id', 'numero', 'cliente', 'cliente_nombre', 'vendedor', 'vendedor_nombre',
            'fecha_emision', 'fecha_validez', 'estado', 'total_general',
            'observaciones', 'items'
        ]
        read_only_fields = ['numero', 'total_general']

    def create(self, validated_data):
        # 1. Extraer los items antes de guardar la cotización
        items_data = validated_data.pop('items')

        # 2. Utilizar Atomicidad (Sección 7.1)
        with transaction.atomic():
            # 3. Crear el encabezado de la cotización
            cotizacion = Cotizacion.objects.create(**validated_data)

            # 4. Crear los items y vincularlos
            for item_data in items_data:
                producto = item_data.pop('producto')

                ItemCotizacion.objects.create(
                    cotizacion=cotizacion,
                    producto=producto,
                    **item_data
                )

            # TODO: Llamar a la lógica de recalculate_totals() después de crear los ítems

            return cotizacion

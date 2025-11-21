from rest_framework import serializers
from .models import Cotizacion, DetalleCotizacion
from productos.models import Producto
from clientes.serializers import ClienteSerializer
from clientes.models import Cliente
# Serializador simple para mostrar información del producto en los detalles
class ProductoDetalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'descripcion']

class DetalleCotizacionSerializer(serializers.ModelSerializer):
    # Usamos un serializador de solo lectura para mostrar los datos del producto
    producto = ProductoDetalleSerializer(read_only=True)
    # Usamos un campo de solo escritura para recibir el ID del producto al crear/actualizar
    producto_id = serializers.PrimaryKeyRelatedField(
        queryset=Producto.objects.all(), source='producto', write_only=True
    )

    class Meta:
        model = DetalleCotizacion
        fields = ['id', 'producto', 'producto_id', 'cantidad', 'precio_unitario', 'subtotal']
        read_only_fields = ['subtotal']

class CotizacionSerializer(serializers.ModelSerializer):
    detalles = DetalleCotizacionSerializer(many=True)
    cliente = ClienteSerializer(read_only=True)
    cliente_id = serializers.PrimaryKeyRelatedField(
        queryset=Cliente.objects.all(), source='cliente', write_only=True
    )

    class Meta:
        model = Cotizacion
        fields = [
            'id', 'numero_cotizacion', 'cliente', 'cliente_id', 'fecha_vencimiento', 'estado', 
            'total', 'observaciones', 'creado_por', 'created_at', 'updated_at', 'detalles'
        ]
        read_only_fields = ['numero_cotizacion', 'total', 'creado_por', 'created_at', 'updated_at']

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        cotizacion = Cotizacion.objects.create(**validated_data)
        total_cotizacion = 0
        for detalle_data in detalles_data:
            detalle = DetalleCotizacion.objects.create(cotizacion=cotizacion, **detalle_data)
            total_cotizacion += detalle.subtotal
        
        cotizacion.total = total_cotizacion
        cotizacion.save()
        return cotizacion

    def update(self, instance, validated_data):
        # La lógica de actualización de detalles puede ser compleja (añadir, quitar, modificar).
        # Por simplicidad, aquí solo actualizamos los campos de la cotización principal.
        # Una implementación más avanzada manejaría los detalles anidados.
        instance.estado = validated_data.get('estado', instance.estado)
        instance.observaciones = validated_data.get('observaciones', instance.observaciones)
        instance.fecha_vencimiento = validated_data.get('fecha_vencimiento', instance.fecha_vencimiento)
        instance.save()
        return instance
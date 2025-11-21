from rest_framework import serializers
from .models import OrdenCompra, DetalleOrdenCompra
from productos.models import Producto
from proveedores.models import Proveedor
from proveedores.serializers import ProveedorSerializer

class ProductoDetalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'descripcion']

class DetalleOrdenCompraSerializer(serializers.ModelSerializer):
    producto = ProductoDetalleSerializer(read_only=True)
    producto_id = serializers.PrimaryKeyRelatedField(
        queryset=Producto.objects.all(), source='producto', write_only=True
    )

    class Meta:
        model = DetalleOrdenCompra
        fields = ['id', 'producto', 'producto_id', 'cantidad', 'costo_unitario', 'subtotal']
        read_only_fields = ['subtotal']

class OrdenCompraSerializer(serializers.ModelSerializer):
    detalles = DetalleOrdenCompraSerializer(many=True)
    proveedor = ProveedorSerializer(read_only=True)
    proveedor_id = serializers.PrimaryKeyRelatedField(
        queryset=Proveedor.objects.all(), source='proveedor', write_only=True
    )

    class Meta:
        model = OrdenCompra
        fields = [
            'id', 'numero_orden', 'proveedor', 'proveedor_id', 'fecha_entrega_prevista', 'estado', 
            'total', 'observaciones', 'creado_por', 'created_at', 'updated_at', 'detalles'
        ]
        read_only_fields = ['numero_orden', 'total', 'creado_por', 'created_at', 'updated_at']

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        orden_compra = OrdenCompra.objects.create(**validated_data)
        total_orden = 0
        for detalle_data in detalles_data:
            detalle = DetalleOrdenCompra.objects.create(orden_compra=orden_compra, **detalle_data)
            total_orden += detalle.subtotal
        
        orden_compra.total = total_orden
        orden_compra.save()
        return orden_compra

    def update(self, instance, validated_data):
        instance.estado = validated_data.get('estado', instance.estado)
        instance.observaciones = validated_data.get('observaciones', instance.observaciones)
        instance.fecha_entrega_prevista = validated_data.get('fecha_entrega_prevista', instance.fecha_entrega_prevista)
        instance.save()
        return instance

from rest_framework import serializers
from django.utils import timezone
from .models import PedidoServicio, ItemPedidoServicio
from clientes.models import Cliente
from manufactura.models import Manufactura


# -------------------------
# CLIENTE
# -------------------------
class ClienteBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'nombre', 'numero_documento', 'email', 'telefono', 'num_contacto', 'direccion']
        read_only_fields = fields


# -------------------------
# COLABORADOR (manufacturador / INSTALADOR)
# -------------------------
class ColaboradorBasicSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    def get_full_name(self, obj):
        if obj is None:
            return None
        return f"{obj.nombre} {obj.apellido}".strip()

    class Meta:
        model = Manufactura
        fields = ['id', 'full_name', 'documento', 'email', 'especialidad', 'estado']
        read_only_fields = fields


# -------------------------
# ITEM
# -------------------------
class ItemPedidoServicioSerializer(serializers.ModelSerializer):

    posicion_tejido_display = serializers.CharField(source='get_posicion_tejido_display', read_only=True)
    lado_comando_display = serializers.CharField(source='get_lado_comando_display', read_only=True)
    acionamiento_display = serializers.CharField(source='get_acionamiento_display', read_only=True)
    
    # Campos de fecha/hora con zona horaria local
    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()

    def get_created_at(self, obj):
        if obj.created_at:
            return timezone.localtime(obj.created_at).isoformat()
        return None

    def get_updated_at(self, obj):
        if obj.updated_at:
            return timezone.localtime(obj.updated_at).isoformat()
        return None

    class Meta:
        model = ItemPedidoServicio
        fields = [
            'id', 'numero_item', 'ambiente', 'modelo', 'tejido',
            'largura', 'altura', 'cantidad_piezas',
            'posicion_tejido', 'posicion_tejido_display',
            'lado_comando', 'lado_comando_display',
            'acionamiento', 'acionamiento_display',
            'observaciones', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'numero_item', 'created_at', 'updated_at']


# -------------------------
# PEDIDO COMPLETO (CREATE / UPDATE)
# -------------------------
class PedidoServicioSerializer(serializers.ModelSerializer):

    cliente = ClienteBasicSerializer(read_only=True)
    cliente_id = serializers.PrimaryKeyRelatedField(
        queryset=Cliente.objects.all(), write_only=True, source='cliente'
    )

    manufacturador = ColaboradorBasicSerializer(read_only=True)
    manufacturador_id = serializers.PrimaryKeyRelatedField(
        queryset=Manufactura.objects.all(),
        write_only=True,
        source='manufacturador',
        required=False,
        allow_null=True
    )

    instalador = ColaboradorBasicSerializer(read_only=True)
    instalador_id = serializers.PrimaryKeyRelatedField(
        queryset=Manufactura.objects.all(),
        write_only=True,
        source='instalador',
        required=False,
        allow_null=True
    )

    items = ItemPedidoServicioSerializer(many=True, read_only=True)

    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    solicitante_nombre = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()

    def get_created_at(self, obj):
        if obj.created_at:
            return timezone.localtime(obj.created_at).isoformat()
        return None

    def get_updated_at(self, obj):
        if obj.updated_at:
            return timezone.localtime(obj.updated_at).isoformat()
        return None

    def get_solicitante_nombre(self, obj):
        if obj.usuario_creacion:
            return obj.usuario_creacion.get_full_name()
        return None

    class Meta:
        model = PedidoServicio
        fields = [
            'id',
            'numero_pedido',
            'solicitante_nombre',
            'cliente',
            'cliente_id',
            'manufacturador',
            'manufacturador_id',
            'instalador',
            'instalador_id',
            'supervisor',
            'fecha_emision',
            'fecha_inicio',
            'fecha_fin',
            'estado',
            'estado_display',
            'observaciones',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'numero_pedido', 'created_at', 'updated_at']


# -------------------------
# LISTADO
# -------------------------
class PedidoServicioListSerializer(serializers.ModelSerializer):

    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    total_items = serializers.IntegerField(source='items.count', read_only=True)

    manufacturador_nombre = serializers.SerializerMethodField()
    instalador_nombre = serializers.SerializerMethodField()
    solicitante_nombre = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()

    def get_created_at(self, obj):
        if obj.created_at:
            return timezone.localtime(obj.created_at).isoformat()
        return None

    def get_manufacturador_nombre(self, obj):
        return f"{obj.manufacturador.nombre} {obj.manufacturador.apellido}".strip() if obj.manufacturador else None

    def get_instalador_nombre(self, obj):
        return f"{obj.instalador.nombre} {obj.instalador.apellido}".strip() if obj.instalador else None

    def get_solicitante_nombre(self, obj):
        if obj.usuario_creacion:
            return obj.usuario_creacion.get_full_name()
        return None

    class Meta:
        model = PedidoServicio
        fields = [
            'id',
            'numero_pedido',
            'solicitante_nombre',
            'cliente_nombre',
            'manufacturador_nombre',
            'instalador_nombre',
            'supervisor',
            'fecha_emision',
            'fecha_inicio',
            'fecha_fin',
            'estado',
            'estado_display',
            'total_items',
            'created_at',
        ]


# -------------------------
# DETALLE
# -------------------------
class PedidoServicioDetailSerializer(serializers.ModelSerializer):

    cliente = ClienteBasicSerializer(read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    manufacturador = ColaboradorBasicSerializer(read_only=True)
    instalador = ColaboradorBasicSerializer(read_only=True)
    items = ItemPedidoServicioSerializer(many=True, read_only=True)

    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    solicitante_nombre = serializers.SerializerMethodField()
    manufacturador_nombre = serializers.SerializerMethodField()
    instalador_nombre = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()

    def get_created_at(self, obj):
        if obj.created_at:
            return timezone.localtime(obj.created_at).isoformat()
        return None

    def get_updated_at(self, obj):
        if obj.updated_at:
            return timezone.localtime(obj.updated_at).isoformat()
        return None

    def get_solicitante_nombre(self, obj):
        if obj.usuario_creacion:
            return obj.usuario_creacion.get_full_name()
        return None

    def get_manufacturador_nombre(self, obj):
        return f"{obj.manufacturador.nombre} {obj.manufacturador.apellido}".strip() if obj.manufacturador else None

    def get_instalador_nombre(self, obj):
        return f"{obj.instalador.nombre} {obj.instalador.apellido}".strip() if obj.instalador else None

    class Meta:
        model = PedidoServicio
        fields = [
            'id',
            'numero_pedido',
            'solicitante_nombre',
            'cliente',
            'cliente_nombre',
            'manufacturador',
            'manufacturador_nombre',
            'instalador',
            'instalador_nombre',
            'supervisor',
            'fecha_inicio',
            'fecha_fin',
            'estado',
            'estado_display',
            'observaciones',
            'items',
            'created_at',
            'updated_at',
        ]

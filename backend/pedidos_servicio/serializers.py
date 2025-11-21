from rest_framework import serializers
from .models import PedidoServicio, ItemPedidoServicio
from clientes.models import Cliente
from instaladores.models import Instalador
from django.contrib.auth import get_user_model

User = get_user_model()


class ClienteBasicSerializer(serializers.ModelSerializer):
    """Serializer básico para Cliente (lectura)"""
    
    class Meta:
        model = Cliente
        fields = ['id', 'nombre', 'numero_documento', 'email', 'telefono']
        read_only_fields = fields


class ColaboradorBasicSerializer(serializers.ModelSerializer):
    """Serializer básico para Instalador (lectura)"""
    
    full_name = serializers.CharField(
        source='get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Instalador
        fields = ['id', 'full_name', 'documento', 'email', 'especialidad', 'estado']
        read_only_fields = fields


class ItemPedidoServicioCreateSerializer(serializers.Serializer):
    """Serializer para crear items anidados"""
    ambiente = serializers.CharField(max_length=100)
    modelo = serializers.CharField(max_length=100)
    tejido = serializers.CharField(max_length=100)
    largura = serializers.FloatField()
    altura = serializers.FloatField()
    cantidad_piezas = serializers.IntegerField()
    posicion_tejido = serializers.CharField(max_length=20, default='NORMAL')
    lado_comando = serializers.CharField(max_length=20, default='IZQUIERDO')
    acionamiento = serializers.CharField(max_length=20, default='MANUAL')
    observaciones = serializers.CharField(required=False, allow_blank=True)


class ItemPedidoServicioSerializer(serializers.ModelSerializer):
    """Serializer para Items de PedidoServicio"""
    
    posicion_tejido_display = serializers.CharField(
        source='get_posicion_tejido_display',
        read_only=True
    )
    
    lado_comando_display = serializers.CharField(
        source='get_lado_comando_display',
        read_only=True
    )
    
    acionamiento_display = serializers.CharField(
        source='get_acionamiento_display',
        read_only=True
    )
    
    class Meta:
        model = ItemPedidoServicio
        fields = [
            'id',
            'numero_item',
            'ambiente',
            'modelo',
            'tejido',
            'largura',
            'altura',
            'cantidad_piezas',
            'posicion_tejido',
            'posicion_tejido_display',
            'lado_comando',
            'lado_comando_display',
            'acionamiento',
            'acionamiento_display',
            'observaciones',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]


class PedidoServicioSerializer(serializers.ModelSerializer):
    """Serializer completo para PedidoServicio con items anidados"""
    
    cliente = ClienteBasicSerializer(read_only=True)
    cliente_id = serializers.PrimaryKeyRelatedField(
        queryset=Cliente.objects.all(),
        write_only=True,
        source='cliente'
    )
    
    colaborador = ColaboradorBasicSerializer(read_only=True)
    colaborador_id = serializers.PrimaryKeyRelatedField(
        queryset=Instalador.objects.all(),
        write_only=True,
        source='colaborador',
        required=False,
        allow_null=True
    )
    
    items = ItemPedidoServicioSerializer(
        many=True,
        read_only=True
    )
    
    items_data = ItemPedidoServicioCreateSerializer(
        many=True,
        write_only=True,
        required=False
    )
    
    estado_display = serializers.CharField(
        source='get_estado_display',
        read_only=True
    )
    
    class Meta:
        model = PedidoServicio
        fields = [
            'id',
            'numero_pedido',
            'solicitante',
            'cliente',
            'cliente_id',
            'colaborador',
            'colaborador_id',
            'supervisor',
            'fecha_inicio',
            'fecha_fin',
            'estado',
            'estado_display',
            'observaciones',
            'items',
            'items_data',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'numero_pedido',
            'created_at',
            'updated_at',
        ]
    
    def create(self, validated_data):
        """Crear nuevo pedido de servicio con items anidados"""
        items_data = validated_data.pop('items_data', [])
        pedido = PedidoServicio.objects.create(**validated_data)
        
        # Crear items asociados con número de item secuencial
        for index, item_data in enumerate(items_data, start=1):
            ItemPedidoServicio.objects.create(
                pedido_servicio=pedido,
                numero_item=index,
                **item_data
            )
        
        return pedido
    
    def update(self, instance, validated_data):
        """Actualizar pedido de servicio"""
        validated_data.pop('items_data', [])  # No actualizar items en PATCH
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class PedidoServicioListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listados"""
    
    cliente_nombre = serializers.CharField(
        source='cliente.nombre',
        read_only=True
    )
    
    colaborador_nombre = serializers.SerializerMethodField(
        help_text="Nombre completo del instalador/colaborador"
    )
    
    estado_display = serializers.CharField(
        source='get_estado_display',
        read_only=True
    )
    
    total_items = serializers.SerializerMethodField()
    
    class Meta:
        model = PedidoServicio
        fields = [
            'id',
            'numero_pedido',
            'solicitante',
            'cliente_nombre',
            'colaborador_nombre',
            'fecha_inicio',
            'fecha_fin',
            'estado',
            'estado_display',
            'total_items',
            'created_at',
        ]
        read_only_fields = fields
    
    def get_colaborador_nombre(self, obj):
        """Retorna el nombre completo del colaborador o vacío si no existe"""
        if obj.colaborador:
            return obj.colaborador.get_full_name() or obj.colaborador.username
        return None
    
    def get_total_items(self, obj):
        """Retorna la cantidad total de items en el pedido"""
        return obj.items.count()


class PedidoServicioDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado para visualización completa de un pedido"""
    
    cliente = ClienteBasicSerializer(read_only=True)
    colaborador = ColaboradorBasicSerializer(read_only=True)
    items = ItemPedidoServicioSerializer(
        many=True,
        read_only=True
    )
    estado_display = serializers.CharField(
        source='get_estado_display',
        read_only=True
    )
    
    class Meta:
        model = PedidoServicio
        fields = [
            'id',
            'numero_pedido',
            'solicitante',
            'cliente',
            'colaborador',
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
        read_only_fields = [
            'id',
            'numero_pedido',
            'created_at',
            'updated_at',
        ]


class AsignacionTareaSerializer(serializers.ModelSerializer):
    """Serializer para Asignaciones de Tareas"""
    
    pedido_numero = serializers.CharField(
        source='pedido.numero_pedido',
        read_only=True
    )
    
    instalador_nombre = serializers.CharField(
        source='instalador.get_full_name',
        read_only=True
    )
    
    tipo_tarea_display = serializers.CharField(
        source='get_tipo_tarea_display',
        read_only=True
    )
    
    estado_display = serializers.CharField(
        source='get_estado_display',
        read_only=True
    )
    
    # Items del pedido (anidados)
    pedido_items = ItemPedidoServicioSerializer(
        source='pedido.items',
        many=True,
        read_only=True
    )
    
    # Cliente del pedido
    cliente_nombre = serializers.CharField(
        source='pedido.cliente.nombre',
        read_only=True
    )
    
    cliente_telefono = serializers.CharField(
        source='pedido.cliente.telefono',
        read_only=True
    )
    
    # Solicitante
    solicitante = serializers.CharField(
        source='pedido.solicitante',
        read_only=True
    )
    
    # Observaciones del pedido
    observaciones_pedido = serializers.CharField(
        source='pedido.observaciones',
        read_only=True
    )
    
    class Meta:
        from .models import AsignacionTarea
        model = AsignacionTarea
        fields = [
            'id',
            'pedido',
            'pedido_numero',
            'cliente_nombre',
            'cliente_telefono',
            'solicitante',
            'instalador',
            'instalador_nombre',
            'tipo_tarea',
            'tipo_tarea_display',
            'estado',
            'estado_display',
            'fecha_asignacion',
            'fecha_inicio_real',
            'fecha_entrega_esperada',
            'fecha_completacion',
            'descripcion_tarea',
            'notas_progreso',
            'observaciones_pedido',
            'pedido_items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'fecha_asignacion',
            'created_at',
            'updated_at',
        ]


# clientes/serializers.py
from rest_framework import serializers
from .models import Cliente, Pais, TipoDocumentoConfig

class PaisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pais
        fields = ['id', 'codigo', 'nombre', 'codigo_telefono']

class TipoDocumentoConfigSerializer(serializers.ModelSerializer):
    pais_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = TipoDocumentoConfig
        fields = ['id', 'codigo', 'nombre', 'pais', 'pais_nombre', 'es_para_empresa']

    def get_pais_nombre(self, obj):
        try:
            return obj.pais.nombre
        except Pais.DoesNotExist:
            return None

class ClienteSerializer(serializers.ModelSerializer):
    pais_nombre = serializers.CharField(source='pais.nombre', read_only=True)
    tipo_documento_nombre = serializers.CharField(source='tipo_documento.nombre', read_only=True)
    es_empresa = serializers.BooleanField(read_only=True)
    es_cliente_activo = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Cliente
        fields = [
            'id', 'nombre', 'pais', 'pais_nombre', 'tipo_documento', 'tipo_documento_nombre',
            'numero_documento', 'direccion', 'telefono', 'email', 'tipo', 'origen',
            'numero_de_compras', 'total_gastado', 'es_empresa', 'es_cliente_activo',
            'fecha_ultima_compra', 'created_at'
        ]

class ClienteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = [
            'nombre', 'pais', 'direccion', 'telefono', 'email', 'origen',
            'preferencias_contacto', 'notas'
        ]
    
    def validate_pais(self, value):
        """
        Validación para País: debe estar presente.
        """
        if not value:
            raise serializers.ValidationError("El país es requerido")
        return value

class ClienteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = [
            'nombre', 'pais', 'direccion', 'telefono', 'email', 'tipo', 'origen',
            'fecha_nacimiento', 'preferencias_contacto', 'notas'
        ]

class ClienteDetailSerializer(ClienteSerializer):
    """Serializer detallado con todos los campos"""
    class Meta(ClienteSerializer.Meta):
        fields = '__all__'
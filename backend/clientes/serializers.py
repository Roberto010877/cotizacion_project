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
            'nombre', 'pais', 'tipo_documento', 'numero_documento',
            'direccion', 'telefono', 'email', 'origen', 'fecha_nacimiento',
            'preferencias_contacto', 'notas'
        ]
    
    def validate(self, data):
        """
        Validación personalizada para creación.
        """
        # Verificar que el tipo de documento pertenece al país
        if data.get('pais') and data.get('tipo_documento'):
            if data['pais'] != data['tipo_documento'].pais:
                raise serializers.ValidationError({
                    'tipo_documento': 'El tipo de documento no pertenece al país seleccionado'
                })
        
        return data

class ClienteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = [
            'nombre', 'direccion', 'telefono', 'email', 'origen',
            'fecha_nacimiento', 'preferencias_contacto', 'notas'
        ]

class ClienteDetailSerializer(ClienteSerializer):
    """Serializer detallado con todos los campos"""
    class Meta(ClienteSerializer.Meta):
        fields = '__all__'
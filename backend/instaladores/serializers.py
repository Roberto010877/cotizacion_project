from rest_framework import serializers
from .models import Instalador


class InstaladorBasicSerializer(serializers.ModelSerializer):
    """Serializador básico para Instalador con campos esenciales"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    is_disponible = serializers.SerializerMethodField()

    class Meta:
        model = Instalador
        fields = [
            'id',
            'full_name',
            'documento',
            'email',
            'telefono',
            'especialidad',
            'estado',
            'is_disponible',
        ]
        read_only_fields = ['id']

    def get_is_disponible(self, obj):
        return obj.is_disponible()


class InstaladorListSerializer(serializers.ModelSerializer):
    """Serializador para listar Instaladores"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    is_disponible = serializers.SerializerMethodField()

    class Meta:
        model = Instalador
        fields = [
            'id',
            'full_name',
            'documento',
            'email',
            'telefono',
            'ciudad',
            'especialidad',
            'estado',
            'estado_display',
            'calificacion',
            'total_instalaciones',
            'is_disponible',
        ]
        read_only_fields = ['id', 'total_instalaciones']

    def get_is_disponible(self, obj):
        return obj.is_disponible()


class InstaladorDetailSerializer(serializers.ModelSerializer):
    """Serializador detallado para obtener un Instalador específico"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    is_disponible = serializers.SerializerMethodField()

    class Meta:
        model = Instalador
        fields = [
            'id',
            'nombre',
            'apellido',
            'full_name',
            'documento',
            'email',
            'telefono',
            'ciudad',
            'estado',
            'estado_display',
            'fecha_contratacion',
            'especialidad',
            'calificacion',
            'total_instalaciones',
            'observaciones',
            'is_disponible',
        ]
        read_only_fields = ['id', 'total_instalaciones', 'fecha_contratacion']


class InstaladorCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializador para crear/actualizar Instaladores"""

    class Meta:
        model = Instalador
        fields = [
            'nombre',
            'apellido',
            'documento',
            'email',
            'telefono',
            'ciudad',
            'estado',
            'especialidad',
            'calificacion',
            'observaciones',
        ]

    def validate_documento(self, value):
        """Validar que el documento sea único"""
        instance = self.instance
        queryset = Instalador.objects.filter(documento=value)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Este documento ya existe.")
        return value

    def validate_email(self, value):
        """Validar que el email sea único"""
        instance = self.instance
        queryset = Instalador.objects.filter(email=value)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value

    def validate_calificacion(self, value):
        """Validar que la calificación esté entre 0 y 5"""
        if value is not None and (value < 0 or value > 5):
            raise serializers.ValidationError("La calificación debe estar entre 0 y 5.")
        return value

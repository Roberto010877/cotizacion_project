from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    manufactura_id = serializers.SerializerMethodField()
    manufactura_cargo = serializers.SerializerMethodField()
    manufactura_nombre = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role', 
            'is_active', 'language', 'password', 'manufactura_id', 
            'manufactura_cargo', 'manufactura_nombre', 'groups', 'permissions'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': True},
            'email': {'required': True},
            'role': {'required': True},
        }
    
    def get_groups(self, obj):
        """Retorna los nombres de los grupos del usuario"""
        return [group.name for group in obj.groups.all()]
    
    def get_permissions(self, obj):
        """Retorna los permisos del usuario en formato app_label.codename"""
        if obj.is_superuser:
            # Superuser tiene todos los permisos
            return ['*']
        
        # Obtener permisos del usuario (propios + de grupos)
        user_permissions = obj.get_all_permissions()
        return list(user_permissions)

    def get_manufactura_id(self, obj):
        """Retorna el ID de manufactura si existe"""
        try:
            if hasattr(obj, 'manufactura'):
                return obj.manufactura.id
        except:
            pass
        return None

    def get_manufactura_cargo(self, obj):
        """Retorna el cargo (FABRICADOR/INSTALADOR) si existe"""
        try:
            if hasattr(obj, 'manufactura'):
                return obj.manufactura.cargo
        except:
            pass
        return None

    def get_manufactura_nombre(self, obj):
        """Retorna el nombre completo del trabajador de manufactura"""
        try:
            if hasattr(obj, 'manufactura'):
                return f"{obj.manufactura.nombre} {obj.manufactura.apellido}"
        except:
            pass
        return None

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

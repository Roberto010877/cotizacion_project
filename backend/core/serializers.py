from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()
    manufactura_cargo = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'language', 
                  'is_active', 'permissions', 'groups', 'manufactura_cargo')
        read_only_fields = ('id', 'username', 'email', 'role')
    
    def get_permissions(self, obj):
        """
        Retorna la lista de permisos del usuario en formato 'app_label.codename'
        """
        # Obtener permisos del usuario (directos + de grupos)
        perms = obj.get_all_permissions()
        return list(perms)
    
    def get_groups(self, obj):
        """
        Retorna la lista de grupos del usuario
        """
        return [group.name for group in obj.groups.all()]
    
    def get_manufactura_cargo(self, obj):
        """
        Retorna el cargo de manufactura si el usuario tiene personal vinculado
        """
        if hasattr(obj, 'manufacturas'):
            personal = obj.manufacturas.first()
            if personal:
                return personal.cargo
        return None

class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'language', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': True},
            'email': {'required': True},
            'role': {'required': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserLanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('language',)

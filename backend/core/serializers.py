from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'language')
        read_only_fields = ('id', 'username', 'email', 'role')


class UserLanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('language',)
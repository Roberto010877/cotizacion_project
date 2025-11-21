from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer, UserLanguageSerializer


class CurrentUserView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UpdateLanguageView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserLanguageSerializer

    def get_object(self):
        return self.request.user

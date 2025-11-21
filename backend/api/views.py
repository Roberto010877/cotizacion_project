from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import UserSerializer

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'me':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """
        Return the authenticated user's data.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
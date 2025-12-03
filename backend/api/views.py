from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
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
        if self.action in ['me', 'language']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """
        Return the authenticated user's data.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch', 'get'], url_path='me/language')
    def language(self, request):
        """
        Update or retrieve the authenticated user's language preference.
        """
        user = request.user
        
        if request.method == 'PATCH':
            language = request.data.get('language')
            if language not in dict(User._meta.get_field('language').choices):
                return Response(
                    {'error': 'Invalid language choice'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.language = language
            user.save()
            return Response({'language': user.language, 'message': 'Language updated successfully'})
        
        # GET method
        return Response({'language': user.language})
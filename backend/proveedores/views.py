from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Proveedor
from .serializers import ProveedorSerializer

class ProveedorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para ver y editar proveedores.
    """
    queryset = Proveedor.objects.filter(is_active=True)
    serializer_class = ProveedorSerializer
    permission_classes = [IsAuthenticated]


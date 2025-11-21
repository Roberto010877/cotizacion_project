from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Producto
from .serializers import ProductoSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para ver y editar productos.
    """
    queryset = Producto.objects.filter(is_active=True)
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]


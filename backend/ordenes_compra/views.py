from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import OrdenCompra
from .serializers import OrdenCompraSerializer

class OrdenCompraViewSet(viewsets.ModelViewSet):
    """
    ViewSet para ver y editar órdenes de compra.
    """
    queryset = OrdenCompra.objects.prefetch_related('detalles__producto').select_related('proveedor', 'creado_por').all()
    serializer_class = OrdenCompraSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)


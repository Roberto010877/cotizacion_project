from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Cotizacion
from .serializers import CotizacionSerializer

class CotizacionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para ver y editar cotizaciones.
    """
    queryset = Cotizacion.objects.prefetch_related('detalles__producto').select_related('cliente', 'creado_por').all()
    serializer_class = CotizacionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Asigna automáticamente el usuario autenticado como creador de la cotización.
        serializer.save(creado_por=self.request.user)

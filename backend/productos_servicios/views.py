from rest_framework import viewsets, status
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import ProductoServicio
from .serializers import ProductoServicioSerializer


# Clase de Paginación corregida, ahora hereda de la importación correcta
class StandardPagination(PageNumberPagination):
    """Paginación estándar para el catálogo."""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


class ProductoServicioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la API del Catálogo de Productos/Servicios.
    Permite el CRUD y la búsqueda eficiente.
    """

    # Solo mostrar productos que no han sido eliminados lógicamente
    queryset = ProductoServicio.objects.filter(is_active=True).all()
    serializer_class = ProductoServicioSerializer
    pagination_class = StandardPagination

    # --- FILTROS ---
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['tipo_producto', 'unidad_medida']

    # Búsqueda global por texto
    search_fields = ['codigo', 'nombre']

    # Sobrescribir destroy para asegurar la eliminación lógica (soft-delete)
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

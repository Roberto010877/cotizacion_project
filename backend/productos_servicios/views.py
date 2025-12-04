# <--- FALTABA IMPORTAR filters
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import ProductoServicio
from .serializers import ProductoServicioSerializer


class StandardPagination(PageNumberPagination):
    """Paginación estándar para el catálogo."""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


class ProductoServicioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la API del Catálogo de Productos/Servicios.
    Permite el CRUD, filtrado avanzado y búsqueda por texto.
    """

    # Solo mostrar productos que no han sido eliminados lógicamente
    queryset = ProductoServicio.objects.filter(is_active=True).all()
    serializer_class = ProductoServicioSerializer
    pagination_class = StandardPagination

    # --- CONFIGURACIÓN DE FILTROS Y BÚSQUEDA ---
    filter_backends = [
        # Habilita filtros exactos (?tipo_producto=CORTINA)
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter  # Habilita ordenamiento (?ordering=precio_base)
    ]

    # 1. Filtros exactos (Selectores)
    filterset_fields = ['tipo_producto', 'unidad_medida']

    # 2. Búsqueda parcial (Input de texto) - Busca en código O nombre
    search_fields = ['codigo', 'nombre']

    # 3. Ordenamiento
    ordering_fields = ['nombre', 'precio_base', 'codigo']
    ordering = ['nombre']  # Orden por defecto

    # Sobrescribir destroy para asegurar la eliminación lógica (soft-delete)
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        # Necesitamos importar Response para que esto funcione (ya agregado arriba)
        return Response(status=status.HTTP_204_NO_CONTENT)

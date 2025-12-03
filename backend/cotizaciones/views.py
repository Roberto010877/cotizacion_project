from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from .models import Cotizacion
from .serializers import CotizacionSerializer
from .filters import CotizacionFilter
# from .permissions import CotizacionPermission # Se implementaría aquí el custom permission


class StandardPagination(PageNumberPagination):
    """Paginación estándar de servidor (Sección 5.1)."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class CotizacionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la API de Cotizaciones.
    Aplica paginación, filtros avanzados y control de lógica de negocio.
    """

    # Filtro por defecto: Solo cotizaciones activas (eliminación lógica)
    queryset = Cotizacion.objects.filter(
        is_active=True).select_related('cliente', 'vendedor')
    serializer_class = CotizacionSerializer
    pagination_class = StandardPagination

    # --- CONFIGURACIÓN DE BÚSQUEDA Y FILTROS ---
    filter_backends = [DjangoFilterBackend]
    filterset_class = CotizacionFilter
    # permission_classes = [IsAuthenticated, CotizacionPermission] # Ejemplo de uso

    # Sobrescribir destroy para asegurar la eliminación lógica (Sección 5.4)
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # --- ACCIÓN: ACEPTAR COTIZACIÓN (Sección 5.2) ---
    @action(detail=True, methods=['post'], url_path='aceptar')
    def accept_cotizacion(self, request, pk=None):
        cotizacion = self.get_object()

        # Validar permiso de negocio: can_change_status_accepted
        if not request.user.has_perm('cotizaciones.can_change_status_accepted'):
            return Response({"detail": "Permiso denegado: Se requiere permiso para aprobar cotizaciones."},
                            status=status.HTTP_403_FORBIDDEN)

        if cotizacion.estado != Cotizacion.EstadoCotizacion.ENVIADA:
            return Response({"detail": "La cotización debe estar en estado ENVIADA para ser aceptada."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Implementación de la Conversión Atómica a PedidoServicio (Sección 7.3)
        # TODO: Implementar un Service Layer que gestione la creación del PedidoServicio y la actualización de estado.

        cotizacion.estado = Cotizacion.EstadoCotizacion.ACEPTADA
        cotizacion.save()

        return Response(self.serializer_class(cotizacion).data)

    # --- ACCIÓN: CLONAR COTIZACIÓN (Sección 3.4) ---
    @action(detail=True, methods=['post'], url_path='clonar')
    def clone_cotizacion(self, request, pk=None):
        original = self.get_object()

        # El ID del nuevo cliente puede venir en el cuerpo de la solicitud
        nuevo_cliente_id = request.data.get('cliente_id')

        from clientes.models import Cliente

        # Usar transacción para asegurar que la clonación sea atómica
        with transaction.atomic():
            # 1. Crear nuevo encabezado
            nueva_cotizacion = original
            nueva_cotizacion.pk = None  # Reinicia la PK para crear uno nuevo
            # Reinicia el número (se generará uno nuevo en save)
            nueva_cotizacion.numero = None
            nueva_cotizacion.estado = Cotizacion.EstadoCotizacion.BORRADOR

            if nuevo_cliente_id:
                try:
                    nuevo_cliente = Cliente.objects.get(pk=nuevo_cliente_id)
                    nueva_cotizacion.cliente = nuevo_cliente
                except Cliente.DoesNotExist:
                    raise serializers.ValidationError(
                        "El ID de cliente proporcionado no es válido.")

            nueva_cotizacion.save()  # Esto genera el nuevo número de cotización

            # 2. Clonar items
            for item_original in original.items.all():
                nuevo_item = item_original
                nuevo_item.pk = None
                nuevo_item.cotizacion = nueva_cotizacion
                nuevo_item.save()

        return Response(self.serializer_class(nueva_cotizacion).data, status=status.HTTP_201_CREATED)

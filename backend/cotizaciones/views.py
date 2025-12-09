from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework import serializers
from django.http import HttpResponse

# Importamos todos los modelos relacionados
from .models import Cotizacion, CotizacionAmbiente, CotizacionItem
from .serializers import CotizacionSerializer
from .filters import CotizacionFilter
from clientes.models import Cliente
# Asumimos que Manufactura es el modelo de usuario
from manufactura.models import Manufactura
from .pdf_generator import generate_cotizacion_pdf
from common.pagination import StandardPagination


# --- VIEWSET PRINCIPAL ---
class CotizacionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la API de Cotizaciones.
    Aplica paginación, filtros avanzados, búsqueda y ordenamiento.
    
    Endpoints disponibles:
    - GET /gestion/cotizaciones/ - Lista paginada con filtros
    - POST /gestion/cotizaciones/ - Crear nueva cotización
    - GET /gestion/cotizaciones/{id}/ - Detalle de cotización
    - PUT/PATCH /gestion/cotizaciones/{id}/ - Actualizar cotización
    - DELETE /gestion/cotizaciones/{id}/ - Eliminar (soft delete)
    - POST /gestion/cotizaciones/{id}/clonar/ - Clonar cotización
    - POST /gestion/cotizaciones/{id}/cambiar_estado/ - Cambiar estado
    - GET /gestion/cotizaciones/{id}/generar-pdf/ - Generar PDF
    
    Parámetros de consulta:
    - ?search= : Busca en numero y cliente__nombre
    - ?estado= : Filtra por estado exacto
    - ?cliente= : Filtra por ID de cliente
    - ?vendedor= : Filtra por ID de vendedor
    - ?fecha_desde= : Fecha emisión >= YYYY-MM-DD
    - ?fecha_hasta= : Fecha emisión <= YYYY-MM-DD
    - ?total_min= : Total >= valor
    - ?total_max= : Total <= valor
    - ?ordering= : Ordena por campo (ej: -created_at, total_general, numero)
    - ?page= : Número de página
    - ?page_size= : Elementos por página (máx 100)
    """

    # Optimización del Queryset: Traemos las relaciones principales
    # Usamos prefetch_related para la estructura anidada Ambientes -> Items
    queryset = Cotizacion.objects.filter(is_active=True).select_related(
        'cliente', 'vendedor'
    ).prefetch_related(
        'ambientes',
        'ambientes__items'
    ).order_by('-created_at')  # Ordenamiento por defecto

    serializer_class = CotizacionSerializer
    pagination_class = StandardPagination
    permission_classes = [IsAuthenticated]

    # --- CONFIGURACIÓN DE BÚSQUEDA Y FILTROS ---
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = CotizacionFilter
    
    # Búsqueda global por texto: Número de cotización y nombre del cliente
    search_fields = ['numero', 'cliente__nombre']
    
    # Campos permitidos para ordenamiento
    ordering_fields = [
        'created_at',
        'updated_at',
        'fecha_emision',
        'fecha_validez',
        'total_general',
        'numero',
        'estado',
    ]
    ordering = ['-created_at']  # Ordenamiento por defecto

    def retrieve(self, request, *args, **kwargs):
        """
        Obtener el detalle de una cotización específica.
        Desactiva la paginación para esta vista.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """
        Actualizar una cotización.
        Validación: Solo se pueden editar cotizaciones en estado BORRADOR o ENVIADA.
        """
        instance = self.get_object()
        
        # Validar que el estado permita edición
        if instance.estado not in ['BORRADOR', 'ENVIADA']:
            return Response(
                {"detail": f"No se puede editar una cotización en estado {instance.estado}"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        Actualización parcial de una cotización.
        Validación: Solo se pueden editar cotizaciones en estado BORRADOR o ENVIADA.
        """
        instance = self.get_object()
        
        # Validar que el estado permita edición
        if instance.estado not in ['BORRADOR', 'ENVIADA']:
            return Response(
                {"detail": f"No se puede editar una cotización en estado {instance.estado}"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().partial_update(request, *args, **kwargs)

    # Sobrescribir destroy para asegurar la eliminación lógica (soft-delete)
    def destroy(self, request, *args, **kwargs):
        with transaction.atomic():
            instance = self.get_object()
            instance.is_active = False
            instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # --- ACCIÓN: CLONAR COTIZACIÓN (Sección 3.4) ---
    @action(detail=True, methods=['post'], url_path='clonar')
    def clone_cotizacion(self, request, pk=None):
        """
        Crea una copia profunda (Deep Copy) de una cotización existente,
        evitando la modificación del original.
        """
        original = self.get_object()
        nuevo_cliente_id = request.data.get('cliente_id')

        # Determinar el vendedor para la nueva cotización
        vendedor_nueva_cotizacion = original.vendedor
        if request.user.is_authenticated:
            try:
                vendedor_actual = Manufactura.objects.get(usuario=request.user, cargo='COMERCIAL')
                vendedor_nueva_cotizacion = vendedor_actual
            except Manufactura.DoesNotExist:
                # Si el usuario actual no es un vendedor, se mantiene el vendedor original.
                pass

        # Determinar el cliente para la nueva cotización
        cliente_nueva_cotizacion = original.cliente
        if nuevo_cliente_id:
            try:
                cliente_nueva_cotizacion = Cliente.objects.get(pk=nuevo_cliente_id)
            except Cliente.DoesNotExist:
                raise serializers.ValidationError({"cliente_id": "El ID de cliente proporcionado no es válido."})

        with transaction.atomic():
            # 1. Crear una NUEVA instancia para la cabecera de la cotización.
            # No se modifica el 'original'.
            nueva_cotizacion = Cotizacion.objects.create(
                cliente=cliente_nueva_cotizacion,
                vendedor=vendedor_nueva_cotizacion,
                estado=Cotizacion.EstadoCotizacion.BORRADOR,
                fecha_validez=original.fecha_validez,
                descuento_total=original.descuento_total,
                # El 'numero' se generará automáticamente en el save()
                # Los totales se recalcularán al final
            )

            # 2. Iterar sobre los ambientes del original para crear nuevas copias
            ambientes_originales = original.ambientes.all()
            for ambiente_original in ambientes_originales:
                nuevo_ambiente = CotizacionAmbiente.objects.create(
                    cotizacion=nueva_cotizacion,
                    nombre=ambiente_original.nombre,
                    orden=ambiente_original.orden,
                )

                # 3. Iterar sobre los items del ambiente original para crear nuevas copias
                items_originales = ambiente_original.items.all()
                for item_original in items_originales:
                    # Crear el item con skip_recalculate=True para evitar múltiples saves
                    nuevo_item = CotizacionItem(
                        ambiente=nuevo_ambiente,
                        producto=item_original.producto,
                        numero_item=item_original.numero_item,
                        cantidad=item_original.cantidad,
                        ancho=item_original.ancho,
                        alto=item_original.alto,
                        precio_unitario=item_original.precio_unitario,  # Mantenemos histórico
                        porcentaje_descuento=item_original.porcentaje_descuento,
                        atributos_seleccionados=item_original.atributos_seleccionados,
                        # El 'precio_total' y 'descripcion_tecnica' se calculan automáticamente en el save()
                    )
                    nuevo_item.save(skip_recalculate=True)
            
            # 4. Recalcular los totales UNA SOLA VEZ al final, asegurando atomicidad
            nueva_cotizacion.recalculate_totals()
            
            # Refrescar la instancia desde la BD para obtener todas las relaciones anidadas
            # para una correcta serialización en la respuesta.
            nueva_cotizacion.refresh_from_db()

        serializer = self.get_serializer(nueva_cotizacion)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # --- ACCIÓN: ACEPTAR COTIZACIÓN (Sección 5.2) ---

    @action(detail=True, methods=['post'], url_path='aceptar')
    def accept_cotizacion(self, request, pk=None):
        cotizacion = self.get_object()

        # --- VALIDACIÓN DE PERMISOS DE NEGOCIO (Sección 6.2) ---
        if not request.user.has_perm('cotizaciones.can_change_status_accepted'):
            return Response(
                {"detail": "No tiene permiso para aprobar cotizaciones."},
                status=status.HTTP_403_FORBIDDEN
            )

        if cotizacion.estado not in [Cotizacion.EstadoCotizacion.ENVIADA, Cotizacion.EstadoCotizacion.BORRADOR]:
            return Response({"detail": "La cotización debe estar en estado ENVIADA o BORRADOR para ser aceptada."},
                            status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # [NOTA FUTURA: Aquí se debe llamar al servicio que genera el PedidoServicio - Sección 7.3]

            cotizacion.estado = Cotizacion.EstadoCotizacion.ACEPTADA
            cotizacion.save()

        return Response(self.serializer_class(cotizacion).data)

    # --- ACCIÓN: CAMBIAR ESTADO DE COTIZACIÓN ---
    @action(detail=True, methods=['post'], url_path='cambiar_estado')
    def cambiar_estado(self, request, pk=None):
        """
        Cambia el estado de una cotización.
        Recibe: { "estado": "ENVIADA" | "ACEPTADA" | "RECHAZADA" | "CANCELADA" }
        """
        cotizacion = self.get_object()
        nuevo_estado = request.data.get('estado')

        # Validar que el estado sea válido
        estados_validos = dict(Cotizacion.EstadoCotizacion.choices).keys()
        if nuevo_estado not in estados_validos:
            return Response(
                {"detail": f"Estado inválido. Estados válidos: {', '.join(estados_validos)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validaciones de transición de estados
        if nuevo_estado == 'ENVIADA' and cotizacion.estado != 'BORRADOR':
            return Response(
                {"detail": "Solo se puede enviar una cotización en estado BORRADOR."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if nuevo_estado == 'ACEPTADA' and cotizacion.estado not in ['ENVIADA', 'BORRADOR']:
            return Response(
                {"detail": "Solo se puede aceptar una cotización en estado ENVIADA o BORRADOR."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if nuevo_estado == 'RECHAZADA' and cotizacion.estado != 'ENVIADA':
            return Response(
                {"detail": "Solo se puede rechazar una cotización en estado ENVIADA."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if nuevo_estado == 'CANCELADA' and cotizacion.estado in ['ACEPTADA', 'CANCELADA']:
            return Response(
                {"detail": "No se puede cancelar una cotización que ya está aceptada o cancelada."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cambiar estado
        with transaction.atomic():
            cotizacion.estado = nuevo_estado
            cotizacion.save()

        return Response(
            CotizacionSerializer(cotizacion, context={'request': request}).data
        )

    @action(detail=True, methods=['get'], url_path='generar-pdf')
    def generar_pdf(self, request, pk=None):
        """
        Genera y descarga el PDF de la cotización.
        Endpoint: /gestion/cotizaciones/{id}/generar-pdf/
        """
        cotizacion = self.get_object()

        try:
            # Generar el PDF usando el generador
            pdf_buffer = generate_cotizacion_pdf(cotizacion, request)
            
            # Crear el nombre del archivo
            filename = f"Cotizacion_{cotizacion.numero}.pdf"
            
            # Preparar la respuesta HTTP
            response = HttpResponse(pdf_buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            return response
            
        except Exception as e:
            return Response(
                {"detail": f"Error al generar el PDF: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        return Response(self.serializer_class(cotizacion).data)

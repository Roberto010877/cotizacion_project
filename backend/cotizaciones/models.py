from django.db import models
from django.core.exceptions import ValidationError
from django.db import transaction
from decimal import Decimal

# Importaciones externas de apps vecinas
from clientes.models import Cliente
from manufactura.models import Manufactura
from common.models import BaseModel, SoftDeleteMixin, TablaCorrelativos
from productos_servicios.models import ProductoServicio

# -----------------------------------------------------------------------------
# 1. MODELO ENCABEZADO (COTIZACIÓN)
# -----------------------------------------------------------------------------


class Cotizacion(BaseModel, SoftDeleteMixin):
    """
    Encabezado de la cotización. Agrupa los ítems y gestiona el estado comercial.
    Utiliza SoftDeleteMixin para la eliminación lógica (activo=False).
    """

    class EstadoCotizacion(models.TextChoices):
        BORRADOR = 'BORRADOR', 'Borrador'
        ENVIADA = 'ENVIADA', 'Enviada al Cliente'
        ACEPTADA = 'ACEPTADA', 'Aceptada (Cerrada)'
        RECHAZADA = 'RECHAZADA', 'Rechazada'
        VENCIDA = 'VENCIDA', 'Vencida'
        CANCELADA = 'CANCELADA', 'Cancelada'

    # --- IDENTIFICACIÓN ---
    numero = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Número de Cotización",
        editable=False,
        help_text="Generado automáticamente (Ej: COT-000015)"
    )

    # --- RELACIONES ---
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name='cotizaciones',
        verbose_name="Cliente"
    )

    # Asume que Manufactura tiene un campo 'rol'
    vendedor = models.ForeignKey(
        Manufactura,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'rol': 'VENDEDOR'},
        related_name='cotizaciones_realizadas',
        verbose_name="Vendedor Responsable"
    )

    # --- FECHAS Y ESTADO ---
    fecha_emision = models.DateField(
        auto_now_add=True, verbose_name="Fecha de Emisión")
    fecha_validez = models.DateField(
        null=True, blank=True, verbose_name="Válida hasta")

    estado = models.CharField(
        max_length=20,
        choices=EstadoCotizacion.choices,
        default=EstadoCotizacion.BORRADOR,
        verbose_name="Estado Actual"
    )

    # --- TOTALES ---
    total_neto = models.DecimalField(
        max_digits=14, decimal_places=2, default=0.00, verbose_name="Subtotal Neto")
    descuento_total = models.DecimalField(
        max_digits=14, decimal_places=2, default=0.00, verbose_name="Descuento Total")
    total_general = models.DecimalField(
        max_digits=14, decimal_places=2, default=0.00, verbose_name="Total General")

    observaciones = models.TextField(
        blank=True,
        verbose_name="Observaciones Comerciales",
        help_text="Notas visibles en el PDF para el cliente"
    )

    def __str__(self):
        return f"{self.numero} - {self.cliente}"

    def save(self, *args, **kwargs):
        # Implementación de Atomicidad para el Correlativo (Sección 7.2)
        if not self.numero:
            with transaction.atomic():
                try:
                    # Bloquea y obtiene el siguiente número de forma atómica
                    correlativo = TablaCorrelativos.objects.get(prefijo='COT')
                    self.numero = correlativo.obtener_siguiente_codigo()
                except TablaCorrelativos.DoesNotExist:
                    raise ValidationError(
                        "Error: No existe un correlativo configurado con prefijo 'COT'.")

        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Cotización"
        verbose_name_plural = "Cotizaciones"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['estado', '-created_at']),
            models.Index(fields=['cliente']),
        ]
        permissions = [
            ("can_change_status_accepted", "Puede aprobar cotización (Aceptada)"),
            ("can_reactivate_cotizacion", "Puede reactivar cotización vencida"),
            ("can_convert_to_pedido", "Puede convertir cotización a pedido"),
            ("can_apply_extra_discount", "Puede aplicar descuento extra"),
            ("can_override_unit_price", "Puede sobrescribir precio unitario"),
        ]


# -----------------------------------------------------------------------------
# 2. MODELO DETALLE (ITEMS DE COTIZACIÓN)
# -----------------------------------------------------------------------------

class ItemCotizacion(BaseModel):
    """
    Detalle de la cotización. Guarda la configuración específica de cada producto
    y mantiene los 'snapshots' de precio y descripción.
    """

    cotizacion = models.ForeignKey(
        Cotizacion,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name="Cotización Padre"
    )

    producto = models.ForeignKey(
        ProductoServicio,
        on_delete=models.PROTECT,  # No se puede borrar el producto si está siendo cotizado
        related_name='items_cotizados',
        verbose_name="Producto del Catálogo"
    )

    numero_item = models.PositiveIntegerField(verbose_name="#")

    # --- MEDIDAS Y CANTIDAD ---
    cantidad = models.DecimalField(
        max_digits=10, decimal_places=2, default=1.00)
    ancho = models.DecimalField(
        max_digits=6, decimal_places=3, default=0.00, verbose_name="Ancho (m)")
    alto = models.DecimalField(
        max_digits=6, decimal_places=3, default=0.00, verbose_name="Alto (m)")

    # --- EL CAMPO MÁGICO DE DATOS ---
    atributos_especificos = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Atributos Técnicos (JSON)",
        help_text="Ej: {'tejido': 'Linho', 'riel': 'Blanco', 'comando': 'Izq'}"
    )

    # --- SNAPSHOTS ---
    descripcion_completa = models.TextField(
        verbose_name="Descripción Generada",
        help_text="Texto final generado para el PDF."
    )

    precio_unitario = models.DecimalField(
        max_digits=12, decimal_places=2, verbose_name="Precio Unitario (Snapshot)")
    precio_total = models.DecimalField(
        max_digits=12, decimal_places=2, verbose_name="Precio Total Línea")

    def __str__(self):
        return f"Item {self.numero_item} de {self.cotizacion.numero}"

    def clean(self):
        super().clean()
        # Validar la lógica de medidas (Sección 2.3)
        if self.producto.requiere_medidas:
            if self.ancho <= 0 or self.alto <= 0:
                raise ValidationError(
                    "Este producto requiere medidas de Ancho y Alto válidas.")

    class Meta:
        verbose_name = "Ítem de Cotización"
        verbose_name_plural = "Ítems de Cotización"
        ordering = ['numero_item']
        unique_together = ['cotizacion', 'numero_item']

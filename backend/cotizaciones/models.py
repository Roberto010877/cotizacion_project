from django.db import models
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from decimal import Decimal

# Importaciones externas de apps vecinas
# NOTA: Asumo que Manufactura, Cliente, ProductoServicio y common.models existen
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

    vendedor = models.ForeignKey(
        Manufactura,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'cargo': 'COMERCIAL'},
        related_name='cotizaciones_realizadas',
        verbose_name="Vendedor Responsable"
    )

    # --- FECHAS Y ESTADO ---
    fecha_emision = models.DateField(
        auto_now_add=True, verbose_name="Fecha de Emisión",
        help_text="Fecha de emisión de la cotización (se establece automáticamente)")
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

    def __str__(self):
        return f"{self.numero} - {self.cliente}"

    # Método para recalcular totales del encabezado
    def recalculate_totals(self):
        """
        Calcula el total bruto, descuento y total neto a partir de los ambientes.
        
        IMPORTANTE: Este método hace un save() usando update_fields para evitar
        triggers recursivos y señales innecesarias. Es seguro llamarlo dentro
        de transacciones atómicas.
        """

        # 1. Sumar totales de todos los items en todos los ambientes
        total_bruto = sum(item.precio_total for ambiente in self.ambientes.all()
                          for item in ambiente.items.all())

        # 2. Aplicar descuento global (si lo hubiera, aquí se necesitaría un campo de descuento global en Cotizacion)
        # Por ahora, total_neto = total_bruto

        self.total_neto = total_bruto
        # Asumo que descuento_total es un valor fijo aquí
        self.total_general = total_bruto - self.descuento_total
        # Usar update_fields para evitar triggers y señales innecesarias
        self.save(update_fields=['total_neto', 'total_general', 'updated_at'])

    def save(self, *args, **kwargs):
        # Implementación de Atomicidad para el Correlativo
        if not self.numero:
            with transaction.atomic():
                try:
                    # Bloquea y obtiene el siguiente número de forma atómica
                    correlativo = TablaCorrelativos.objects.get(prefijo='COT')
                    self.numero = correlativo.obtener_siguiente_codigo()
                except TablaCorrelativos.DoesNotExist:
                    # NOTA: Esta excepción debe ser ajustada a tu proyecto
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
# 2. MODELO AGRUPADOR (AMBIENTE)
# -----------------------------------------------------------------------------

class CotizacionAmbiente(models.Model):
    """
    Agrupador lógico (Nivel intermedio). 
    Ejemplo: "Sala", "Dormitorio Principal".
    """
    cotizacion = models.ForeignKey(
        Cotizacion,
        on_delete=models.CASCADE,
        related_name='ambientes'
    )
    nombre = models.CharField(
        max_length=100, verbose_name="Nombre del Ambiente")
    orden = models.PositiveIntegerField(
        default=0, help_text="Para ordenar en el PDF")

    class Meta:
        ordering = ['orden']
        verbose_name = "Ambiente de Cotización"
        verbose_name_plural = "Ambientes de Cotización"

    def __str__(self):
        return f"{self.nombre} ({self.cotizacion.numero})"

# -----------------------------------------------------------------------------
# 3. MODELO DETALLE (ITEM)
# -----------------------------------------------------------------------------


class CotizacionItem(BaseModel):
    """
    Detalle de la cotización. Se vincula al AMBIENTE.
    """

    # --- CAMBIO CRÍTICO: El item se vincula al AMBIENTE, no a la COTIZACION ---
    ambiente = models.ForeignKey(
        CotizacionAmbiente,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name="Ambiente Padre"
    )

    producto = models.ForeignKey(
        ProductoServicio,
        on_delete=models.PROTECT,
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
    atributos_seleccionados = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Atributos Seleccionados (JSON)",
        help_text="Ej: {'tejido': 'Linho', 'riel': 'Blanco', 'comando': 'Izq'}"
    )

    # --- SNAPSHOTS y CÁLCULOS ---
    descripcion_tecnica = models.TextField(
        blank=True,
        editable=False,
        verbose_name="Descripción Generada",
        help_text="Texto final generado para el PDF."
    )

    precio_unitario = models.DecimalField(
        max_digits=12, decimal_places=2, verbose_name="Precio Unitario Base (Snapshot)")
    porcentaje_descuento = models.DecimalField(
        max_digits=5, decimal_places=2, default=0.00, verbose_name="Descuento Línea (%)")
    precio_total = models.DecimalField(
        max_digits=12, decimal_places=2, editable=False, verbose_name="Total Línea (Neto)")

    def save(self, *args, skip_recalculate=False, **kwargs):
        """
        Guarda el item calculando precio_total y descripcion_tecnica automáticamente.
        
        Args:
            skip_recalculate (bool): Si es True, NO recalcula los totales del encabezado.
                Usar cuando se están creando múltiples items dentro de una transacción
                y se va a recalcular una sola vez al final.
        """
        # 1. Calcular Totales
        factor = Decimal(1)
        # Accedemos al modelo relacionado a través del campo 'producto'
        if self.producto.unidad_medida == 'M2' and self.producto.requiere_medidas:
            area = self.ancho * self.alto
            factor = area

        subtotal = self.precio_unitario * factor * self.cantidad
        descuento = subtotal * (self.porcentaje_descuento / Decimal(100))
        self.precio_total = subtotal - descuento

        # 2. Generar Descripción Técnica (Concatenación Automática)
        self.generar_descripcion()

        super().save(*args, **kwargs)

        # 3. Recalcular total del encabezado después de guardar el item
        # Solo si no se está ejecutando dentro de una transacción mayor
        if not skip_recalculate:
            self.ambiente.cotizacion.recalculate_totals()

    def generar_descripcion(self):
        """
        Construye la string larga basada en el producto y los atributos JSON.
        """
        partes = [self.producto.nombre.upper()]

        if self.atributos_seleccionados:
            for key, value in self.atributos_seleccionados.items():
                key_fmt = key.replace('_', ' ').replace('pide ', '').upper()
                partes.append(f"{key_fmt}: {str(value).upper()}")

        self.descripcion_tecnica = " | ".join(partes)

    def __str__(self):
        return f"Item {self.numero_item} de {self.ambiente.cotizacion.numero}"

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
        # El numero_item debe ser único dentro de cada AMBIENTE, no dentro de toda la Cotización
        unique_together = ['ambiente', 'numero_item']

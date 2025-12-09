from django.db import models
from django.core.exceptions import ValidationError
# No se necesita importar ProductoServicio aquí.
from common.models import BaseModel, SoftDeleteMixin

# -----------------------------------------------------------------------------
# 1. MODELO CATÁLOGO (PRODUCTOS Y SERVICIOS)
# -----------------------------------------------------------------------------


class ProductoServicio(BaseModel, SoftDeleteMixin):
    """
    Catálogo maestro de productos y servicios. 
    Define las reglas (precio, unidad) y la configuración UI para la venta.
    """

    class TipoProducto(models.TextChoices):
        CORTINA = 'CORTINA', 'Cortina (Textil)'
        PERSIANA = 'PERSIANA', 'Persiana (Mecánica)'
        TOLDO = 'TOLDO', 'Toldo (Exterior)'
        MOTOR = 'MOTOR', 'Motor / Automatización'
        RIEL = 'RIEL', 'Rieles y Barrales'
        SERVICIO = 'SERVICIO', 'Servicio (Mano de Obra)'
        OTRO = 'OTRO', 'Otro'

    class UnidadMedida(models.TextChoices):
        METRO_CUADRADO = 'M2', 'Metros Cuadrados'
        METRO_LINEAL = 'ML', 'Metros Lineales'
        UNIDAD = 'UN', 'Unidad'
        GLOBAL = 'GL', 'Global'

    # --- IDENTIFICACIÓN ---
    codigo = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Código Interno",
        help_text="Formato sugerido: CAT-TIP-000 (Ej: COR-WAV-001)"
    )

    nombre = models.CharField(
        max_length=255,
        verbose_name="Nombre Comercial"
    )

    # Agregado para descripción y búsqueda (del hilo anterior)
    descripcion = models.TextField(
        blank=True,
        verbose_name="Descripción Técnica",
        help_text="Detalles internos sobre materiales o proveedores."
    )

    # --- CLASIFICACIÓN ---
    tipo_producto = models.CharField(
        max_length=20,
        choices=TipoProducto.choices,
        verbose_name="Tipo de Producto"
    )

    unidad_medida = models.CharField(
        max_length=5,
        choices=UnidadMedida.choices,
        default=UnidadMedida.UNIDAD,
        verbose_name="Unidad de Medida"
    )

    # --- PRECIOS Y REGLAS ---
    precio_base = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        verbose_name="Precio Venta Base"
    )

    # Agregado para cálculo de márgenes (del hilo anterior)
    costo_estandar = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        verbose_name="Costo Estándar",
        help_text="Costo referencial para cálculo de márgenes."
    )

    requiere_medidas = models.BooleanField(
        default=False,
        verbose_name="¿Requiere Medidas?",
        help_text="Si es True, el sistema obligará a ingresar Ancho y Alto en la cotización."
    )

    # --- EL CAMPO MÁGICO DE CONFIGURACIÓN UI ---
    configuracion_ui = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Configuración de Interfaz (UI)",
        help_text="JSON que define qué inputs mostrar. Ej: {'pide_tejido': true, 'pide_riel': true}"
    )

    # === MÉTODOS MÁGICOS Y VALIDACIÓN ===
    def clean(self):
        super().clean()

        if self.codigo:
            self.codigo = self.codigo.upper().strip()

        if self.configuracion_ui and not isinstance(self.configuracion_ui, dict):
            raise ValidationError(
                {'configuracion_ui': 'El campo de configuración UI debe ser un objeto JSON.'})

        if self.precio_base < 0:
            raise ValidationError(
                {'precio_base': 'El precio no puede ser negativo.'})

    def __str__(self):
        return f"[{self.codigo}] {self.nombre}"

    class Meta:
        verbose_name = "Producto / Servicio"
        verbose_name_plural = "Catálogo de Productos"
        ordering = ['nombre']
        indexes = [
            models.Index(fields=['tipo_producto']),
            models.Index(fields=['codigo']),
        ]

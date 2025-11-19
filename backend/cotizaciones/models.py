from django.db import models
from django.conf import settings
from clientes.models import Cliente
from productos.models import Producto
from common.models import BaseModel

class Cotizacion(BaseModel):
    """
    Representa una cotización para un cliente.
    Hereda de BaseModel para incluir campos de auditoría y borrado suave.
    """
    class EstadoCotizacion(models.TextChoices):
        BORRADOR = 'BORRADOR', 'Borrador'
        ENVIADA = 'ENVIADA', 'Enviada'
        ACEPTADA = 'ACEPTADA', 'Aceptada'
        RECHAZADA = 'RECHAZADA', 'Rechazada'
        CANCELADA = 'CANCELADA', 'Cancelada'

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='cotizaciones')
    fecha_vencimiento = models.DateField(blank=True, null=True, verbose_name="Fecha de Vencimiento")
    estado = models.CharField(
        max_length=10, choices=EstadoCotizacion.choices, default=EstadoCotizacion.BORRADOR
    )
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    observaciones = models.TextField(blank=True, null=True)
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='cotizaciones_creadas'
    )

    def __str__(self):
        return f"Cotización {self.id} para {self.cliente.nombre}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Cotización"
        verbose_name_plural = "Cotizaciones"

class DetalleCotizacion(BaseModel):
    """
    Representa una línea de producto dentro de una cotización.
    Hereda de BaseModel para consistencia, aunque no todos los campos base sean críticos aquí.
    """
    cotizacion = models.ForeignKey(Cotizacion, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Unitario")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def save(self, *args, **kwargs):
        # Calcula el subtotal antes de guardar
        self.subtotal = self.precio_unitario * self.cantidad
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre} en Cotización {self.cotizacion.id}"

    class Meta:
        ordering = ['created_at']
        verbose_name = "Detalle de Cotización"
        verbose_name_plural = "Detalles de Cotizaciones"
        unique_together = ('cotizacion', 'producto')

from django.db import models
from django.conf import settings
from proveedores.models import Proveedor
from productos.models import Producto
from common.models import BaseModel

class OrdenCompra(BaseModel):
    """
    Representa una orden de compra a un proveedor.
    """
    class EstadoOrdenCompra(models.TextChoices):
        BORRADOR = 'BORRADOR', 'Borrador'
        ENVIADA = 'ENVIADA', 'Enviada'
        RECIBIDA = 'RECIBIDA', 'Recibida'
        CANCELADA = 'CANCELADA', 'Cancelada'

    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE, related_name='ordenes_compra')
    fecha_entrega_prevista = models.DateField(blank=True, null=True, verbose_name="Fecha de Entrega Prevista")
    estado = models.CharField(
        max_length=10, choices=EstadoOrdenCompra.choices, default=EstadoOrdenCompra.BORRADOR
    )
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    observaciones = models.TextField(blank=True, null=True)
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='ordenes_compra_creadas'
    )

    def __str__(self):
        return f"Orden de Compra {self.id} a {self.proveedor.nombre}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Orden de Compra"
        verbose_name_plural = "Órdenes de Compra"

class DetalleOrdenCompra(BaseModel):
    """
    Representa una línea de producto dentro de una orden de compra.
    """
    orden_compra = models.ForeignKey(OrdenCompra, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.PositiveIntegerField(default=1)
    costo_unitario = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Costo Unitario")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def save(self, *args, **kwargs):
        self.subtotal = self.costo_unitario * self.cantidad
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre} en Orden de Compra {self.orden_compra.id}"

    class Meta:
        ordering = ['created_at']
        verbose_name = "Detalle de Orden de Compra"
        verbose_name_plural = "Detalles de Órdenes de Compra"
        unique_together = ('orden_compra', 'producto')


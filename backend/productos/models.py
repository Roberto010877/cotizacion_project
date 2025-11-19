from django.db import models
from common.models import BaseModel

class Producto(BaseModel):
    """
    Representa un producto o servicio que puede ser cotizado o comprado.
    """
    nombre = models.CharField(max_length=255, unique=True, help_text="Nombre del producto o servicio")
    descripcion = models.TextField(blank=True, null=True, help_text="Descripción detallada del producto o servicio")
    precio = models.DecimalField(max_digits=10, decimal_places=2, help_text="Precio de venta al público o costo estándar")
    es_servicio = models.BooleanField(default=False, help_text="Marcar si es un servicio en lugar de un producto físico")

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Producto o Servicio"
        verbose_name_plural = "Productos y Servicios"
        ordering = ['nombre']

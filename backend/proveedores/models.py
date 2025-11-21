from django.db import models
from common.models import BaseModel

class Proveedor(BaseModel):
    nombre = models.CharField(max_length=255, verbose_name="Nombre o Razón Social")
    rut = models.CharField(max_length=20, unique=True)
    direccion = models.CharField(max_length=255, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(max_length=255, blank=True)
    persona_contacto = models.CharField(max_length=255, blank=True, verbose_name="Persona de Contacto")
    sitio_web = models.URLField(max_length=255, blank=True, verbose_name="Sitio Web (opcional)")
    notas = models.TextField(blank=True, verbose_name="Notas Internas")

    def __str__(self):
        return self.nombre
    
    class Meta:
        ordering = ['nombre']
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
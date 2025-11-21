from django.contrib import admin
from .models import Proveedor

@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'rut', 'telefono', 'email', 'persona_contacto')
    search_fields = ('nombre', 'rut', 'email', 'persona_contacto')
    ordering = ('nombre',)


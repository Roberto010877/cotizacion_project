from django.contrib import admin
from .models import Cliente

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'email', 'telefono', 'pais', 'tipo', 'origen', 'is_active']
    list_per_page = 50
    list_filter = ['tipo', 'origen', 'pais', 'is_active', 'created_at']
    search_fields = ['nombre', 'numero_documento', 'email', 'telefono']
    readonly_fields = ['created_at', 'updated_at', 'id']
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'nombre', 'email', 'telefono_contacto')
        }),
        ('Ubicación', {
            'fields': ('pais', 'direccion')
        }),
        ('Clasificación', {
            'fields': ('tipo', 'origen', 'preferencias_contacto')
        }),
        ('Administración', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )


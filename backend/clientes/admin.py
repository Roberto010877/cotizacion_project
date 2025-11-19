from django.contrib import admin
from .models import Cliente

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ['id', 'numero_documento', 'nombre', 'email', 'tipo', 'is_active']
    
    list_filter = ['tipo', 'origen', 'pais', 'is_active']
    search_fields = ['nombre', 'numero_documento', 'email']
    readonly_fields = ['created_at', 'updated_at']


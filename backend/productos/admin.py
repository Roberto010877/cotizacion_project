from django.contrib import admin
from .models import Producto

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio', 'es_servicio', 'created_at')
    search_fields = ('nombre', 'descripcion')
    list_filter = ('es_servicio', 'created_at')
    ordering = ('nombre',)


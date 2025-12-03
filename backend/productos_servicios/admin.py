from django.contrib import admin
from .models import ProductoServicio


@admin.register(ProductoServicio)
class ProductoServicioAdmin(admin.ModelAdmin):
    # list_display incluye los campos importantes para ver en la tabla
    list_display = (
        'codigo',          # Agregamos el código para visibilidad
        'nombre',
        'precio_base',
        'tipo_producto',
        'created_at'
    )
    # CORRECCIÓN: Quitamos 'descripcion' y usamos 'codigo'
    search_fields = ('codigo', 'nombre')

    # Agregamos unidad_medida para mejor filtro
    list_filter = ('tipo_producto', 'unidad_medida', 'created_at')

    ordering = ('nombre',)

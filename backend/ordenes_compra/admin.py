from django.contrib import admin
# Asume que OrdenCompra y DetalleOrdenCompra existen
from .models import OrdenCompra, DetalleOrdenCompra


class DetalleOrdenCompraInline(admin.TabularInline):
    model = DetalleOrdenCompra
    extra = 1
    # CORRECCIÓN: Autocompletar por la FK del producto (asumiremos que la FK se llama 'producto_servicio')
    autocomplete_fields = ['producto_servicio']


@admin.register(OrdenCompra)
class OrdenCompraAdmin(admin.ModelAdmin):
    # CORRECCIÓN: Usar nombres de campos del modelo Cotizacion
    list_display = (
        'numero_orden',
        'proveedor',
        'estado',
        'total',
        'fecha_entrega_prevista',
        'usuario_creacion'  # Usamos el nombre correcto de BaseModel
    )
    list_filter = ('estado', 'fecha_entrega_prevista', 'created_at')
    search_fields = ('numero_orden', 'proveedor__nombre')
    inlines = [DetalleOrdenCompraInline]
    autocomplete_fields = ['proveedor']
    readonly_fields = ('numero_orden', 'total')


@admin.register(DetalleOrdenCompra)
class DetalleOrdenCompraAdmin(admin.ModelAdmin):
    # CORRECCIÓN: Usar la nomenclatura del modelo
    list_display = (
        'orden_compra',
        'producto_servicio',  # Asumo este nombre para la FK
        'cantidad',
        'costo_unitario',
        'subtotal'
    )
    # CORRECCIÓN: Buscar por el nombre del producto referenciado (producto_servicio__nombre)
    search_fields = ('orden_compra__numero_orden', 'producto_servicio__nombre')

    # CORRECCIÓN: Reemplazar el campo 'nombre' que no existe
    autocomplete_fields = ['orden_compra',
                           'producto_servicio']  # Autocompletar la FK
    readonly_fields = ('subtotal',)

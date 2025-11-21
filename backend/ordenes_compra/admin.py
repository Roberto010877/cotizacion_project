from django.contrib import admin
from .models import OrdenCompra, DetalleOrdenCompra

class DetalleOrdenCompraInline(admin.TabularInline):
    model = DetalleOrdenCompra
    extra = 1
    autocomplete_fields = ['producto']

@admin.register(OrdenCompra)
class OrdenCompraAdmin(admin.ModelAdmin):
    list_display = ('numero_orden', 'proveedor', 'estado', 'total', 'fecha_entrega_prevista', 'creado_por')
    list_filter = ('estado', 'fecha_entrega_prevista', 'created_at')
    search_fields = ('numero_orden', 'proveedor__nombre')
    inlines = [DetalleOrdenCompraInline]
    autocomplete_fields = ['proveedor']
    readonly_fields = ('numero_orden', 'total')

@admin.register(DetalleOrdenCompra)
class DetalleOrdenCompraAdmin(admin.ModelAdmin):
    list_display = ('orden_compra', 'producto', 'cantidad', 'costo_unitario', 'subtotal')
    search_fields = ('orden_compra__id', 'producto__nombre')
    autocomplete_fields = ['orden_compra', 'producto']
    readonly_fields = ('subtotal',)


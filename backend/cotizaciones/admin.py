from django.contrib import admin
from .models import Cotizacion, DetalleCotizacion

class DetalleCotizacionInline(admin.TabularInline):
    model = DetalleCotizacion
    extra = 1
    autocomplete_fields = ['producto']

@admin.register(Cotizacion)
class CotizacionAdmin(admin.ModelAdmin):
    list_display = ('numero_cotizacion', 'cliente', 'estado', 'total', 'fecha_vencimiento', 'creado_por')
    list_filter = ('estado', 'fecha_vencimiento', 'created_at')
    search_fields = ('numero_cotizacion', 'cliente__nombre')
    inlines = [DetalleCotizacionInline]
    autocomplete_fields = ['cliente']
    readonly_fields = ('numero_cotizacion', 'total')

@admin.register(DetalleCotizacion)
class DetalleCotizacionAdmin(admin.ModelAdmin):
    list_display = ('cotizacion', 'producto', 'cantidad', 'precio_unitario', 'subtotal')
    search_fields = ('cotizacion__id', 'producto__nombre')
    autocomplete_fields = ['cotizacion', 'producto']
    readonly_fields = ('subtotal',)


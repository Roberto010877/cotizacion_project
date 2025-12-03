from django.contrib import admin
from .models import Cotizacion, ItemCotizacion


class ItemCotizacionInline(admin.TabularInline):
    model = ItemCotizacion
    extra = 1
    # Usamos 'producto' porque es el nombre de la FK en ItemCotizacion
    autocomplete_fields = ['producto']


@admin.register(Cotizacion)
class CotizacionAdmin(admin.ModelAdmin):
    # CORRECCIÓN: Usamos la nomenclatura del modelo
    list_display = (
        'numero',             # Antes: numero_cotizacion
        'cliente',
        'estado',
        'total_general',      # Antes: total
        'fecha_validez',      # Antes: fecha_vencimiento
        'usuario_creacion',   # Antes: creado_por (viene de BaseModel)
    )

    # CORRECCIÓN: Usamos la nomenclatura del modelo
    list_filter = (
        'estado',
        'fecha_validez',      # Antes: fecha_vencimiento
        'created_at'          # Usamos created_at (de BaseModel)
    )

    # CORRECCIÓN: Usamos la nomenclatura del modelo
    search_fields = (
        'numero',             # Antes: numero_cotizacion
        'cliente__nombre'
    )

    inlines = [ItemCotizacionInline]
    autocomplete_fields = ['cliente']

    # CORRECCIÓN: Campos de solo lectura
    readonly_fields = (
        'numero',             # Antes: numero_cotizacion
        'total_general'       # Antes: total
    )


@admin.register(ItemCotizacion)
class ItemCotizacionAdmin(admin.ModelAdmin):
    # CORRECCIÓN: Usamos la nomenclatura del modelo
    list_display = (
        'cotizacion',
        'producto',
        'cantidad',
        'precio_unitario',
        'precio_total'        # Antes: subtotal
    )

    search_fields = ('cotizacion__numero', 'producto__nombre')
    autocomplete_fields = ['cotizacion', 'producto']

    # CORRECCIÓN: Campos de solo lectura
    readonly_fields = (
        'precio_total',       # Antes: subtotal
    )

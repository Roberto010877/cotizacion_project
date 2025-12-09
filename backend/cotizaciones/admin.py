from django.contrib import admin
from django.forms import Textarea
from django.db import models
from django.db import transaction

# Importamos los modelos
from .models import Cotizacion, CotizacionAmbiente, CotizacionItem

# -----------------------------------------------------------------------------
# 1. ÍTEMS (Nivel 3)
# Se define primero, ya que será usado en el siguiente Inline (Ambientes).
# -----------------------------------------------------------------------------


class CotizacionItemInline(admin.TabularInline):
    """Inline para gestionar los ítems dentro de cada Ambiente."""
    model = CotizacionItem
    extra = 1

    # Se asegura que 'descripcion_tecnica' y 'atributos_seleccionados' se muestren en el inline
    fields = (
        'numero_item', 'producto', 'cantidad', 'ancho', 'alto',
        'porcentaje_descuento', 'atributos_seleccionados', 'descripcion_tecnica',
    )

    # Campos de solo lectura (valores de snapshot y cálculos automáticos)
    # precio_total y descripcion_tecnica se calculan en el modelo y son readonly.
    readonly_fields = (
        'precio_unitario',
        'precio_total',
        'descripcion_tecnica',
    )

    # Mejorar la visualización del campo JSON y Texto Largo
    formfield_overrides = {
        models.TextField: {'widget': Textarea(attrs={'rows': 2, 'cols': 40})},
        models.JSONField: {'widget': Textarea(attrs={'rows': 3, 'cols': 40})},
    }

    # Autocompletado para FK
    autocomplete_fields = ['producto']

    verbose_name = "Ítem de Detalle"
    verbose_name_plural = "Ítems y Productos"

# -----------------------------------------------------------------------------
# 2. AMBIENTES (Nivel 2)
# Contiene los Ítems y se anida en la Cotización.
# -----------------------------------------------------------------------------


class CotizacionAmbienteInline(admin.StackedInline):
    """
    Inline para gestionar los Ambientes (Secciones) dentro de la Cotización.
    """
    model = CotizacionAmbiente
    extra = 1
    fields = ('nombre', 'orden')

    # ¡La anidación de Ítems ocurre aquí!
    inlines = [CotizacionItemInline]

    verbose_name = "Agrupador de Ambiente"
    verbose_name_plural = "Ambientes de la Cotización"

# -----------------------------------------------------------------------------
# 3. COTIZACIÓN (Nivel 1)
# -----------------------------------------------------------------------------


@admin.register(Cotizacion)
class CotizacionAdmin(admin.ModelAdmin):
    """Administración del encabezado de la Cotización."""

    list_display = (
        'numero',
        'cliente',
        'vendedor',
        'estado',
        'fecha_emision',
        'total_general',
        'created_at',
    )

    list_filter = ('estado', 'fecha_emision', 'cliente', 'vendedor')
    search_fields = ('numero', 'cliente__nombre', 'vendedor__nombre')

    # Anidamos el Inline de Ambientes aquí
    inlines = [CotizacionAmbienteInline]

    autocomplete_fields = ['cliente', 'vendedor']

    # CORRECCIÓN: Usamos solo los campos existentes en el modelo
    readonly_fields = (
        'numero',
        # 'total_bruto' ELIMINADO
        'descuento_total',
        'total_neto',
        'total_general',
        'fecha_emision',
        'created_at',
        'updated_at',
    )

    fieldsets = (
        ('Información Principal', {
            'fields': (
                'numero', 'cliente', 'vendedor', 'estado', 'fecha_validez'
            )
        }),
        ('Totales Financieros', {
            # CORRECCIÓN: Usamos solo los campos existentes.
            # Si se desea agregar total_bruto y descuento_global, deben estar en models.py.
            'fields': ('total_neto', 'descuento_total', 'total_general'),
        }),
        ('Auditoría', {
            'fields': ('fecha_emision', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def save_model(self, request, obj, form, change):
        """
        Guardar con atomicidad explícita para proteger operaciones con inlines anidados.
        """
        with transaction.atomic():
            super().save_model(request, obj, form, change)
            # Recalcular totales después de guardar todos los inlines
            if change:  # Solo en edición, no en creación
                obj.recalculate_totals()

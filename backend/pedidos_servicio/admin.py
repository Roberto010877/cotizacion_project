from django.contrib import admin
from .models import PedidoServicio, ItemPedidoServicio


class ItemPedidoServicioInline(admin.TabularInline):
    """Interfaz inline para Items de Pedidos de Servicio"""
    model = ItemPedidoServicio
    extra = 1
    fields = [
        'numero_item',
        'ambiente',
        'modelo',
        'tejido',
        'largura',
        'altura',
        'cantidad_piezas',
        'posicion_tejido',
        'lado_comando',
        'acionamiento',
        'observaciones',
    ]


@admin.register(PedidoServicio)
class PedidoServicioAdmin(admin.ModelAdmin):
    """
    Interfaz de administración para Pedidos de Servicio (Maestro).
    """
    list_display = [
        'numero_pedido',
        'cliente',
        'solicitante',
        'manufacturador',
        'instalador',
        'fecha_emision',
        'fecha_inicio',
        'estado',
        'created_at',
    ]
    list_filter = [
        'estado',
        'fecha_emision',
        'fecha_inicio',
        'fecha_fin',
        'created_at',
        'manufacturador',
        'instalador',
    ]
    search_fields = [
        'numero_pedido',
        'cliente__nombre',
        'solicitante',
        'supervisor',
        'manufacturador__email',
        'instalador__email',
    ]
    readonly_fields = [
        'numero_pedido',
        'created_at',
        'updated_at',
    ]
    inlines = [ItemPedidoServicioInline]
    
    fieldsets = (
        ('Información General', {
            'fields': ('numero_pedido', 'estado', 'cliente', 'solicitante', 'supervisor')
        }),
        ('Asignaciones', {
            'fields': ('manufacturador', 'instalador')
        }),
        ('Fechas', {
            'fields': ('fecha_inicio', 'fecha_fin')
        }),
        ('Observaciones y Auditoría', {
            'fields': ('observaciones', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    date_hierarchy = 'fecha_inicio'
    ordering = ['-created_at']


@admin.register(ItemPedidoServicio)
class ItemPedidoServicioAdmin(admin.ModelAdmin):
    """
    Interfaz de administración para Items de Pedidos de Servicio (Detalles).
    """
    list_display = [
        'numero_item',
        'get_numero_pedido',
        'ambiente',
        'modelo',
        'tejido',
        'cantidad_piezas',
        'posicion_tejido',
        'lado_comando',
        'acionamiento',
    ]
    list_filter = [
        'modelo',
        'posicion_tejido',
        'lado_comando',
        'acionamiento',
    ]
    search_fields = [
        'pedido_servicio__numero_pedido',
        'ambiente',
        'modelo',
        'tejido',
    ]
    readonly_fields = [
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Relación', {
            'fields': ('pedido_servicio', 'numero_item')
        }),
        ('Especificaciones', {
            'fields': (
                'ambiente',
                'modelo',
                'tejido',
                'largura',
                'altura',
                'cantidad_piezas',
                'posicion_tejido',
                'lado_comando',
                'acionamiento',
                'observaciones',
            )
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_numero_pedido(self, obj):
        """Muestra el número del pedido"""
        return obj.pedido_servicio.numero_pedido
    get_numero_pedido.short_description = 'Número de Pedido'
    
    ordering = ['pedido_servicio', 'numero_item']



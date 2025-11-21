from django.contrib import admin
from .models import PedidoServicio, ItemPedidoServicio, AsignacionTarea


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
        'colaborador',
        'fecha_inicio',
        'estado',
        'created_at',
    ]
    list_filter = [
        'estado',
        'fecha_inicio',
        'fecha_fin',
        'created_at',
        'colaborador',
    ]
    search_fields = [
        'numero_pedido',
        'cliente__nombre',
        'solicitante',
        'supervisor',
        'colaborador__email',
    ]
    readonly_fields = [
        'numero_pedido',
        'created_at',
        'updated_at',
    ]
    inlines = [ItemPedidoServicioInline]
    
    fieldsets = (
        ('Información del Pedido', {
            'fields': ('numero_pedido', 'estado', 'cliente')
        }),
        ('Personas Involucradas', {
            'fields': ('solicitante', 'colaborador', 'supervisor')
        }),
        ('Fechas de Programación', {
            'fields': ('fecha_inicio', 'fecha_fin')
        }),
        ('Observaciones', {
            'fields': ('observaciones',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
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
        ('Información del Item', {
            'fields': ('pedido_servicio', 'numero_item')
        }),
        ('Ambiente', {
            'fields': ('ambiente',)
        }),
        ('Especificaciones Técnicas', {
            'fields': (
                'modelo',
                'tejido',
                'largura',
                'altura',
                'cantidad_piezas',
                'posicion_tejido',
                'lado_comando',
                'acionamiento',
            )
        }),
        ('Observaciones', {
            'fields': ('observaciones',)
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


@admin.register(AsignacionTarea)
class AsignacionTareaAdmin(admin.ModelAdmin):
    """Interfaz de administración para Asignaciones de Tareas"""
    list_display = [
        'pedido',
        'instalador',
        'tipo_tarea',
        'estado',
        'fecha_asignacion',
        'fecha_entrega_esperada',
    ]
    list_filter = [
        'tipo_tarea',
        'estado',
        'fecha_asignacion',
        'instalador',
    ]
    search_fields = [
        'pedido__numero_pedido',
        'instalador__nombre',
        'instalador__apellido',
    ]
    fieldsets = (
        ('Información de la Tarea', {
            'fields': ('pedido', 'instalador', 'tipo_tarea', 'estado')
        }),
        ('Fechas', {
            'fields': ('fecha_asignacion', 'fecha_inicio_real', 'fecha_entrega_esperada', 'fecha_completacion')
        }),
        ('Descripción', {
            'fields': ('descripcion_tarea', 'notas_progreso')
        }),
    )
    readonly_fields = ('fecha_asignacion',)
    ordering = ['-fecha_asignacion']


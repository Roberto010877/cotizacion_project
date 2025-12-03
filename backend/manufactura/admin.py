from django.contrib import admin
from .models import Manufactura


@admin.register(Manufactura)
class ManufacturaAdmin(admin.ModelAdmin):
    list_display = (
        'get_full_name',
        'usuario',
        'documento',
        'email',
        'cargo',
        'estado',
        'especialidad',
        'ciudad',
        'total_instalaciones',
        'calificacion',
    )
    list_filter = ('cargo', 'estado', 'especialidad', 'ciudad', 'fecha_contratacion')
    search_fields = ('nombre', 'apellido', 'documento', 'email', 'telefono', 'usuario__username')
    readonly_fields = ('total_instalaciones', 'fecha_contratacion')

    fieldsets = (
        ('Vinculación con Sistema', {
            'fields': ('usuario',),
            'description': 'Vincular este personal con un usuario del sistema para que pueda ver sus tareas asignadas.'
        }),
        ('Información Personal', {
            'fields': ('nombre', 'apellido', 'documento', 'email', 'telefono', 'ciudad')
        }),
        ('Datos Laborales', {
            'fields': ('cargo', 'estado', 'especialidad', 'calificacion', 'fecha_contratacion', 'total_instalaciones')
        }),
        ('Notas', {
            'fields': ('observaciones',),
            'classes': ('collapse',)
        }),
    )

    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Nombre Completo'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related()

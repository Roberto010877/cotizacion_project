from django.contrib import admin
from .models import Instalador


@admin.register(Instalador)
class InstaladorAdmin(admin.ModelAdmin):
    list_display = (
        'get_full_name',
        'documento',
        'email',
        'estado',
        'especialidad',
        'ciudad',
        'total_instalaciones',
        'calificacion',
    )
    list_filter = ('estado', 'especialidad', 'ciudad', 'fecha_contratacion')
    search_fields = ('nombre', 'apellido', 'documento', 'email', 'telefono')
    readonly_fields = ('total_instalaciones', 'fecha_contratacion')

    fieldsets = (
        ('Información Personal', {
            'fields': ('nombre', 'apellido', 'documento', 'email', 'telefono', 'ciudad')
        }),
        ('Datos Laborales', {
            'fields': ('estado', 'especialidad', 'calificacion', 'fecha_contratacion', 'total_instalaciones')
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

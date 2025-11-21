from django.contrib import admin
from .models import Pais, TipoDocumentoConfig, TablaCorrelativos


@admin.register(Pais)
class PaisAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'codigo', 'codigo_telefono', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['nombre', 'codigo']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'codigo', 'codigo_telefono')
        }),
        ('Estado', {
            'fields': ('is_active',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TipoDocumentoConfig)
class TipoDocumentoConfigAdmin(admin.ModelAdmin):
    list_display = ['pais', 'nombre', 'codigo', 'es_para_empresa', 'is_active']
    list_filter = ['pais', 'es_para_empresa', 'is_active', 'created_at']
    search_fields = ['nombre', 'codigo', 'pais__nombre']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Información del Documento', {
            'fields': ('pais', 'nombre', 'codigo', 'es_para_empresa')
        }),
        ('Validación', {
            'fields': ('regex_validacion', 'mensaje_error', 'longitud_minima', 'longitud_maxima')
        }),
        ('Estado', {
            'fields': ('is_active',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TablaCorrelativos)
class TablaCorrelativosAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'prefijo', 'generar_codigo_documento', 'estado', 'is_active']
    list_filter = ['estado', 'is_active', 'created_at']
    search_fields = ['nombre', 'prefijo', 'descripcion']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Información del Correlativo', {
            'fields': ('nombre', 'prefijo', 'descripcion')
        }),
        ('Configuración de Número', {
            'fields': ('numero', 'longitud'),
            'description': 'El número se incrementa automáticamente. Longitud define cuántos dígitos se rellenan con ceros.'
        }),
        ('Estado', {
            'fields': ('estado', 'is_active')
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def generar_codigo_documento(self, obj):
        """Mostrar el código generado en la lista"""
        return obj.generar_codigo_documento()
    generar_codigo_documento.short_description = "Código Actual"

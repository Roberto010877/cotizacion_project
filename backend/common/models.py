from django.db import models

class BaseModel(models.Model):
    """
    Modelo base abstracto que incluye campos de auditoría y borrado suave.
    """
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de Actualización")
    is_active = models.BooleanField(default=True, verbose_name="Activo")

    class Meta:
        abstract = True
        ordering = ['-created_at']


class SoftDeleteMixin(models.Model):
    """
    Mixin para borrado suave.
    """
    eliminado = models.BooleanField(default=False, verbose_name="Eliminado")

    class Meta:
        abstract = True

class Pais(BaseModel):
    """
    Modelo para almacenar países.
    """
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre")
    codigo = models.CharField(max_length=2, unique=True, verbose_name="Código ISO 3166-1 Alfa-2")
    codigo_telefono = models.CharField(max_length=5, verbose_name="Código de Teléfono")

    def __str__(self):
        return self.nombre

    class Meta:
        app_label = 'common'
        verbose_name = "País"
        verbose_name_plural = "Países"
        ordering = ['nombre']

class TipoDocumentoConfig(BaseModel):
    """
    Modelo para configurar los tipos de documento por país.
    """
    pais = models.ForeignKey(Pais, on_delete=models.CASCADE, related_name='tipos_documento')
    nombre = models.CharField(max_length=100, verbose_name="Nombre del Documento")
    codigo = models.CharField(max_length=10, verbose_name="Código del Documento")
    regex_validacion = models.CharField(max_length=255, blank=True, verbose_name="Regex de Validación")
    mensaje_error = models.CharField(max_length=255, blank=True, verbose_name="Mensaje de Error de Validación")
    es_para_empresa = models.BooleanField(default=False, verbose_name="¿Es para Empresa?")
    longitud_minima = models.PositiveIntegerField(default=1, verbose_name="Longitud Mínima")
    longitud_maxima = models.PositiveIntegerField(default=50, verbose_name="Longitud Máxima")

    def __str__(self):
        return f"{self.pais.nombre} - {self.nombre}"

    def get_validador(self):
        """
        Retorna una función validadora basada en el regex de validación.
        Si no hay regex, retorna una función que siempre pasa.
        """
        from django.core.exceptions import ValidationError
        import re

        if not self.regex_validacion:
            # Si no hay regex, retornar validador que siempre pasa
            return lambda x: None

        compiled_regex = re.compile(self.regex_validacion)

        def validador(valor):
            if not compiled_regex.match(str(valor)):
                raise ValidationError(
                    self.mensaje_error or f"El documento no cumple con el formato esperado"
                )

        return validador

    class Meta:
        verbose_name = "Configuración de Tipo de Documento"
        verbose_name_plural = "Configuraciones de Tipos de Documento"
        unique_together = ('pais', 'codigo')
        ordering = ['pais__nombre', 'nombre']


class TablaCorrelativos(SoftDeleteMixin, BaseModel):
    """
    Modelo para gestionar correlativos automáticos de documentos.
    Genera códigos secuenciales como: PED-0000001, COT-0000001, etc.
    """
    
    nombre = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nombre del Correlativo",
        help_text="Ej: Pedidos de Servicio, Cotizaciones, Órdenes de Compra"
    )
    
    prefijo = models.CharField(
        max_length=10,
        unique=True,
        verbose_name="Prefijo/Serie",
        help_text="Prefijo único para el documento (ej: PED, COT, OC, FV)"
    )
    
    numero = models.PositiveIntegerField(
        default=0,
        verbose_name="Número Correlativo Actual",
        help_text="Número actual del correlativo (se incrementa automáticamente)"
    )
    
    longitud = models.PositiveIntegerField(
        default=7,
        verbose_name="Longitud del Número",
        help_text="Cantidad de dígitos a rellenar con ceros (ej: 7 para 0000001)"
    )
    
    estado = models.CharField(
        max_length=12,
        choices=[('Activo', 'Activo'), ('Inactivo', 'Inactivo')],
        default='Activo',
        verbose_name="Estado"
    )
    
    descripcion = models.TextField(
        blank=True,
        verbose_name="Descripción",
        help_text="Descripción adicional sobre este correlativo"
    )
    
    def __str__(self):
        return f"{self.nombre} ({self.prefijo}-{self.formato_numero()})"
    
    def formato_numero(self):
        """
        Genera el número correlativo con ceros a la izquierda.
        Ej: 1 -> 0000001 (si longitud es 7)
        """
        return str(self.numero).zfill(self.longitud)
    
    def generar_codigo_documento(self):
        """
        Genera el código completo del documento.
        Ej: PED-0000001
        """
        return f"{self.prefijo}-{self.formato_numero()}"
    
    def obtener_siguiente_codigo(self):
        """
        Obtiene el siguiente código y actualiza el correlativo.
        Este método DEBE usarse de forma atómica para evitar duplicados.
        """
        from django.db import transaction
        
        with transaction.atomic():
            # Bloquear este registro para lectura-escritura
            obj = TablaCorrelativos.objects.select_for_update().get(id=self.id)
            # Incrementar el número
            obj.numero += 1
            obj.save()
            # Retornar el código generado
            return obj.generar_codigo_documento()
    
    class Meta:
        db_table = "common_tabla_correlativos"
        verbose_name = "Tabla de Correlativos"
        verbose_name_plural = "Tablas de Correlativos"
        ordering = ['nombre']

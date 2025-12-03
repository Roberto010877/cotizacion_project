# clientes/models.py
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from common.models import BaseModel, Pais, TipoDocumentoConfig

class Cliente(BaseModel):
    """
    Modelo de cliente con configuración dinámica por país.
    Soporta múltiples países y tipos de documento sin hardcoding.
    """
    
    class TipoCliente(models.TextChoices):
        NUEVO = 'NUEVO', 'Nuevo'
        RECURRENTE = 'RECURRENTE', 'Recurrente'
        VIP = 'VIP', 'VIP'

    class OrigenCliente(models.TextChoices):
        RECOMENDACION = 'RECOMENDACION', 'Recomendación'
        WEB = 'WEB', 'Sitio Web'
        COLABORADOR = 'COLABORADOR', 'Colaborador'
        REDES_SOCIALES = 'REDES_SOCIALES', 'Redes Sociales'
        FERIA = 'FERIA', 'Feria o Evento'
        OTRO = 'OTRO', 'Otro'

    # --- Información Geográfica y Documental ---
    pais = models.ForeignKey(
        Pais, 
        on_delete=models.PROTECT, 
        verbose_name="País",
        help_text="País de origen del cliente"
    )
    
    tipo_documento = models.ForeignKey(
        TipoDocumentoConfig,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Tipo de Documento",
        help_text="Tipo de documento de identificación"
    )
    
    numero_documento = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Número de Documento",
        help_text="Número completo del documento de identificación"
    )
    
    # --- Información Básica del Cliente ---
    nombre = models.CharField(
        max_length=255, 
        verbose_name="Nombre o Razón Social"
    )
    
    direccion = models.TextField(
        blank=True, 
        verbose_name="Dirección Completa"
    )
    
    telefono = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Teléfono/Celular",
        help_text="Incluir código de país"
    )
    
    num_contacto = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name="Número de Contacto",
        help_text="Número adicional para contactarse con el cliente"
    )
    
    email = models.EmailField(
        blank=True, 
        verbose_name="Correo Electrónico"
    )
    
    # --- Campos de Seguimiento y Fidelidad ---
    tipo = models.CharField(
        max_length=20, 
        choices=TipoCliente.choices, 
        default=TipoCliente.NUEVO, 
        verbose_name="Tipo de Cliente"
    )
    
    origen = models.CharField(
        max_length=20, 
        choices=OrigenCliente.choices, 
        default=OrigenCliente.OTRO, 
        verbose_name="Origen del Cliente"
    )
    
    fecha_ultima_compra = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Fecha de Última Compra"
    )
    
    total_gastado = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0.00, 
        verbose_name="Total Gastado"
    )
    
    numero_de_compras = models.PositiveIntegerField(
        default=0, 
        verbose_name="Número de Compras"
    )
    
    # --- Campos Adicionales ---
    notas = models.TextField(
        blank=True, 
        verbose_name="Notas Internas"
    )
    
    fecha_nacimiento = models.DateField(
        null=True, 
        blank=True, 
        verbose_name="Fecha de Nacimiento"
    )
    
    preferencias_contacto = models.CharField(
        max_length=10,
        choices=[
            ('EMAIL', 'Email'), 
            ('WHATSAPP', 'WhatsApp'), 
            ('LLAMADA', 'Llamada'),
            ('SMS', 'SMS')
        ],
        default='WHATSAPP',
        verbose_name="Preferencia de Contacto"
    )

    # --- Campos Específicos Dinámicos ---
    datos_especificos = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Datos Específicos por País",
        help_text="Datos adicionales específicos del país/tipo de documento"
    )

    # --- Relación con Usuario ---
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='perfil_cliente'
    )

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ['-created_at', 'nombre']
        indexes = [
            models.Index(fields=['pais', 'tipo_documento']),
            models.Index(fields=['numero_documento']),
            models.Index(fields=['tipo', 'is_active']),
            models.Index(fields=['fecha_ultima_compra']),
            models.Index(fields=['total_gastado']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['pais', 'tipo_documento', 'numero_documento'],
                name='unique_documento_por_pais_tipo'
            )
        ]

    def __str__(self):
        return f"{self.nombre} ({self.tipo_documento.nombre}: {self.numero_documento})"

    def clean(self):
        """
        Validación personalizada para el documento según la configuración
        """
        super().clean()
        
        if self.tipo_documento and self.numero_documento:
            # Validar formato con regex
            try:
                validador = self.tipo_documento.get_validador()
                validador(self.numero_documento)
            except ValidationError as e:
                raise ValidationError({
                    'numero_documento': str(e)
                })
            
            # Validar longitud
            longitud = len(self.numero_documento)
            min_long = self.tipo_documento.longitud_minima
            max_long = self.tipo_documento.longitud_maxima
            
            if not (min_long <= longitud <= max_long):
                raise ValidationError({
                    'numero_documento': f'Longitud debe estar entre {min_long} y {max_long} caracteres. Actual: {longitud}'
                })
            
            # Validar que tipo de documento pertenece al país seleccionado
            if self.pais != self.tipo_documento.pais:
                raise ValidationError({
                    'tipo_documento': f'El tipo de documento "{self.tipo_documento.nombre}" no pertenece al país "{self.pais.nombre}"'
                })

    def save(self, *args, **kwargs):
        """Sobrescribir save para incluir clean()"""
        self.clean()
        super().save(*args, **kwargs)

    # --- Propiedades Calculadas ---
    
    @property
    def es_empresa(self):
        """Determina si el cliente es una empresa"""
        return self.tipo_documento.es_para_empresa

    @property
    def documento_formateado(self):
        """Retorna el documento formateado según las reglas del país"""
        # Aquí puedes agregar lógica específica de formateo si es necesario
        return self.numero_documento

    @property
    def telefono_completo(self):
        """Retorna el teléfono con código de país"""
        if self.telefono and self.pais.codigo_telefono:
            return f"{self.pais.codigo_telefono} {self.telefono}"
        return self.telefono

    @property
    def promedio_compra(self):
        """Calcula el promedio de gasto por compra"""
        if self.numero_de_compras > 0:
            return self.total_gastado / self.numero_de_compras
        return 0

    @property
    def es_cliente_activo(self):
        """Determina si el cliente es activo (compra en últimos 6 meses)"""
        if not self.fecha_ultima_compra:
            return False
        from django.utils import timezone
        return (timezone.now() - self.fecha_ultima_compra).days <= 180

    # --- Métodos de Negocio ---
    
    def actualizar_estadisticas(self, monto_compra):
        """Actualiza estadísticas después de una compra"""
        from django.utils import timezone
        
        self.total_gastado += monto_compra
        self.numero_de_compras += 1
        self.fecha_ultima_compra = timezone.now()
        
        # Lógica automática de actualización de tipo
        if self.numero_de_compras >= 10 and self.total_gastado > 1000:
            self.tipo = self.TipoCliente.VIP
        elif self.numero_de_compras >= 3:
            self.tipo = self.TipoCliente.RECURRENTE
            
        self.save()

    def agregar_dato_especifico(self, clave, valor):
        """Agrega un dato específico al JSON field"""
        datos = self.datos_especificos.copy()
        datos[clave] = valor
        self.datos_especificos = datos
        self.save()

    def obtener_dato_especifico(self, clave, default=None):
        """Obtiene un dato específico del JSON field"""
        return self.datos_especificos.get(clave, default)
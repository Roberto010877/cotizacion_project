from django.db import models
from django.conf import settings
from common.models import BaseModel


class Manufactura(BaseModel):
    """
    Modelo de Personal de Manufactura.
    Representa a los técnicos/trabajadores que realizan fabricaciones e instalaciones.
    Vinculado opcionalmente con User para acceso al sistema.
    """
    
    class Cargo(models.TextChoices):
        MANUFACTURADOR = 'MANUFACTURADOR', 'Manufacturador'
        INSTALADOR = 'INSTALADOR', 'Instalador'
        COMERCIAL = 'COMERCIAL', 'Comercial'
    
    class EstadoInstalador(models.TextChoices):
        ACTIVO = 'ACTIVO', 'Activo'
        INACTIVO = 'INACTIVO', 'Inactivo'
        VACACIONES = 'VACACIONES', 'En Vacaciones'
        BAJA = 'BAJA', 'De Baja'
    
    # Relación con usuario del sistema (opcional)
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='personal_manufactura',
        verbose_name="Usuario del Sistema",
        help_text="Usuario para acceso al sistema (opcional). Si se vincula, podrá ver sus tareas asignadas."
    )
    
    # Cargo/Rol
    cargo = models.CharField(
        max_length=20,
        choices=Cargo.choices,
        default=Cargo.INSTALADOR,
        verbose_name="Cargo",
        help_text="Tipo de trabajo: Manufacturador o Instalador"
    )
    
    # Datos Personales
    nombre = models.CharField(
        max_length=100,
        verbose_name="Nombre",
        help_text="Nombre del instalador"
    )
    
    apellido = models.CharField(
        max_length=100,
        verbose_name="Apellido",
        help_text="Apellido del instalador"
    )
    
    documento = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Documento de Identidad",
        help_text="DNI, Cédula, Pasaporte, etc."
    )
    
    # Contacto
    email = models.EmailField(
        verbose_name="Email",
        help_text="Correo electrónico del instalador"
    )
    
    telefono = models.CharField(
        max_length=20,
        verbose_name="Teléfono",
        help_text="Teléfono de contacto"
    )
    
    # Ubicación
    ciudad = models.CharField(
        max_length=100,
        verbose_name="Ciudad",
        blank=True,
        help_text="Ciudad donde opera el instalador"
    )
    
    # Estado
    estado = models.CharField(
        max_length=20,
        choices=EstadoInstalador.choices,
        default=EstadoInstalador.ACTIVO,
        verbose_name="Estado",
        help_text="Estado actual del instalador"
    )
    
    # Información Laboral
    fecha_contratacion = models.DateField(
        verbose_name="Fecha de Contratación",
        null=True,
        blank=True
    )
    
    especialidad = models.CharField(
        max_length=100,
        verbose_name="Especialidad",
        blank=True,
        help_text="Ej: Cortinas motorizadas, Persianas, Instalaciones rápidas"
    )
    
    calificacion = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        verbose_name="Calificación",
        help_text="Calificación promedio (0-5)"
    )
    
    total_instalaciones = models.PositiveIntegerField(
        default=0,
        verbose_name="Total de Instalaciones",
        help_text="Número total de instalaciones completadas"
    )
    
    # Notas
    observaciones = models.TextField(
        verbose_name="Observaciones",
        blank=True,
        help_text="Notas adicionales sobre el instalador"
    )
    
    class Meta:
        verbose_name = "Personal de Manufactura"
        verbose_name_plural = "Personal de Manufactura"
        ordering = ['nombre', 'apellido']
        indexes = [
            models.Index(fields=['documento']),
            models.Index(fields=['estado']),
            models.Index(fields=['ciudad']),
            models.Index(fields=['cargo']),
        ]
    
    def __str__(self):
        return f"{self.nombre} {self.apellido}"
    
    def get_full_name(self):
        """Retorna el nombre completo del instalador"""
        return f"{self.nombre} {self.apellido}".strip()
    
    def is_disponible(self):
        """Retorna True si el instalador está disponible para trabajar"""
        return self.estado == self.EstadoInstalador.ACTIVO

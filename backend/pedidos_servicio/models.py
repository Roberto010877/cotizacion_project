from django.db import models
from django.conf import settings
from clientes.models import Cliente
from instaladores.models import Instalador
from common.models import BaseModel


class PedidoServicio(BaseModel):
    """
    Modelo MAESTRO para pedidos de servicio.
    Un pedido puede contener múltiples items (detalles de instalación por ambiente).
    
    Flujo:
    1. Sra. Rita (solicitante) crea un pedido con múltiples ambientes/cortinas
    2. Sistema fabrica según especificaciones
    3. Instalador (colaborador) instala las cortinas
    """
    
    class EstadoPedido(models.TextChoices):
        ENVIADO = 'ENVIADO', 'Enviado'
        ACEPTADO = 'ACEPTADO', 'Aceptado'
        EN_FABRICACION = 'EN_FABRICACION', 'En Fabricación'
        LISTO_INSTALAR = 'LISTO_INSTALAR', 'Listo para Instalar'
        INSTALADO = 'INSTALADO', 'Instalado'
        COMPLETADO = 'COMPLETADO', 'Completado'
        RECHAZADO = 'RECHAZADO', 'Rechazado'
        CANCELADO = 'CANCELADO', 'Cancelado'
    
    # --- Identificación del Pedido ---
    numero_pedido = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Número de Pedido",
        help_text="Identificador único del pedido (ej: PED-0000001)",
        editable=False
    )
    
    # --- Personas Involucradas ---
    solicitante = models.CharField(
        max_length=150,
        verbose_name="Solicitante",
        blank=True,
        help_text="Persona que solicita el pedido (ej: Sra. Rita)"
    )
    
    colaborador = models.ForeignKey(
        Instalador,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pedidos_servicio',
        verbose_name="Instalador",
        help_text="Instalador asignado para realizar la instalación"
    )
    
    supervisor = models.CharField(
        max_length=150,
        verbose_name="Supervisor",
        blank=True,
        help_text="Persona que supervisa la instalación"
    )
    
    # --- Cliente y Contacto ---
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        related_name='pedidos_servicio',
        verbose_name="Cliente",
        help_text="Cliente para el cual se realiza el servicio"
    )
    
    # --- Fechas de Programación ---
    fecha_inicio = models.DateField(
        verbose_name="Fecha de Inicio",
        null=True,
        blank=True,
        help_text="Fecha prevista de inicio de instalación"
    )
    
    fecha_fin = models.DateField(
        verbose_name="Fecha de Fin",
        null=True,
        blank=True,
        help_text="Fecha prevista de finalización de instalación"
    )
    
    # --- Estado y Control ---
    estado = models.CharField(
        max_length=20,
        choices=EstadoPedido.choices,
        default=EstadoPedido.ENVIADO,
        verbose_name="Estado del Pedido"
    )
    
    # --- Notas Generales ---
    observaciones = models.TextField(
        verbose_name="Observaciones Generales",
        blank=True,
        help_text="Notas internas sobre el pedido completo"
    )
    
    def __str__(self):
        return f"Pedido {self.numero_pedido} - {self.cliente.nombre}"
    
    def save(self, *args, **kwargs):
        # Generar número de pedido si no existe (solo en creación)
        if not self.numero_pedido:
            from common.models import TablaCorrelativos
            
            correlativo, created = TablaCorrelativos.objects.get_or_create(
                prefijo='PED',
                defaults={
                    'nombre': 'Pedidos de Servicio',
                    'numero': 0,
                    'longitud': 7,
                    'estado': 'Activo',
                    'descripcion': 'Correlativo automático para pedidos de servicio'
                }
            )
            
            self.numero_pedido = correlativo.obtener_siguiente_codigo()
        
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Pedido de Servicio"
        verbose_name_plural = "Pedidos de Servicio"
        indexes = [
            models.Index(fields=['estado', '-created_at']),
            models.Index(fields=['cliente', 'estado']),
            models.Index(fields=['colaborador', 'estado']),
        ]


class ItemPedidoServicio(BaseModel):
    """
    Modelo DETALLE para items de un pedido de servicio.
    Cada item representa una cortina/persiana a instalar en un ambiente específico.
    """
    
    class PosicionTejido(models.TextChoices):
        NORMAL = 'NORMAL', 'Normal'
        INVERSO = 'INVERSO', 'Inverso'
    
    class LadoComando(models.TextChoices):
        IZQUIERDO = 'IZQUIERDO', 'Izquierdo'
        DERECHO = 'DERECHO', 'Derecho'
        AMBOS = 'AMBOS', 'Ambos'
    
    class Acionamiento(models.TextChoices):
        MANUAL = 'MANUAL', 'Manual'
        MOTORIZADO = 'MOTORIZADO', 'Motorizado'
    
    # --- Relación con Pedido ---
    pedido_servicio = models.ForeignKey(
        PedidoServicio,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name="Pedido de Servicio"
    )
    
    # --- Información del Ambiente ---
    ambiente = models.CharField(
        max_length=200,
        verbose_name="Ambiente",
        help_text="Nombre del ambiente (ej: Varanda, Sala, Dormitorio)"
    )
    
    # --- Especificaciones Técnicas ---
    modelo = models.CharField(
        max_length=100,
        verbose_name="Modelo",
        help_text="Modelo de cortina (ej: Rolô, Persiana, Panel)"
    )
    
    tejido = models.CharField(
        max_length=150,
        verbose_name="Tejido",
        help_text="Tipo y características del tejido (ej: Screen 3% branco)"
    )
    
    largura = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name="Largura (m)",
        help_text="Ancho/Largura en metros"
    )
    
    altura = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name="Altura (m)",
        help_text="Alto/Altura en metros"
    )
    
    cantidad_piezas = models.PositiveIntegerField(
        verbose_name="Cantidad de Piezas",
        help_text="Número de unidades iguales"
    )
    
    posicion_tejido = models.CharField(
        max_length=20,
        choices=PosicionTejido.choices,
        default=PosicionTejido.NORMAL,
        verbose_name="Posición del Tejido"
    )
    
    lado_comando = models.CharField(
        max_length=20,
        choices=LadoComando.choices,
        verbose_name="Lado del Comando",
        help_text="Lado donde va instalado el comando/control"
    )
    
    acionamiento = models.CharField(
        max_length=20,
        choices=Acionamiento.choices,
        verbose_name="Accionamiento"
    )
    
    # --- Observaciones Específicas del Item ---
    observaciones = models.TextField(
        verbose_name="Observaciones",
        blank=True,
        help_text="Notas específicas para este item (ej: instalación por fuera del vão)"
    )
    
    # --- Orden y Organización ---
    numero_item = models.PositiveIntegerField(
        verbose_name="Número de Item",
        help_text="Orden del item dentro del pedido"
    )
    
    def __str__(self):
        return f"Item {self.numero_item} - {self.ambiente} ({self.modelo})"
    
    class Meta:
        ordering = ['numero_item']
        verbose_name = "Item de Pedido de Servicio"
        verbose_name_plural = "Items de Pedidos de Servicio"
        unique_together = ['pedido_servicio', 'numero_item']
        indexes = [
            models.Index(fields=['pedido_servicio', 'numero_item']),
        ]


class AsignacionTarea(BaseModel):
    """
    Modelo para asignar tareas de fabricación e instalación.
    Vincula un Pedido con un Instalador (fabricante o instalador).
    """
    
    class TipoTarea(models.TextChoices):
        FABRICACION = 'FABRICACION', 'Fabricación'
        INSTALACION = 'INSTALACION', 'Instalación'
    
    class EstadoTarea(models.TextChoices):
        PENDIENTE = 'PENDIENTE', 'Pendiente'
        EN_PROGRESO = 'EN_PROGRESO', 'En Progreso'
        COMPLETADO = 'COMPLETADO', 'Completado'
        CANCELADO = 'CANCELADO', 'Cancelado'
    
    # Relaciones
    pedido = models.ForeignKey(
        PedidoServicio,
        on_delete=models.CASCADE,
        related_name='asignaciones',
        verbose_name="Pedido de Servicio"
    )
    
    instalador = models.ForeignKey(
        Instalador,
        on_delete=models.CASCADE,
        related_name='tareas_asignadas',
        verbose_name="Instalador/Fabricante"
    )
    
    # Datos de la Tarea
    tipo_tarea = models.CharField(
        max_length=20,
        choices=TipoTarea.choices,
        verbose_name="Tipo de Tarea",
        help_text="¿Es fabricación o instalación?"
    )
    
    estado = models.CharField(
        max_length=20,
        choices=EstadoTarea.choices,
        default=EstadoTarea.PENDIENTE,
        verbose_name="Estado de la Tarea"
    )
    
    # Fechas
    fecha_asignacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Asignación"
    )
    
    fecha_inicio_real = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de Inicio Real"
    )
    
    fecha_entrega_esperada = models.DateField(
        verbose_name="Fecha de Entrega Esperada",
        null=True,
        blank=True
    )
    
    fecha_completacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de Completación"
    )
    
    # Observaciones
    descripcion_tarea = models.TextField(
        verbose_name="Descripción de la Tarea",
        blank=True,
        help_text="Detalles específicos de lo que debe hacerse"
    )
    
    notas_progreso = models.TextField(
        verbose_name="Notas de Progreso",
        blank=True,
        help_text="Actualizaciones durante la ejecución"
    )
    
    class Meta:
        verbose_name = "Asignación de Tarea"
        verbose_name_plural = "Asignaciones de Tareas"
        ordering = ['-fecha_asignacion']
        indexes = [
            models.Index(fields=['instalador', 'estado']),
            models.Index(fields=['pedido', 'tipo_tarea']),
            models.Index(fields=['estado', '-fecha_asignacion']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['pedido', 'tipo_tarea', 'instalador'],
                name='unique_asignacion_por_tipo'
            )
        ]
    
    def __str__(self):
        return f"{self.get_tipo_tarea_display()} - {self.pedido.numero_pedido} - {self.instalador.get_full_name()}"
    
    @property
    def esta_pendiente(self):
        return self.estado == self.EstadoTarea.PENDIENTE
    
    @property
    def esta_en_progreso(self):
        return self.estado == self.EstadoTarea.EN_PROGRESO
    
    @property
    def esta_completada(self):
        return self.estado == self.EstadoTarea.COMPLETADO
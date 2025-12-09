from django.db import models
from django.conf import settings
from clientes.models import Cliente
from manufactura.models import Manufactura
from common.models import BaseModel


class PedidoServicio(BaseModel):
    """
    MODELO MAESTRO DE PEDIDO DE SERVICIO

    - El solicitante es un TEXTO (ej: "Rita López") para reportes
    - Además se guarda el usuario real en usuario_creacion (desde BaseModel)
    - Se asigna un manufacturador (Manufactura)
    - Se asigna un instalador (Manufactura)
    - Todo el control de acceso se maneja por GRUPOS de Django
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

    # --- IDENTIFICACIÓN ---
    numero_pedido = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Número de Pedido",
        editable=False
    )

    # --- SOLICITANTE (TEXTO PARA REPORTES) ---
    solicitante = models.CharField(
        max_length=150,
        verbose_name="Solicitante",
        blank=True,
        help_text="Nombre de la persona que solicita el pedido (ej: Rita López)"
    )

    # --- PERSONAS INVOLUCRADAS ---
    manufacturador = models.ForeignKey(
        Manufactura,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pedidos_como_manufacturador',
        verbose_name="manufacturador"
    )

    instalador = models.ForeignKey(
        Manufactura,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pedidos_como_instalador',
        verbose_name="instalador"
    )
    supervisor = models.CharField(
        max_length=150,
        verbose_name="Supervisor",
        blank=True,
        help_text="Persona que supervisa la instalación"
    )
    # --- CLIENTE ---
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        related_name='pedidos_servicio',
        verbose_name="Cliente"
    )

    # --- FECHAS ---
    fecha_emision = models.DateField(
        verbose_name="Fecha de Emisión",
        null=True,
        blank=True,
        help_text="Fecha en que se emitió el pedido de servicio"
    )

    fecha_inicio = models.DateField(
        verbose_name="Fecha de Inicio",
        null=True,
        blank=True
    )

    fecha_fin = models.DateField(
        verbose_name="Fecha de Fin",
        null=True,
        blank=True
    )

    # --- ESTADO ---
    estado = models.CharField(
        max_length=20,
        choices=EstadoPedido.choices,
        default=EstadoPedido.ENVIADO
    )

    # --- OBSERVACIONES ---
    observaciones = models.TextField(
        verbose_name="Observaciones Generales",
        blank=True
    )

    def __str__(self):
        return f"Pedido {self.numero_pedido} - {self.cliente.nombre}"

    def save(self, *args, **kwargs):
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
            models.Index(fields=['manufacturador', 'estado']),
            models.Index(fields=['instalador', 'estado']),
        ]
        permissions = [
            ("can_change_to_aceptado", "Puede cambiar estado a Aceptado"),
            ("can_change_to_en_fabricacion", "Puede cambiar estado a En Fabricación"),
            ("can_change_to_listo_instalar", "Puede cambiar estado a Listo para Instalar"),
            ("can_change_to_instalado", "Puede cambiar estado a Instalado"),
            ("can_change_to_completado", "Puede cambiar estado a Completado"),
            ("can_change_to_rechazado", "Puede rechazar pedidos"),
            ("can_change_to_cancelado", "Puede cancelar pedidos"),
            ("can_delete_pedido", "Puede eliminar pedidos en estado ENVIADO"),
        ]



class ItemPedidoServicio(BaseModel):

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

    pedido_servicio = models.ForeignKey(
        PedidoServicio,
        on_delete=models.CASCADE,
        related_name='items'
    )

    ambiente = models.CharField(max_length=200)
    modelo = models.CharField(max_length=100)
    tejido = models.CharField(max_length=150)

    largura = models.DecimalField(max_digits=5, decimal_places=2)
    altura = models.DecimalField(max_digits=5, decimal_places=2)

    cantidad_piezas = models.PositiveIntegerField()

    posicion_tejido = models.CharField(
        max_length=20,
        choices=PosicionTejido.choices,
        default=PosicionTejido.NORMAL
    )

    lado_comando = models.CharField(
        max_length=20,
        choices=LadoComando.choices
    )

    acionamiento = models.CharField(
        max_length=20,
        choices=Acionamiento.choices
    )

    observaciones = models.TextField(blank=True)

    numero_item = models.PositiveIntegerField()

    def __str__(self):
        return f"Item {self.numero_item} - {self.ambiente}"

    class Meta:
        ordering = ['numero_item']
        unique_together = ['pedido_servicio', 'numero_item']

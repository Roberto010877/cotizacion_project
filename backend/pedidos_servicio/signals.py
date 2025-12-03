"""
Señales para el app pedidos_servicio.

Dispara acciones automáticas cuando ocurren eventos como:
- Cambiar estado de PedidoServicio → Notificar cambios por email
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
import logging

from .models import PedidoServicio
from .constants import (
    ESTADOS_NOTIFICACION_FABRICADOR,
    ESTADOS_NOTIFICACION_INSTALADOR,
    MENSAJES_ESTADO
)

logger = logging.getLogger(__name__)


@receiver(post_save, sender=PedidoServicio)
def notificar_cambio_pedido(sender, instance, created, **kwargs):
    """
    Signal que se dispara cuando se crea o actualiza un PedidoServicio.
    
    - Si es CREACIÓN: Envía email de NUEVO PEDIDO a fabricador e instalador
    - Si es ACTUALIZACIÓN: Envía email de CAMBIO DE ESTADO
    """
    try:
        if created:
            enviar_email_nuevo_pedido(instance)
        else:
            enviar_email_cambio_estado_pedido(instance)
    except Exception as e:
        logger.error(f"Error al enviar email de PedidoServicio {instance.numero_pedido}: {str(e)}")


def enviar_email_nuevo_pedido(pedido):
    """
    Envía email cuando se crea un nuevo pedido.
    
    Notifica tanto al fabricador como al instalador asignados.
    """
    
    fabricador = pedido.fabricador
    instalador = pedido.instalador
    cliente = pedido.cliente
    
    # Notificar al fabricador
    if fabricador and fabricador.email:
        asunto = f"Nuevo Pedido de Fabricación: {pedido.numero_pedido}"
        mensaje = f"""
Estimado/a {fabricador.get_full_name()},

Se le ha asignado un nuevo pedido de fabricación:

Pedido: {pedido.numero_pedido}
Cliente: {cliente.nombre if cliente else 'N/A'}
Solicitante: {pedido.solicitante or 'N/A'}
Fecha inicio: {pedido.fecha_inicio}

Por favor revisar los detalles del pedido en el sistema.

Saludos,
Sistema Cotidomo
        """
        
        enviar_email(fabricador.email, asunto, mensaje)
    
    # Notificar al instalador
    if instalador and instalador.email:
        asunto = f"Nuevo Pedido de Instalación: {pedido.numero_pedido}"
        mensaje = f"""
Estimado/a {instalador.get_full_name()},

Se le ha asignado un nuevo pedido de instalación:

Pedido: {pedido.numero_pedido}
Cliente: {cliente.nombre if cliente else 'N/A'}
Solicitante: {pedido.solicitante or 'N/A'}
Fecha inicio: {pedido.fecha_inicio}

Por favor revisar los detalles del pedido en el sistema.

Saludos,
Sistema Cotidomo
        """
        
        enviar_email(instalador.email, asunto, mensaje)


def enviar_email_cambio_estado_pedido(pedido):
    """
    Envía email cuando cambia el estado de un pedido.
    
    Solo notifica si el estado es relevante para fabricador o instalador.
    """
    
    fabricador = pedido.fabricador
    instalador = pedido.instalador
    estado_texto = MENSAJES_ESTADO.get(pedido.estado, f'Estado: {pedido.estado}')
    
    # Notificar al fabricador si el estado es relevante
    if fabricador and fabricador.email and pedido.estado in ESTADOS_NOTIFICACION_FABRICADOR:
        asunto = f"Actualización de Pedido: {pedido.numero_pedido} - {estado_texto}"
        mensaje = f"""
Estimado/a {fabricador.get_full_name()},

El pedido {pedido.numero_pedido} ha cambiado a estado: {estado_texto}

Por favor revisar los detalles en el sistema.

Saludos,
Sistema Cotidomo
        """
        enviar_email(fabricador.email, asunto, mensaje)
    
    # Notificar al instalador si el estado es relevante
    if instalador and instalador.email and pedido.estado in ESTADOS_NOTIFICACION_INSTALADOR:
        asunto = f"Actualización de Pedido: {pedido.numero_pedido} - {estado_texto}"
        mensaje = f"""
Estimado/a {instalador.get_full_name()},

El pedido {pedido.numero_pedido} ha cambiado a estado: {estado_texto}

Por favor revisar los detalles en el sistema.

Saludos,
Sistema Cotidomo
        """
        enviar_email(instalador.email, asunto, mensaje)


def enviar_email(destinatario, asunto, mensaje):
    """
    Función auxiliar para enviar emails.
    
    Args:
        destinatario: Email del destinatario
        asunto: Asunto del email
        mensaje: Cuerpo del email (texto plano)
    
    Note:
        fail_silently=True evita que errores de email interrumpan el flujo.
        Configurar SendGrid en settings.py para emails de producción.
    """
    try:
        send_mail(
            subject=asunto,
            message=mensaje,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[destinatario],
            fail_silently=True,
        )
        logger.info(f"✅ Email enviado a {destinatario}: {asunto}")
    except Exception as e:
        logger.error(f"❌ Error al enviar email a {destinatario}: {str(e)}")

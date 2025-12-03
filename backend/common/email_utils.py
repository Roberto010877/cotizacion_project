"""
Utilidades para envío de emails usando Gmail SMTP
"""
import logging
from django.conf import settings
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def send_installer_access_email(instalador, username, password):
    """
    Envía credenciales de acceso a un instalador usando Gmail SMTP
    
    Args:
        instalador: Instancia de Instalador
        username: Username generado
        password: Contraseña generada
    
    Returns:
        bool: True si se envió exitosamente, False en caso contrario
    """
    try:
        # Verificar que esté configurado el email
        if not settings.EMAIL_HOST_USER:
            logger.warning("EMAIL_HOST_USER no configurado. Email no será enviado.")
            return False
        
        # Contenido del email en HTML
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50;">¡Bienvenido a Cotidomo!</h2>
                    
                    <p>Hola <strong>{instalador.nombre} {instalador.apellido}</strong>,</p>
                    
                    <p>Tu acceso al sistema ha sido creado exitosamente. A continuación encontrarás tus credenciales:</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3498db;">
                        <p style="margin: 10px 0;"><strong>👤 Usuario:</strong></p>
                        <p style="background-color: white; padding: 10px; border-radius: 3px; font-family: 'Courier New', monospace; margin: 0;">{username}</p>
                        
                        <p style="margin: 15px 0 10px 0;"><strong>🔐 Contraseña:</strong></p>
                        <p style="background-color: white; padding: 10px; border-radius: 3px; font-family: 'Courier New', monospace; margin: 0;">{password}</p>
                    </div>
                    
                    <p style="margin: 20px 0;">
                        <a href="{settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:5173'}/login" 
                           style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                            → Acceder al Sistema
                        </a>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    
                    <p style="color: #666; font-size: 13px; margin: 15px 0;">
                        <strong>⚠️ Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña en tu primer acceso.
                    </p>
                    
                    <p style="color: #666; font-size: 13px; margin: 15px 0;">
                        Si tienes problemas para acceder o perdiste tus credenciales, contacta al administrador del sistema.
                    </p>
                    
                    <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 12px; color: #555;">
                        <p style="margin: 0;">
                            <strong>Cotidomo Team</strong><br>
                            Sistema de Gestión de Servicios
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Crear mensaje de email
        subject = '🔐 Tus credenciales de acceso - Cotidomo'
        from_email = settings.EMAIL_HOST_USER
        to_email = [instalador.email]
        
        # Crear versión de texto plano
        text_content = f"""
Bienvenido a Cotidomo!

Hola {instalador.nombre} {instalador.apellido},

Tu acceso al sistema ha sido creado exitosamente.

CREDENCIALES DE ACCESO:
Usuario: {username}
Contraseña: {password}

Accede en: {settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:5173'}/login

IMPORTANTE: Por seguridad, cambia tu contraseña en tu primer acceso.

Si tienes problemas, contacta al administrador.

Cotidomo Team
        """
        
        # Crear email con alternativa HTML
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=to_email
        )
        email.attach_alternative(html_content, "text/html")
        
        # Enviar
        email.send(fail_silently=False)
        
        logger.info(f"✅ Email enviado exitosamente a {instalador.email} para usuario {username}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error al enviar email a {instalador.email}: {str(e)}")
        return False


def send_password_reset_email(user_email, reset_token):
    """
    Envía enlace de reset de contraseña
    
    Args:
        user_email: Email del usuario
        reset_token: Token para reset
    
    Returns:
        bool: True si se envió exitosamente
    """
    try:
        if not settings.EMAIL_HOST_USER:
            logger.warning("EMAIL_HOST_USER no configurado.")
            return False
        
        frontend_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:5173'
        reset_url = f"{frontend_url}/reset-password?token={reset_token}"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50;">Restablecer Contraseña</h2>
                    
                    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                    
                    <p style="margin: 20px 0;">
                        <a href="{reset_url}" 
                           style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                            → Restablecer Contraseña
                        </a>
                    </p>
                    
                    <p style="color: #666; font-size: 13px; margin: 15px 0;">
                        Si no solicitaste este cambio, ignora este email. El enlace expirará en 24 horas.
                    </p>
                </div>
            </body>
        </html>
        """
        
        text_content = f"""
Restablecer Contraseña

Recibimos una solicitud para restablecer tu contraseña.

Haz clic en el siguiente enlace: {reset_url}

Si no solicitaste este cambio, ignora este email. El enlace expirará en 24 horas.

Cotidomo Team
        """
        
        email = EmailMultiAlternatives(
            subject='🔐 Restablecer contraseña - Cotidomo',
            body=text_content,
            from_email=settings.EMAIL_HOST_USER,
            to=[user_email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        
        logger.info(f"✅ Email de reset enviado a {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error al enviar email de reset a {user_email}: {str(e)}")
        return False

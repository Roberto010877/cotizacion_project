## Configuración de Envío de Emails - Gmail SMTP

### ¿Qué se implementó?

Se añadió la funcionalidad **completa** para enviar emails a los instaladores cuando se crea su acceso de login. Se utiliza **Gmail SMTP** (más simple que SendGrid).

### Archivos modificados:

1. **`backend/common/email_utils.py`** ✅
   - Función `send_installer_access_email()`: Envía credenciales al instalador
   - Función `send_password_reset_email()`: Para resets de contraseña (futura)
   - Manejo de errores y logging
   - **Ahora usa Gmail SMTP en lugar de SendGrid**

2. **`backend/instaladores/views.py`** ✅
   - Importada función `send_installer_access_email`
   - Método `crear_acceso` envía email automáticamente
   - Respuesta incluye estado de envío de email

3. **`backend/cotidomo_backend/settings.py`** ✅
   - **Configuración de Gmail SMTP (NO SendGrid)**
   - Variables de entorno necesarias

---

## 🔧 **Configuración requerida en `.env`:**

```
EMAIL_HOST_USER=tu_email@gmail.com
EMAIL_HOST_PASSWORD=tu_contraseña_app
FRONTEND_URL=http://localhost:5173
```

---

## 📱 **¿Cómo obtener la contraseña de aplicación de Gmail?**

### Opción 1: Contraseña de Aplicación (RECOMENDADO)

1. Ve a tu cuenta Google: https://myaccount.google.com/
2. En el menú izquierdo → **"Seguridad"**
3. Busca **"Contraseñas de aplicación"**
   - Si no aparece, habilita primero la **Autenticación de dos pasos**
4. Selecciona:
   - App: **Mail**
   - Device: **Windows/Mac/Linux**
5. Google te generará una contraseña de 16 caracteres
6. **Copia esa contraseña** (sin espacios) a tu `.env` como `EMAIL_HOST_PASSWORD`

**Ejemplo `.env`:**
```
EMAIL_HOST_USER=mi.email@gmail.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop
FRONTEND_URL=http://localhost:5173
```

### Opción 2: Contraseña Normal (menos seguro, NO recomendado)

Si no quieres usar contraseña de aplicación:
1. Ve a https://myaccount.google.com/security
2. Busca "Permitir aplicaciones menos seguras"
3. Actívalo
4. Usa tu contraseña normal en `EMAIL_HOST_PASSWORD`

**⚠️ Advertencia:** Esta opción es menos segura.

---

## ✅ **Verifica que funcione:**

### Test 1: Django shell
```bash
cd backend
python manage.py shell
```

```python
from django.core.mail import send_mail

send_mail(
    'Test Cotidomo',
    'Este es un email de prueba',
    'tu_email@gmail.com',
    ['destinatario@gmail.com'],
    fail_silently=False,
)
```

Deberías recibir el email en segundos.

### Test 2: Crear acceso en la API

1. Ve a `http://localhost:5173/instaladores`
2. Crea un instalador con email real
3. Haz clic en "Crear Acceso de Login"
4. **Deberías recibir el email inmediatamente** ✉️

---

## 📬 **Contenido del email:**

El email incluye:
- ✅ Bienvenida personalizada
- ✅ Username y contraseña en formato legible
- ✅ Enlace directo al login del frontend
- ✅ Recomendación de cambiar contraseña
- ✅ Datos de contacto
- ✅ HTML formateado profesionalmente

---

## ❌ **Errores comunes:**

### Error: "Connection refused"
```
SMTPAuthenticationError: (535, b'5.7.8 Username and password not accepted')
```
**Solución:** Revisa que `EMAIL_HOST_USER` y `EMAIL_HOST_PASSWORD` sean correctos

### Error: "530 5.5.1 Authentication Required"
**Solución:** 
- Asegúrate de haber usado **contraseña de aplicación**, no la contraseña normal
- O activa "Permitir aplicaciones menos seguras"

### El email no llega
**Soluciones:**
1. Verifica que `EMAIL_HOST_USER` y `EMAIL_HOST_PASSWORD` están en `.env`
2. Revisa el archivo de logs: `backend/error.log`
3. Abre la consola Django y prueba manualmente:
   ```python
   from common.email_utils import send_installer_access_email
   # Busca un instalador y prueba
   ```

---

## 🔄 **Si algo no funciona:**

1. Reinicia el servidor Django
2. Borra el `.env` anterior si existe
3. Crea uno nuevo con:
   ```
   EMAIL_HOST_USER=tu_email@gmail.com
   EMAIL_HOST_PASSWORD=tu_contraseña_app
   FRONTEND_URL=http://localhost:5173
   ```
4. Vuelve a intentar

---

## 📊 **Respuesta de la API cuando se crea acceso:**

```json
{
  "detail": "Acceso de usuario creado exitosamente",
  "usuario": {
    "username": "nombre_email",
    "email": "instalador@ejemplo.com"
  },
  "email_sent": true,
  "message": "Las credenciales han sido enviadas al email del instalador"
}
```

Si `"email_sent": false`, revisa los logs.

---

## 🚀 **Otras opciones de email:**

Si Gmail no funciona, puedes usar:

### Mailgun
```python
EMAIL_BACKEND = 'django.core.mail.backends.mailgun.EmailBackend'
MAILGUN_ACCESS_KEY = config('MAILGUN_ACCESS_KEY')
MAILGUN_SERVER_NAME = config('MAILGUN_SERVER_NAME')
```

### SendGrid (opción original)
```python
EMAIL_BACKEND = 'anymail.backends.sendgrid.EmailBackend'
ANYMAIL = {
    "SENDGRID_API_KEY": config('SENDGRID_API_KEY'),
}
```

### Desarrollo (Console Backend - solo imprime en consola)
```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

---

**¡Listo! Ahora los emails deberían funcionar correctamente con Gmail SMTP.** 📧✅


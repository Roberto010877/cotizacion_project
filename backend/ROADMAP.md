# 🧭 ROADMAP - Sistema de Cotizaciones y Órdenes de Compra (Cortinas Domotizadas)

## 🚀 Visión General

Sistema integral para la gestión de **cotizaciones**, **órdenes de compra**, y **servicios de instalación** de cortinas y persianas domotizadas.  
Incluye un **portal web** para colaboradores (como la Sra. Rita) y una **app móvil** para la gestión de pedidos, compras y notificaciones.

---

## 🏗️ 1. Arquitectura General

**Backend:** Django + Django REST Framework  
**Frontend Web:** React.js + Vite + TailwindCSS  
**App Móvil:** React Native (Expo)  
**Base de Datos:** PostgreSQL  
**Autenticación:** JWT (SimpleJWT)  
**Correo:** SendGrid / SMTP  
**Infraestructura:** Docker + Nginx + Gunicorn  
**CI/CD:** GitHub Actions (Deploy a Render / Railway / AWS)  

---

## 📘 2. Fases de Desarrollo

### 🔹 Fase 1 — Backend (Django)

1. Crear proyecto base `cotizador_backend`  
2. Configurar `Dockerfile` y `docker-compose.yml`  
3. Configurar gestión de **variables de entorno** (`.env`) para secretos y configuraciones.
4. Crear apps iniciales:
   - `core` → configuración general y usuarios
   - `cotizaciones` → cotizaciones y servicios
   - `compras` → órdenes de compra y proveedores
   - `notificaciones` → envío de correos y alertas push  
5. Definir modelos base con mixins de auditoría (`UserAuditMixin`, `SoftDeleteMixin`)
6. Implementar endpoints REST (DRF)
7. Configurar JWT Auth y permisos por roles
8. Generar PDF para cotizaciones y órdenes de compra (ReportLab / WeasyPrint)
9. Pruebas unitarias (pytest + coverage)

### 🔹 Fase 2 — Portal Web (React)

1. Crear proyecto con Vite + TailwindCSS + React Router  
2. Configurar **Redux Toolkit** para gestión de estado global.
3. Páginas principales:
   - Login / Registro  
   - Panel de Cotizaciones  
   - Crear Cotización (maestro-detalle)  
   - Generar y Descargar PDF  
   - Enviar por correo  
   - Gestión de Proveedores y Órdenes de Compra  
4. Integrar API del backend con Axios  
5. Implementar **Skeleton screens** para mejorar la UX durante la carga de datos.
6. Agregar notificaciones (Toaster / Toastify)  
7. Deploy inicial en Vercel o Netlify  

### 🔹 Fase 3 — App Móvil (React Native)

1. Crear app Expo
2. Login y sincronización con backend
3. Listado de pedidos y servicios
4. Notificaciones push (Expo Notifications)
5. Vista de detalle y actualización de estado (enviado, aceptado, ejecutado)

### 🔹 Fase 4 — Infraestructura y Optimización

1. Configurar Nginx y Gunicorn
2. Deploy en Render / Railway / AWS EC2
3. Certificados SSL y dominios personalizados
4. Automatización CI/CD con GitHub Actions
5. Monitoreo y métricas (Sentry / Grafana)

---

## 🧩 3. Modelado de Datos (Tablas Principales)

### **Usuarios**

- id, nombre, email, rol (Admin, Colaborador, Cliente)
- contraseña (hash), activo, fecha_creación

### **Cotización**

- id, cliente, fecha, total, estado (borrador, enviada, aceptada, rechazada)
- observaciones, usuario_creación

### **DetalleCotización**

- cotización, producto, cantidad, precio_unitario, subtotal

### **Proveedor**

- id, nombre, contacto, teléfono, correo, dirección

### **OrdenCompra**

- id, proveedor, fecha, total, estado (pendiente, enviada, recibida)
- usuario_creación

### **DetalleOrdenCompra**

- orden_compra, producto, cantidad, precio_unitario, subtotal

### **ServicioSubcontratado**

- id, colaborador (Sra. Rita), dirección_instalación, fecha_programada, estado

---

## 🧰 4. Librerías y Dependencias

### **Backend (Django)**

```
django
djangorestframework
djangorestframework-simplejwt
django-filter
python-decouple
reportlab
weasyprint
psycopg2-binary
pytest
pytest-django
django-cors-headers
```

### **Frontend (React)**

```
@reduxjs/toolkit
react-redux
react
react-router-dom
axios
react-select
react-toastify
tailwindcss
vite
jspdf (para descarga PDF cliente-side)
```

### **App Móvil (React Native)**

```

expo
react-navigation
axios
expo-notifications
react-native-paper
```
---

## 🪜 5. Orden de Inicio del Proyecto

1. ✅ **Fase Backend**
   - Estructura Django
   - Modelos, Serializers, Endpoints
   - Generación de PDF
   - Notificaciones por correo

2. 🚧 **Fase Frontend Web**
   - UI de cotizaciones y órdenes
   - Conexión API y pruebas de flujo completo

3. ⏳ **Fase App Móvil**
   - Notificaciones push y actualización de estados

4. 🧱 **Infraestructura y Deploy**
   - Docker, Nginx, GitHub Actions

---

## 📬 6. Próximos pasos inmediatos

1. Crear repositorios (`backend` y `frontend`)  
2. Inicializar proyecto Django y React  
3. Implementar modelo de usuarios y autenticación JWT  
4. Prototipar pantallas en Figma  
5. Establecer entorno de desarrollo local con Docker  

---

© 2025 | Arquitectura diseñada por ChatGPT (GPT-5) y Roberto Carlos Melgar Dorado
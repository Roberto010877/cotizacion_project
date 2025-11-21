
# ✅ CHECKLIST DE PROGRESO - Estado Actual del Proyecto

| Etapa | Enfoque | Estado | Resultado |
|-------|---------|--------|-----------|
| 1️⃣ | Backend base: usuarios, clientes, proveedores, cotizaciones, órdenes de compra | ✅ COMPLETADO | Base sólida implementada |
| 2️⃣ | Frontend: Paginación híbrida (desktop + mobile) para todas las entidades | ✅ COMPLETADO | Sistema funcional y responsive |
| 3️⃣ | Implementar PedidoServicio (modelo + API + admin) | ✅ COMPLETADO | Modelo, serializers, viewset, endpoints listos |
| 4️⃣ | Frontend para PedidoServicio | 🚧 EN PROGRESO | Hook + página en desarrollo |
| 5️⃣ | PDF y correos para cotizaciones y órdenes de compra | ⏳ PRÓXIMO | Documentos listos para enviar |
| 6️⃣ | Portal colaboradores: Frontend para pedidos de servicio | ⏳ PRÓXIMO | Flujo colaborador listo |
| 7️⃣ | Notificaciones y estados | ⏳ PRÓXIMO | Seguimiento completo |
| 8️⃣ | CRUD completo en Frontend (crear, actualizar, eliminar) | ⏳ PRÓXIMO | App funcional 100% |
| 9️⃣ | Optimización y despliegue | ⏳ FUTURO | En producción |

---
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

### 🔹 Fase 1 — Backend (Django) ✅ COMPLETADO

1. ✅ Crear proyecto base `cotizador_backend`  
2. ✅ Configurar `.env` y variables de entorno  
3. ✅ Crear apps iniciales:
   - ✅ `core` → configuración general y usuarios
   - ✅ `clientes` → gestión de clientes
   - ✅ `cotizaciones` → cotizaciones y detalles
   - ✅ `productos` → productos/servicios
   - ✅ `proveedores` → gestión de proveedores
   - ✅ `ordenes_compra` → órdenes de compra
   - 🚧 `pedidos_servicio` → pedidos de servicio (EN PROGRESO)
4. ✅ Definir modelos base con auditoría (`BaseModel`, `SoftDeleteMixin`)
5. ✅ Implementar endpoints REST (DRF) con paginación
6. ✅ Configurar JWT Auth y permisos por roles
7. ⏳ Generar PDF para cotizaciones y órdenes de compra (ReportLab / WeasyPrint)
8. ⏳ Pruebas unitarias (pytest + coverage)

### 🔹 Fase 2 — Portal Web (React) ✅ COMPLETADO (MVP)

1. ✅ Crear proyecto con Vite + TailwindCSS + React Router  
2. ✅ Configurar internacionalización (i18n - 3 idiomas: ES, EN, PT)
3. ✅ Páginas principales:
   - ✅ Login / Autenticación JWT  
   - ✅ Panel de Clientes (CRUD con paginación)
   - ✅ Panel de Cotizaciones (lectura con paginación)
   - ✅ Panel de Proveedores (lectura con paginación)
   - ✅ Panel de Órdenes de Compra (lectura con paginación)
   - ✅ Panel de Productos (lectura con paginación)
   - ✅ Settings / Configuración
   - 🚧 Panel de Pedidos de Servicio (EN PROGRESO)
4. ✅ Implementar sistema de paginación híbrida:
   - ✅ Pagination component (desktop)
   - ✅ InfiniteScroll component (mobile)
   - ✅ useMediaQuery hook (responsive detection)
   - ✅ usePagination hook (estado compartido)
5. ✅ Integrar API del backend con Axios  
6. ✅ Implementar Skeleton screens para loading state
7. ✅ Agregar notificaciones básicas (Toast)  
8. ⏳ Deploy inicial en Vercel o Netlify  
9. ⏳ CRUD completo (crear, actualizar, eliminar)

### 🔹 Fase 3 — Portal Colaboradores (React)

- 🚧 Implementar `PedidoServicio` en backend (EN PROGRESO - Paso 1)
- ⏳ Frontend para pedidos de servicio
- ⏳ Estados y seguimiento

### 🔹 Fase 4 — App Móvil (React Native) ⏳ FUTURO

1. Crear app Expo
2. Login y sincronización con backend
3. Listado de pedidos y servicios
4. Notificaciones push (Expo Notifications)
5. Vista de detalle y actualización de estado

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

## 📬 6. Próximos Pasos Inmediatos

### 🎯 PASO 1 (COMPLETADO) ✅ — Implementar PedidoServicio en Backend
- [x] Crear modelo `PedidoServicio` con campos: colaborador, cliente, dirección, medidas, color, fecha, hora, estado
- [x] Crear Serializers y ViewSet
- [x] Crear endpoints REST: `/api/v1/pedidos-servicio/`
- [x] Añadir permisos por rol (colaboradores pueden crear, admin puede aceptar/ejecutar)
- [x] Registrar en admin.py
- [x] Crear migraciones y aplicarlas

### 🚀 PASO 2 (PRÓXIMO) — Crear Frontend para PedidoServicio
- [ ] Hook: `usePaginatedPedidosServicio`
- [ ] Página de listado con paginación
- [ ] Formulario de creación
- [ ] Estados visuales (badge)

### 📄 PASO 3 — Implementar PDF + Envío de Correos
- [ ] Generar PDF para Cotizaciones
- [ ] Generar PDF para Órdenes de Compra
- [ ] Configurar SendGrid/SMTP
- [ ] Endpoints de envío automático

### ➕ PASO 4 — CRUD Completo en Frontend
- [ ] Crear (POST) Cotizaciones, Órdenes, etc.
- [ ] Actualizar (PUT) estados
- [ ] Eliminar (DELETE)
- [ ] Modales y formularios con validación

### 🔔 PASO 5 — Notificaciones Automáticas
- [ ] Correo automático al crear/actualizar
- [ ] Toast notifications en frontend
- [ ] WebSockets para tiempo real (opcional)  

---

© 2025 | Arquitectura diseñada por ChatGPT (GPT-5) y Roberto Carlos Melgar Dorado

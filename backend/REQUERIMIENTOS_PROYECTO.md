# 📋 Documento de Requerimientos del Sistema de Cotizaciones, Pedidos y Órdenes de Compra

### Proyecto: Cortinas y Persianas Domotizadas


---

## 🧩 1. Contexto del Negocio

El sistema está diseñado para un profesional independiente dedicado a la **instalación y fabricación de cortinas y persianas domotizadas**.  
El proceso actual funciona de la siguiente forma:

- No se dispone de un **almacén** ni de **stock permanente**.
- Los materiales se **compran bajo demanda**, es decir, solo cuando un cliente confirma un pedido o cotización.
- Al confirmarse una cotización, se realiza una **orden de compra a proveedores** para adquirir los materiales necesarios (telas, motores, tubos, etc.).
- El profesional también **colabora con terceros**, como la **Sra. Rita**, quien actúa como agente comercial o intermediaria.
- Estos colaboradores generan **pedidos de servicio** que son atendidos por el profesional principal, sin acceder a sus precios finales con los clientes.

El objetivo del sistema es **digitalizar y automatizar** todo este flujo, desde la cotización hasta la orden de compra y la ejecución del servicio.

---

## 💡 2. Necesidades Principales

### 🔹 Cotizaciones

- Crear cotizaciones personalizadas para clientes propios.
- Incluir productos, servicios, cantidades y precios unitarios.
- Generar documentos PDF descargables y enviarlos por correo.
- Registrar estados: *Borrador, Enviada, Aceptada, Rechazada*.

### 🔹 Órdenes de Compra

- Generar órdenes de compra para proveedores al confirmar una cotización.
- Descargar en PDF y enviar al proveedor.
- Registrar estados: *Pendiente, Enviada, Recibida*.

### 🔹 Pedidos de Servicio (Portal de Colaboradores)
- Colaboradores externos (como la Sra. Rita) pueden ingresar pedidos de servicio.
- El sistema notifica al administrador vía app y correo.
- Los pedidos incluyen: dirección, medidas, color, fecha y hora de instalación.
- Estados: *Enviado, Aceptado, Ejecutado*.

### 🔹 Notificaciones
- Envío automático de correos electrónicos al crear o actualizar cotizaciones, pedidos u órdenes.
- Notificaciones push (a futuro) para la app móvil.

### 🔹 Usuarios y Roles
- **Administrador:** crea cotizaciones, órdenes de compra y gestiona pedidos.
- **Colaborador:** genera pedidos de servicio.
- **Cliente (futuro):** podrá visualizar el estado de su pedido.

### 🔹 Inventario (futuro)
- Control de existencias por proveedor y tipo de material.
- Registro de compras y consumos.
- No es prioridad inmediata.

---

## 🏗️ 3. Componentes del Sistema

1. **Backend (Django + DRF):**  
   - Gestión de usuarios, cotizaciones, pedidos y órdenes.  
   - Generación de PDFs y envío de correos.  
   - API REST para comunicación con las interfaces web y móviles.

2. **Frontend Web (React):**  
   - Aplicación administrativa para gestionar cotizaciones y órdenes.  
   - Portal para colaboradores con registro de pedidos.  
   - Descarga y envío de PDFs directamente desde la interfaz.

3. **App Móvil (React Native - Futura):**  
   - Consulta y actualización de estados de pedidos.  
   - Notificaciones push para instaladores y colaboradores.

---

## 🧱 4. Entidades Principales (Modelos)

| Entidad | Descripción |
|----------|-------------|
| **Usuario** | Representa a un usuario del sistema (Admin o Colaborador). |
| **Cliente** | Persona o empresa que solicita una cotización. |
| **Proveedor** | Empresa a la que se le realizan órdenes de compra. |
| **Producto/Servicio** | Elementos que pueden incluirse en cotizaciones o compras. |
| **Cotización** | Documento comercial que detalla los productos/servicios ofrecidos a un cliente. |
| **DetalleCotización** | Detalle con cantidad, precio unitario y subtotal. |
| **OrdenCompra** | Documento interno para adquirir materiales. |
| **DetalleOrdenCompra** | Detalle de productos a comprar. |
| **PedidoServicio** | Solicitud generada por un colaborador (como la Sra. Rita). |

---

## ⚙️ 5. Flujo General del Sistema

1. **Cotización directa:**  
   - El administrador crea una cotización.  
   - Si el cliente la acepta, se genera una orden de compra.  
   - Se descargan e imprimen ambos documentos (PDF).  
   - Se envían por correo electrónico.

2. **Pedido de colaborador:**  
   - La Sra. Rita ingresa el pedido desde el portal.  
   - El sistema notifica al administrador.  
   - El administrador genera los materiales necesarios mediante una orden de compra.  
   - Se programa la instalación y se marca como *ejecutado* una vez completado.

3. **Orden de compra:**  
   - Se emite un documento PDF con la lista de materiales.  
   - Se envía por correo al proveedor.  
   - Se marca como *recibida* al confirmar la entrega.

4. **Envío de correos automáticos:**  
   - Al crear o actualizar registros clave (cotización, pedido, orden).  
   - Confirmación o recordatorio de instalación.

---

## 🧰 6. Tecnologías Seleccionadas

### **Backend**
- Python 3.x  
- Django 5  
- Django REST Framework  
- PostgreSQL  
- SimpleJWT (autenticación)  
- ReportLab / xhtml2pdf (PDFs)  
- django.core.mail / SendGrid (emails)

### **Frontend**
- React + Vite  
- Tailwind CSS + ShadCN UI  
- React Router  
- Axios (interceptor JWT)  
- React Hook Form  
- React Query  
- React Hot Toast (notificaciones)

### **Móvil (futuro)**
- React Native (Expo)  
- Expo Notifications  
- React Navigation

---

## 📦 7. Librerías Clave

### Backend
```bash
pip install django djangorestframework psycopg2-binary
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install reportlab xhtml2pdf
pip install boto3 sendgrid
```

### Frontend
```bash
npm install react-router-dom axios react-query
npm install react-hook-form react-select react-datepicker
npm install tailwindcss shadcn-ui react-hot-toast
```

---

## 🪜 8. Etapas del Proyecto

1. **Configuración del entorno y base de datos.**
2. **Creación de modelos y migraciones.**
3. **Serializadores y vistas API REST.**
4. **Endpoints para cotizaciones, pedidos y órdenes.**
5. **Generación de PDFs (cotización / orden de compra).**
6. **Configuración de envío de correos.**
7. **Diseño del frontend (dashboard React).**
8. **Integración del portal de colaboradores.**
9. **Pruebas de flujo completo.**
10. **Despliegue en entorno productivo.**

---

## 🧭 9. Próximas Extensiones
- Control de inventario.
- Historial de clientes y proveedores.
- Reportes financieros.
- App móvil con geolocalización de instalaciones.
- Chat interno entre colaborador y administrador.

---

## 🧾 10. Conclusión

El sistema permitirá gestionar de forma eficiente:
- Cotizaciones personalizadas.
- Órdenes de compra automáticas.
- Comunicación fluida con colaboradores.
- Documentos PDF y correos electrónicos automatizados.

El proyecto está diseñado para **escalar gradualmente**, integrando en el futuro módulos de inventario, CRM y facturación electrónica.

---

**Autor:** Roberto Carlos Melgar Dorado  
**Arquitectura y documentación técnica:** ChatGPT (GPT-5)  
**Versión:** 1.0 — Octubre 2025
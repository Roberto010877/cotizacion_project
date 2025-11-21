# 🎯 CÓMO USAR EL FORMULARIO DE PEDIDOS

## 🚀 INICIO RÁPIDO

### 1️⃣ Asegúrate que todo esté corriendo

```bash
# Terminal 1: Backend (Django)
cd backend
python manage.py runserver 0.0.0.0:8000

# Terminal 2: Frontend (Vite)
cd frontend
npm run dev
```

### 2️⃣ Accede al Dashboard

```
http://localhost:5173
```

### 3️⃣ Login (si es requerido)

```
Usuario: (tu usuario)
Contraseña: (tu contraseña)
```

---

## 📍 UBICACIÓN DEL FORMULARIO

### En el Dashboard

```
Sidebar Izquierdo
├── Dashboard
├── Cotizaciones
├── ✨ Pedidos de Servicio  ← AQUÍ
├── Órdenes de Compra
├── Proveedores
├── Clientes
└── Configuración
```

### En la Página de Pedidos

```
┌─────────────────────────────────────────┐
│  Pedidos de Servicio                    │
│  Gestiona tus pedidos de instalación  │  [Nuevo Pedido] ← CLICK AQUÍ
└─────────────────────────────────────────┘

Tabla con pedidos existentes...
```

---

## 📋 FORMULARIO STEP BY STEP

### Dialog Modal que aparece

```
┌─ Nuevo Pedido ─────────────────────────────┐
│                                             │
│  Ingresa los datos del nuevo pedido de     │
│  servicio                                   │
│                                             │
│  ▼ ▼ ▼ FORMULARIO SCROLLABLE ▼ ▼ ▼         │
│                                             │
│  [Cancelar]                    [Crear]     │
└─────────────────────────────────────────────┘
```

### Sección 1: Información General

```
📌 Cliente *                    [Dropdown ▼] ← REQUERIDO
  Opciones:
  - Test
  - Cliente A
  - Cliente B
  - ...

📌 Solicitante
  [Sra. Rita              ]

📌 Supervisor
  [                       ]

📌 Fecha de Inicio
  [    2025-11-25         ]

📌 Fecha de Fin
  [    2025-11-29         ]

📌 Observaciones Generales
  [                       
   Notas generales del   
   pedido...              ]
```

### Sección 2: Items del Pedido

```
📌 Items del Pedido
   Detalles de las cortinas/persianas a instalar

   [+ Agregar Item] ← Click para agregar más

   ┌─ Item 1 ──────────────────────────────┐ [❌]
   │                                         │
   │ Campo          │ Campo                  │
   │ Ambiente *     │ Modelo *               │
   │ [Varanda    ] │ [Rolô              ]   │
   │                │                        │
   │ Tejido *       │ Largura (m) *          │
   │ [Screen 3%  ] │ [2.50              ]   │
   │ branco         │                        │
   │                │                        │
   │ Altura (m) *   │ Cantidad de Piezas     │
   │ [1.80       ] │ [1                 ]   │
   │                │                        │
   │ Posición       │ Lado del Comando       │
   │ [NORMAL     ] │ [IZQUIERDO        ]    │
   │                │                        │
   │ Accionamiento  │                        │
   │ [MANUAL     ]  │                        │
   │                │                        │
   │ Observaciones  │                        │
   │ [Notas del    │                        │
   │  item...]      │                        │
   │                │                        │
   └─────────────────────────────────────────┘

   ┌─ Item 2 ──────────────────────────────┐ [❌]
   │ (similar al anterior)                   │
   └─────────────────────────────────────────┘

   [+ Agregar Item] ← Click para agregar otro
```

---

## 🎮 EJEMPLO: Crear Pedido con 3 Items

### Cliente: "Test"
### Solicitante: "Sra. Rita"
### Supervisor: "Juan García"
### Fechas: 2025-11-25 a 2025-11-29

### Item 1: Varanda
```
Ambiente:         Varanda
Modelo:           Rolô
Tejido:           Screen 3% branco
Largura:          2.50 m
Altura:           1.80 m
Cantidad:         1
Posición Tejido:  NORMAL
Lado Comando:     IZQUIERDO
Accionamiento:    MANUAL
Observaciones:    Instalación padrão
```

### Item 2: Sala
```
Ambiente:         Sala
Modelo:           Persiana
Tejido:           PVC blanco
Largura:          3.00 m
Altura:           2.00 m
Cantidad:         2
Posición Tejido:  INVERSO
Lado Comando:     DERECHO
Accionamiento:    MOTORIZADO
Observaciones:    Motorizada con control remoto
```

### Item 3: Dormitorio
```
Ambiente:         Dormitorio
Modelo:           Cortina
Tejido:           Tela oscura
Largura:          2.00 m
Altura:           2.20 m
Cantidad:         1
Posición Tejido:  NORMAL
Lado Comando:     AMBOS
Accionamiento:    MANUAL
Observaciones:    Cortina blackout
```

---

## ✅ VALIDACIONES A CUMPLIR

### REQUERIDO (campos con *)
```
✓ Cliente - DEBE seleccionar uno
✓ Ambiente por item - DEBE llenar
✓ Modelo por item - DEBE llenar
✓ Tejido por item - DEBE llenar
✓ Largura por item - DEBE ser número
✓ Altura por item - DEBE ser número

✓ Mínimo 1 item - DEBE haber al menos uno
```

### OPCIONALES
```
○ Solicitante (default: "Sra. Rita")
○ Supervisor
○ Fecha inicio
○ Fecha fin
○ Observaciones generales
○ Cantidad piezas (default: 1)
○ Posición tejido (default: NORMAL)
○ Lado comando (default: IZQUIERDO)
○ Accionamiento (default: MANUAL)
○ Observaciones por item
```

---

## 🎬 ACCIONES

### 1. Agregar Item
```
Click [+ Agregar Item]
→ Nuevo item aparece abajo
→ Campos vacíos listos para llenar
```

### 2. Eliminar Item
```
Click [❌] en la esquina superior derecha del item
→ Item se elimina (solo si hay más de 1)
→ Error si intentas eliminar el último
```

### 3. Enviar Formulario
```
Llenar todos los campos requeridos
Click [Crear Pedido]
→ Sistema valida datos
→ Si OK: Toast verde "Pedido creado exitosamente"
→ Dialog se cierra automáticamente
→ Lista se recarga con nuevo pedido
→ Si error: Toast rojo con detalle del error
```

### 4. Cancelar
```
Click [Cancelar]
→ Dialog se cierra
→ Datos no se guardan
```

---

## 📊 QUÉ PASA INTERNAMENTE

### Al Click "Crear Pedido"

```
1. Validación frontend
   ├─ Cliente seleccionado? ✓
   ├─ Mínimo 1 item? ✓
   ├─ Campos requeridos llenos? ✓
   └─ Si alguno falla → Toast error

2. POST /api/v1/pedidos-servicio/
   ├─ Datos del pedido
   └─ Response: ID del pedido

3. Por cada item:
   POST /api/v1/pedidos-servicio/{id}/items/
   ├─ Datos del item
   └─ Response: ID del item

4. Si todo OK:
   ├─ Toast: "Pedido creado exitosamente"
   ├─ Dialog cierra
   └─ Lista recarga automáticamente

5. Si error:
   ├─ Toast: Mensaje de error
   ├─ Dialog permanece abierto
   └─ Usuario puede corregir y reintentar
```

---

## 🔍 VER PEDIDO CREADO

### En la Tabla de Pedidos

```
Número      │ Cliente │ Solicitante │ Fecha    │ Estado   │ Items │ Acciones
────────────┼─────────┼─────────────┼──────────┼──────────┼───────┼──────────
PED-0000007 │ Test    │ Sra. Rita   │ 25/11/25 │ Enviado  │   3   │ [Ver]
```

### Click [Ver]

```
├─ Detalles del Pedido
├─ Información General
│  ├─ Número: PED-0000007
│  ├─ Cliente: Test
│  ├─ Solicitante: Sra. Rita
│  ├─ Fechas: 25/11/25 - 29/11/25
│  └─ Estado: Enviado
│
└─ Items
   ├─ Item 1: Varanda - Rolô (2.50m x 1.80m)
   ├─ Item 2: Sala - Persiana (3.00m x 2.00m)
   └─ Item 3: Dormitorio - Cortina (2.00m x 2.20m)
```

---

## 📱 EN MOBILE

```
Formulario se adapta automáticamente:
- 1 columna (no 2)
- Campos más grandes para touch
- Scroll vertical
- Botones expandidos

Dialog:
- Full width (con márgenes)
- Scrollable
- Botones debajo del formulario
```

---

## ⚡ TIPS Y TRUCOS

### 💡 Tip 1: Pre-llenar "Sra. Rita"
```
Campo "Solicitante" ya viene con "Sra. Rita"
Solo hacer Tab para ir al siguiente
```

### 💡 Tip 2: Agregar múltiples items rápido
```
1. Item 1: Llenar datos + [+ Agregar Item]
2. Item 2: Llenar datos + [+ Agregar Item]
3. Item 3: Llenar datos
4. Click [Crear Pedido]

RESULTADO: 1 Pedido + 3 Items
```

### 💡 Tip 3: Valores por defecto
```
Si no especificas:
- Cantidad piezas = 1
- Posición tejido = NORMAL
- Lado comando = IZQUIERDO
- Accionamiento = MANUAL
```

### 💡 Tip 4: Errores comunes
```
❌ "Cliente es requerido"
   → Solución: Selecciona un cliente en dropdown

❌ "Debe haber al menos un item"
   → Solución: Agrega al menos un item

❌ "Por favor completa todos los campos"
   → Solución: Revisa que ambiente, modelo, tejido, 
               largura y altura estén llenos
```

---

## 🆘 SOPORTE

### Si algo no funciona:

1. **Revisa la consola del navegador** (F12)
   - Busca mensajes de error rojo
   - Anota el error

2. **Verifica el backend**
   - Terminal Backend corriendo? (`runserver`)
   - Puerto 8000 disponible?

3. **Limpia caché**
   - Ctrl+Shift+R (reload hard)
   - F12 → Network → Disable cache

4. **Reinicia todo**
   - Ctrl+C en ambas terminales
   - Ejecuta nuevamente

---

## 📞 CONTACTO

Para reportar bugs o sugerencias:
- Backend: Revisar Django logs
- Frontend: Revisar browser console
- API: Probar con Postman/curl

---

**¡Listo! Tu formulario de pedidos está completamente funcional. 🎉**

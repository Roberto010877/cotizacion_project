# 🧪 GUÍA DE PRUEBA - Sistema de Correlativo & PedidoServicio

## 🎯 Objetivo de Prueba

Validar que el sistema de correlativo automático genera números secuenciales únicos e imposibles de duplicar, y que se integra correctamente con los modelos PedidoServicio, Cotizacion y OrdenCompra.

---

## ✅ Pre-Requisitos

```bash
# 1. Backend ejecutándose
cd backend
python manage.py runserver

# 2. Frontend ejecutándose (en otra terminal)
cd frontend
npm run dev

# 3. Admin accesible
http://localhost:8000/admin/
```

---

## 🧪 Prueba 1: Verificar TablaCorrelativos

### Paso 1: Acceder a Admin Django
```
URL: http://localhost:8000/admin/
Usuario: (admin que creaste)
```

### Paso 2: Navegar a Common → Tabla Correlativos
- Deberías ver una lista vacía (Los correlativos se crean automáticamente)

### Paso 3: Crear primer Pedido (Dispara creación de correlativo)
```
URL: http://localhost:8000/admin/pedidos_servicio/pedidoservicio/add/
1. Selecciona Cliente
2. Ingresa datos básicos
3. Click "Save"
```

### ✅ Resultado Esperado
- El `numero_pedido` se genera automáticamente: **PED-0000001**
- En TablaCorrelativos aparece nuevo registro con prefijo 'PED'

---

## 🧪 Prueba 2: Auto-Incremento de Correlativo

### Paso 1: Crear Segundo Pedido
```
URL: http://localhost:8000/admin/pedidos_servicio/pedidoservicio/add/
1. Selecciona Cliente (igual o diferente)
2. Ingresa datos básicos
3. Click "Save"
```

### ✅ Resultado Esperado
- El `numero_pedido` es: **PED-0000002** (auto-incrementado)
- Diferente al primer pedido
- Orden secuencial garantizado

### Paso 2: Crear Tercero, Cuarto, Quinto
Repite el proceso 3 veces más

### ✅ Resultado Esperado
- PED-0000003
- PED-0000004
- PED-0000005

---

## 🧪 Prueba 3: Unicidad y Prevención de Duplicados

### Paso 1: Intentar Editar Numero de Pedido
```
1. Abre un pedido existente (ej: PED-0000001)
2. Intenta cambiar numero_pedido manualmente
```

### ✅ Resultado Esperado
- El campo `numero_pedido` está **DESHABILITADO** (read-only)
- No permite edición manual
- Protección contra cambios accidentales

### Paso 2: Verificar Unicidad en BD
```bash
# Terminal (en Backend)
python manage.py shell

>>> from pedidos_servicio.models import PedidoServicio
>>> PedidoServicio.objects.values('numero_pedido').count()
# Debe ser igual al número de pedidos creados (sin duplicados)

>>> PedidoServicio.objects.all().values_list('numero_pedido', flat=True)
# Debe mostrar: ('PED-0000001', 'PED-0000002', 'PED-0000003', ...)
```

---

## 🧪 Prueba 4: Concurrencia (Test de Race Condition)

### Paso 1: Simulación de Creaciones Simultáneas
```bash
python manage.py shell

from pedidos_servicio.models import PedidoServicio
from clientes.models import Cliente
from django.utils import timezone
import threading

cliente = Cliente.objects.first()  # Usa cliente existente

# Función para crear pedido
def crear_pedido(num):
    pedido = PedidoServicio(
        cliente=cliente,
        fecha_programada=timezone.now().date(),
        hora_programada='10:00:00'
    )
    pedido.save()
    print(f"Thread {num}: Creado {pedido.numero_pedido}")

# Crear 5 threads simultáneos
threads = []
for i in range(5):
    t = threading.Thread(target=crear_pedido, args=(i,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()
```

### ✅ Resultado Esperado
- Todos los 5 threads generan números diferentes
- Ejemplo output:
  ```
  Thread 0: Creado PED-0000006
  Thread 1: Creado PED-0000007
  Thread 2: Creado PED-0000008
  Thread 3: Creado PED-0000009
  Thread 4: Creado PED-0000010
  ```
- **SIN DUPLICADOS** a pesar del acceso simultáneo

---

## 🧪 Prueba 5: Cotizaciones & Órdenes de Compra

### Paso 1: Crear Cotización
```
URL: http://localhost:8000/admin/cotizaciones/cotizacion/add/
1. Selecciona Cliente
2. Ingresa datos
3. Click "Save"
```

### ✅ Resultado Esperado
- Auto-genera: **COT-0000001**
- Diferente prefijo que PedidoServicio

### Paso 2: Crear Orden de Compra
```
URL: http://localhost:8000/admin/ordenes_compra/ordencompra/add/
1. Selecciona Proveedor
2. Ingresa datos
3. Click "Save"
```

### ✅ Resultado Esperado
- Auto-genera: **OC-0000001**
- Diferente prefijo e independiente

### Paso 3: Verificar Independencia de Contadores
```bash
python manage.py shell

from common.models import TablaCorrelativos

# Debe haber 3 registros (uno por cada tipo de documento)
correlativos = TablaCorrelativos.objects.all()
for c in correlativos:
    print(f"{c.prefijo}: {c.numero}")

# Output esperado:
# PED: 10
# COT: 1
# OC: 1
```

---

## 🧪 Prueba 6: API REST

### Paso 1: Obtener Listado de Pedidos
```bash
curl http://localhost:8000/api/v1/gestion/pedidos-servicio/
```

### ✅ Resultado Esperado
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "numero_pedido": "PED-0000001",
      "cliente": 1,
      "estado": "ENVIADO",
      ...
    },
    ...
  ]
}
```

### Paso 2: Crear Pedido vía API
```bash
curl -X POST http://localhost:8000/api/v1/gestion/pedidos-servicio/ \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": 1,
    "fecha_programada": "2024-01-20",
    "hora_programada": "10:00:00",
    "descripcion_servicio": "Test pedido"
  }'
```

### ✅ Resultado Esperado
- Respuesta con numero_pedido auto-generado
- Status 201 Created

### Paso 3: Verificar que cada llamada API genera número nuevo
```bash
# Llamada 1
curl -X POST http://localhost:8000/api/v1/gestion/pedidos-servicio/ \
  -H "Content-Type: application/json" \
  -d '{...}'
# Response: numero_pedido = PED-0000011

# Llamada 2
curl -X POST http://localhost:8000/api/v1/gestion/pedidos-servicio/ \
  -H "Content-Type: application/json" \
  -d '{...}'
# Response: numero_pedido = PED-0000012
```

---

## 🧪 Prueba 7: Frontend - Paginación con Correlativo

### Paso 1: Navegar a Cotizaciones
```
URL: http://localhost:3173/cotizaciones (o tu puerto local)
```

### ✅ Resultado Esperado
- Tabla muestra `numero_cotizacion` en columna (no ID)
- Ejemplo: "COT-0000001", "COT-0000002", etc.

### Paso 2: Navegar a Órdenes de Compra
```
URL: http://localhost:3173/ordenes-compra
```

### ✅ Resultado Esperado
- Tabla muestra `numero_orden` en columna
- Ejemplo: "OC-0000001", "OC-0000002", etc.

### Paso 3: Cambiar Página
```
1. Click en página 2, 3, etc.
2. Verificar que los números están ordenados
3. Verificar que NO hay duplicados
```

---

## 🧪 Prueba 8: Validación de Formato

### Verificar Formato en BD
```bash
python manage.py shell

from pedidos_servicio.models import PedidoServicio

# Obtener todos los números
numeros = PedidoServicio.objects.all().values_list('numero_pedido', flat=True)

# Validar formato (debe ser PED-0000XXX)
import re
patron = r'^PED-\d{7}$'

for numero in numeros:
    if not re.match(patron, numero):
        print(f"❌ Formato inválido: {numero}")
    else:
        print(f"✓ Formato correcto: {numero}")
```

### ✅ Resultado Esperado
- Todos los números siguen el patrón `PED-0000001`
- 7 dígitos rellenados con ceros
- Prefijo consistente

---

## 🧪 Prueba 9: Soft Delete y Auditoría

### Paso 1: Obtener Pedido
```bash
python manage.py shell

from pedidos_servicio.models import PedidoServicio
pedido = PedidoServicio.objects.first()
print(f"Created by: {pedido.created_by}")
print(f"Created at: {pedido.created_at}")
print(f"Updated at: {pedido.updated_at}")
print(f"Deleted at: {pedido.deleted_at}")
```

### ✅ Resultado Esperado
```
Created by: <usuario>
Created at: 2024-01-20 10:30:45.123456+00:00
Updated at: 2024-01-20 10:30:45.123456+00:00
Deleted at: None
```

### Paso 2: Eliminar Pedido desde Admin
```
1. Abre pedido en admin
2. Click "Delete"
3. Confirma eliminación
```

### Paso 3: Verificar Soft Delete
```bash
python manage.py shell

from pedidos_servicio.models import PedidoServicio

# Pedidos activos (should not include deleted)
active = PedidoServicio.objects.filter(deleted_at__isnull=True)
print(f"Pedidos activos: {active.count()}")

# Todos los pedidos (including soft-deleted)
all_pedidos = PedidoServicio.all_objects.all()
print(f"Todos los pedidos (con deleted): {all_pedidos.count()}")
```

### ✅ Resultado Esperado
- El pedido no aparece en el listado normal
- Pero sigue existiendo en la BD con `deleted_at` set

---

## 📊 Checklist de Prueba Completa

- [ ] Correlativo genera PED-0000001 en primer pedido
- [ ] Correlativo auto-incrementa a PED-0000002, PED-0000003, etc.
- [ ] Campo numero_pedido es read-only (no editable)
- [ ] Prueba de concurrencia: SIN DUPLICADOS
- [ ] Cotizaciones generan COT-0000001, COT-0000002, etc.
- [ ] Órdenes generan OC-0000001, OC-0000002, etc.
- [ ] Prefijos son independientes (contadores separados)
- [ ] API REST retorna numero_pedido en responses
- [ ] Frontend muestra numero_cotizacion en Cotizaciones
- [ ] Frontend muestra numero_orden en Órdenes
- [ ] Formato es exacto: PREFIJO-0000NNN (7 dígitos)
- [ ] Soft delete preserva auditoría
- [ ] Paginación funciona correctamente

---

## 🆘 Troubleshooting

### Problema: "Duplicate entry" al crear
**Solución**: Verificar que `unique=True` está en BD
```bash
python manage.py migrate --fake-initial  # Si es necesario
python manage.py migrate
```

### Problema: Numero_pedido vacío
**Solución**: Verificar que save() llama a correlativo
```python
# En models.py, debe estar en save():
if not self.numero_pedido:
    correlativo, created = TablaCorrelativos.objects.get_or_create(...)
    self.numero_pedido = correlativo.obtener_siguiente_codigo()
```

### Problema: Admin muestra campo como editable
**Solución**: Verificar readonly_fields en admin.py
```python
readonly_fields = ('numero_pedido', 'total', ...)
```

---

## ✅ Conclusión

Si todas las pruebas pasan, el sistema de correlativo está:
- ✅ Funcionando correctamente
- ✅ Generando números únicos
- ✅ Previniendo duplicados
- ✅ Integrado con modelos
- ✅ Visible en frontend
- ✅ **PRODUCTION READY**

---

## 📞 Soporte

Para reportar issues o preguntas, consultar:
- `CORRELATIVO_SYSTEM.md` - Detalles técnicos
- `IMPLEMENTATION_COMPLETE.md` - Documentación completa
- Backend logs: `python manage.py shell` para debugging

¡Happy Testing! 🚀

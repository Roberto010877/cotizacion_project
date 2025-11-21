# Seed de Colaboradores/Instaladores - Implementación Completada

## ✅ Datos de Prueba Creados

Se han creado **10 colaboradores/instaladores** de prueba en la base de datos para usar en los pedidos de servicio.

### 📋 Colaboradores Disponibles

| ID | Nombre Completo | Username | Email | 
|----|-----------------|----------|-------|
| 5 | João Silva | joao | joao@cortinas.com |
| 6 | Maria García | maria_garcia | maria.garcia@cortinas.com |
| 7 | Carlos López | carlos_lopez | carlos.lopez@cortinas.com |
| 8 | Ana Martins | ana_martins | ana.martins@cortinas.com |
| 9 | Pedro Santos | pedro_santos | pedro.santos@cortinas.com |
| 10 | Lucía Fernández | lucia_fernandez | lucia.fernandez@cortinas.com |
| 11 | Diego Pérez | diego_perez | diego.perez@cortinas.com |
| 12 | Rosa Mendes | rosa_mendes | rosa.mendes@cortinas.com |
| 13 | Rafael Costa | rafael_costa | rafael.costa@cortinas.com |
| 14 | Beatriz Souza | beatriz_souza | beatriz.souza@cortinas.com |

---

## 🗂️ Archivos Creados

### 1. **Fixture de Datos: `/backend/common/fixtures/seed_colaboradores.py`**

Contiene la definición de los 10 colaboradores:
```python
COLABORADORES_DATA = [
    {
        "username": "joao",
        "email": "joao@cortinas.com",
        "first_name": "João",
        "last_name": "Silva",
        "password": "TempPass123!",
        "is_staff": False,
        "is_active": True,
    },
    # ... 9 más colaboradores
]
```

### 2. **Management Command: `/backend/common/management/commands/seed_colaboradores.py`**

Comando Django que:
- Lee los datos de `seed_colaboradores.py`
- Crea usuarios en la base de datos
- Detecta duplicados (no crea si ya existen)
- Maneja errores de forma elegante
- Muestra un resumen de los colaboradores disponibles

---

## 🚀 Cómo Usar

### Cargar Colaboradores de Prueba

```bash
cd backend
python manage.py seed_colaboradores
```

**Salida esperada:**
```
✅ Colaborador creado: João Silva
✅ Colaborador creado: Maria García
...
✅ Colaboradores creados: 10
```

### Limpiar y Recargar (sin afectar admin)

```bash
python manage.py seed_colaboradores --clear
```

Esto elimina colaboradores existentes y vuelve a cargar los datos de prueba.

---

## 🎯 Uso en Frontend

### En el Formulario de Creación de Pedidos

Cuando abres el formulario "Crear Nuevo Pedido", el select **"Instalador"** muestra todas estas opciones:

```
┌─ Instalador ──────────────┐
│ Seleccione el instalador ▼│
├───────────────────────────┤
│ João Silva                │
│ Maria García              │
│ Carlos López              │
│ Ana Martins               │
│ Pedro Santos              │
│ Lucía Fernández           │
│ Diego Pérez               │
│ Rosa Mendes               │
│ Rafael Costa              │
│ Beatriz Souza             │
└───────────────────────────┘
```

### En la Tabla de Pedidos

Cuando creas un pedido y asignas "João Silva", aparece en la columna "Instalador":

```
┌──────────────────────────────────────────┐
│ Número  │ Cliente │ Instalador │ Estado  │
├─────────┼─────────┼────────────┼─────────┤
│PED-0001 │ Casa SP │ João Silva │ Enviado │
└──────────────────────────────────────────┘
```

---

## 🔐 Credenciales para Testing (opcional)

Si deseas loguear como colaborador:

**Usuario:** joao  
**Contraseña:** TempPass123!

_Nota: Solo si se permiten logins de colaboradores en el sistema._

---

## 💾 Base de Datos

Los colaboradores se almacenan en la tabla `auth_user` con:
- `username`: Identificador único
- `email`: Correo electrónico
- `first_name`, `last_name`: Nombre completo
- `is_staff`: False (no son administradores)
- `is_active`: True (cuentas activas)

---

## 📝 Próximas Acciones

1. **Crear Clientes de Prueba**: Usar `python manage.py seed_clientes` (con ajustes de encoding)
2. **Crear Pedidos de Prueba**: Usar el formulario frontend para crear pedidos con estos colaboradores
3. **Pruebas de Integración**: Verificar que los pedidos se asignan correctamente a los instaladores

---

## 🔄 Reproducir desde Cero

Si necesitas recrear todo desde cero:

```bash
# 1. Hacer backup de BD
# 2. Eliminar BD y migraciones
# 3. Hacer migraciones nuevas
python manage.py migrate

# 4. Cargar datos de prueba
python manage.py seed_colaboradores

# 5. (Opcional) Cargar clientes
python manage.py seed_clientes

# 6. Usar el frontend para crear pedidos
```

---

## 📞 Notas Técnicas

- Los colaboradores son **usuarios normales** (no staff)
- Se pueden **asignar múltiples pedidos** a un mismo colaborador
- Se pueden **cambiar asignaciones** después (PATCH request)
- Se pueden dejar pedidos **sin instalador** (NULL permitido)
- Si se **elimina un colaborador**, sus pedidos quedan sin asignar (ON DELETE SET_NULL)


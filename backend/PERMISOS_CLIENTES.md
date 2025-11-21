# 🔐 Solución: Permisos para Colaboradores

## Problema Resuelto
❌ **Antes:** Los usuarios del grupo "Colaborador" recibían error 403 Forbidden
✅ **Ahora:** Los colaboradores pueden ver y agregar clientes

## Cambios Realizados

### 1. Creación de Management Command
**Archivo:** `backend/clientes/management/commands/setup_permisos_grupos.py`

Este comando configura automáticamente:
- **Grupo "Administrador"** - Permisos completos: Ver, Crear, Editar, Eliminar
- **Grupo "Colaborador"** - Permisos limitados: Ver, Crear, Editar (No eliminar)

### 2. Asignación de Permisos a Modelos
Se configuraron los siguientes permisos para el modelo `Cliente`:
```
- view_cliente    → Ver clientes
- add_cliente     → Crear clientes
- change_cliente  → Editar clientes
- delete_cliente  → Eliminar clientes (solo admin)
```

### 3. Estructura de Permisos en Código
**Archivo:** `backend/clientes/permissions.py`

Las vistas usan clases de permisos personalizadas:
```python
class CanViewClientes(permissions.BasePermission)
class CanCreateClientes(permissions.BasePermission)
class CanEditClientes(permissions.BasePermission)
class CanDeleteClientes(permissions.BasePermission)
```

**Archivo:** `backend/clientes/views.py`

El método `get_permissions()` asigna permisos según la acción:
```python
def get_permissions(self):
    if self.action == 'create':
        permission_classes = [IsAuthenticated, CanCreateClientes]
    elif self.action in ['update', 'partial_update']:
        permission_classes = [IsAuthenticated, CanEditClientes]
    elif self.action == 'destroy':
        permission_classes = [IsAuthenticated, CanDeleteClientes]
    else:
        permission_classes = [IsAuthenticated, CanViewClientes]
```

## Estado Actual

### Usuarios
| Usuario | Grupo | Permisos |
|---------|-------|----------|
| `admin` | Administrador | ✅ Ver, Crear, Editar, Eliminar |
| `colaborador` | Colaborador | ✅ Ver, Crear, Editar |

### Endpoints Accesibles

**Para Colaborador:**
- ✅ `GET /api/v1/clientes/` - Ver lista de clientes
- ✅ `POST /api/v1/clientes/` - Crear nuevo cliente
- ✅ `PATCH /api/v1/clientes/{id}/` - Editar cliente
- ✅ `GET /api/v1/clientes/opciones-filtro/` - Obtener opciones de filtro
- ❌ `DELETE /api/v1/clientes/{id}/` - No permitido

**Para Admin:**
- ✅ Todos los endpoints

## Cómo Reinstalar (Si es necesario)

```bash
cd backend
python manage.py setup_permisos_grupos
```

Este comando es idempotente (seguro ejecutar múltiples veces).

## Agregar Nuevos Usuarios a Grupos

### Opción 1: Vía Django Admin
1. Ir a `/admin/`
2. Seleccionar "Users"
3. Editar usuario
4. En "Groups", seleccionar el grupo
5. Guardar

### Opción 2: Vía Shell
```bash
python manage.py shell

from django.contrib.auth.models import Group
from core.models import User

grupo = Group.objects.get(name='Colaborador')
user = User.objects.get(username='nombreusuario')
user.groups.add(grupo)
```

## Verificación

Para verificar que los permisos están correctamente asignados:

```bash
python manage.py shell

from django.contrib.auth.models import Group, User

# Ver todos los grupos
for group in Group.objects.all():
    perms = ', '.join([p.codename for p in group.permissions.all()])
    print(f"{group.name}: {perms}")

# Ver usuario específico
user = User.objects.get(username='colaborador')
print(user.groups.all())
```

## Notas Importantes

1. **Los permisos de usuario se verifican en tiempo de ejecución**
   - No requiere reiniciar Django
   - Los cambios de grupo son inmediatos

2. **Las acciones opcionales** (como `opciones_filtro`) heredan los permisos de la vista
   - Requieren al menos `CanViewClientes`

3. **Soft Delete**
   - Los colaboradores NO pueden eliminar clientes (error 403)
   - Los admins pueden "soft delete" (solo marca como inactivo)

---

✅ **Configuración Completada y Verificada**

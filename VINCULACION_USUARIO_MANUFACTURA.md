# 🔗 Vinculación Usuario - Personal de Manufactura

## 📋 Problema Resuelto

**Antes:** Los usuarios del sistema (login) estaban **desconectados** del personal de manufactura (seleccionado en pedidos).

```
❌ Problema:
Usuario "instalador" → Login al sistema
Rafael Reyes → Personal seleccionado en pedidos

NO HAY CONEXIÓN → Usuario no ve sus tareas
```

## ✅ Solución Implementada

### 1. Campo `usuario` en modelo Manufactura

```python
class Manufactura(BaseModel):
    # Relación 1:1 con usuario del sistema
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='personal_manufactura',
        verbose_name="Usuario del Sistema"
    )
    
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    documento = models.CharField(max_length=50, unique=True)
    cargo = models.CharField(choices=Cargo.choices)
    # ... otros campos
```

### 2. Flujo Correcto

```
✅ Solución:
1. Usuario "instalador" → Login al sistema
2. Usuario vinculado a → Rafael Reyes (Manufactura)
3. Rita crea pedido → Selecciona Rafael Reyes como instalador
4. Endpoint mis_pedidos busca:
   - instalador__usuario = request.user
   - Encuentra pedidos asignados a Rafael Reyes
5. Usuario "instalador" VE sus tareas ✅
```

## 🔧 Scripts Disponibles

### Ver Vinculaciones Actuales

```bash
python vincular_usuario_manufactura.py
```

**Salida:**
```
======================================================================
VINCULACIONES ACTUALES: Usuario del Sistema ↔ Personal Manufactura
======================================================================

👤 instalador           ↔ Rafael Reyes                   (INSTALADOR)

----------------------------------------------------------------------

📋 Personal SIN vincular: 5
  - Carlos Rodríguez | Doc: DOC16940741 | INSTALADOR
  - Diego Santos | Doc: DOC11187998 | INSTALADOR
  - Juan Vargas | Doc: DOC47226801 | FABRICADOR
```

### Vincular Usuario con Personal

```python
from vincular_usuario_manufactura import vincular_usuario_manufactura

# Vincular usuario 'instalador' con Rafael Reyes
vincular_usuario_manufactura('instalador', 'DOC75156100')

# Vincular otro usuario
vincular_usuario_manufactura('fabricador1', 'DOC47226801')
```

### Crear Pedido de Prueba

```bash
python crear_pedido_para_rafael.py
```

## 🎯 Casos de Uso

### Caso 1: Instalador con Usuario de Sistema

**Objetivo:** Rafael Reyes debe poder ver sus tareas asignadas cuando hace login.

**Pasos:**

1. **Crear usuario de sistema:**
```python
User.objects.create_user(
    username='rafael.reyes',
    email='rafael.reyes@cotidomo.com',
    password='contraseña123',
    role='INSTALADOR'
)
```

2. **Vincular con personal de manufactura:**
```python
from vincular_usuario_manufactura import vincular_usuario_manufactura
vincular_usuario_manufactura('rafael.reyes', 'DOC75156100')
```

3. **Rita crea pedido:**
   - Selecciona "Rafael Reyes" del dropdown de instaladores
   - Sistema guarda: `instalador = Manufactura(id=X, nombre='Rafael Reyes', usuario_id=Y)`

4. **Rafael hace login:**
   - Usuario: `rafael.reyes`
   - Accede a: `/mis-tareas`
   - Endpoint consulta: `PedidoServicio.filter(instalador__usuario=rafael.reyes)`
   - ✅ Ve todos los pedidos asignados a él

### Caso 2: Personal SIN Usuario de Sistema

**Objetivo:** Carlos Rodríguez es instalador externo sin acceso al sistema.

**Situación:**
- Carlos Rodríguez existe en tabla Manufactura
- NO tiene usuario de sistema vinculado
- Rita puede asignarle pedidos normalmente
- Carlos NO puede hacer login (no tiene cuenta)

**¿Es válido?** ✅ Sí, el campo `usuario` es **opcional**.

## 🔐 Django Admin

### Gestión en Admin

```python
@admin.register(Manufactura)
class ManufacturaAdmin(admin.ModelAdmin):
    list_display = (
        'get_full_name',
        'usuario',         # ← Muestra usuario vinculado
        'documento',
        'cargo',
        'estado'
    )
    
    fieldsets = (
        ('Vinculación con Sistema', {
            'fields': ('usuario',),
            'description': 'Vincular con usuario del sistema para acceso a tareas.'
        }),
        ('Información Personal', {
            'fields': ('nombre', 'apellido', 'documento', 'email', 'telefono')
        }),
        # ...
    )
```

**Vista en Admin:**

```
Personal de Manufactura

Nombre              Usuario       Documento     Cargo       Estado
─────────────────────────────────────────────────────────────────
Rafael Reyes        instalador    DOC75156100   INSTALADOR  ACTIVO
Carlos Rodríguez    (ninguno)     DOC16940741   INSTALADOR  ACTIVO
Juan Vargas         fabricador1   DOC47226801   FABRICADOR  ACTIVO
```

## 🧪 Testing

### Test 1: Verificar Vinculación

```bash
# Ver vinculaciones
python vincular_usuario_manufactura.py

# Debe mostrar:
👤 instalador ↔ Rafael Reyes (INSTALADOR)
```

### Test 2: Crear Pedido y Verificar

```bash
# Crear pedido asignado a Rafael
python crear_pedido_para_rafael.py

# Output esperado:
✅ Pedido creado: PED-0000018
✅ Instalador asignado: Rafael Reyes
✅ Usuario vinculado: instalador
```

### Test 3: Login y Ver Tareas

1. **Frontend:** Login con usuario `instalador`
2. **Navegar a:** `/mis-tareas`
3. **Verificar:** Se muestran pedidos asignados a Rafael Reyes
4. **API Call:** 
```bash
GET /api/v1/pedidos-servicio/mis_pedidos/
Authorization: Bearer {token}

# Response debe incluir PED-0000018
```

## 📊 Queries de Verificación

### Ver Personal Vinculado

```sql
SELECT 
    m.nombre,
    m.apellido,
    m.cargo,
    u.username as usuario_login,
    u.email as usuario_email
FROM manufactura_manufactura m
LEFT JOIN api_user u ON m.usuario_id = u.id
WHERE m.estado = 'ACTIVO';
```

### Ver Pedidos por Usuario

```sql
SELECT 
    ps.numero_pedido,
    ps.estado,
    i.nombre as instalador_nombre,
    u.username as usuario_login
FROM pedidos_servicio_pedidoservicio ps
JOIN manufactura_manufactura i ON ps.instalador_id = i.id
JOIN api_user u ON i.usuario_id = u.id
WHERE u.username = 'instalador';
```

## 🎓 Best Practices

### ✅ DO - Buenas Prácticas

1. **Vincular cuando el personal necesite acceso al sistema**
```python
# Personal que usará el sistema debe tener vinculación
rafael = Manufactura.objects.get(documento='DOC75156100')
user = User.objects.get(username='instalador')
rafael.usuario = user
rafael.save()
```

2. **Usar grupos de Django para permisos**
```python
# Usuario instalador solo accede a /mis-tareas
instalador_group = Group.objects.get(name='instalador')
user.groups.add(instalador_group)
```

3. **Verificar vinculaciones periódicamente**
```bash
# Script mensual para auditoría
python vincular_usuario_manufactura.py > audit_$(date +%Y%m).txt
```

### ❌ DON'T - Evitar

1. **NO crear usuario si el personal no accederá al sistema**
```python
# ❌ Mal: Carlos es externo, no necesita login
carlos = Manufactura.objects.create(nombre='Carlos', ...)
user = User.objects.create(username='carlos')  # Innecesario
```

2. **NO vincular múltiples usuarios al mismo personal**
```python
# ❌ Mal: OneToOneField previene esto
rafael.usuario = user1
rafael.usuario = user2  # Error de integridad
```

3. **NO desvincular sin motivo**
```python
# ❌ Mal: Perderá acceso a sus tareas
rafael.usuario = None
rafael.save()
```

## 🚀 Deployment Checklist

- [ ] Ejecutar migración: `python manage.py migrate manufactura`
- [ ] Vincular usuarios existentes: `python vincular_instalador_rafael.py`
- [ ] Verificar vinculaciones: `python vincular_usuario_manufactura.py`
- [ ] Crear pedido de prueba: `python crear_pedido_para_rafael.py`
- [ ] Login con usuario instalador
- [ ] Verificar `/mis-tareas` muestra pedidos asignados
- [ ] Confirmar permisos desde Django Admin

## 📞 Soporte

**Problema:** "Usuario no ve sus tareas asignadas"

**Checklist de diagnóstico:**

1. ✓ ¿Usuario tiene vinculación con personal de manufactura?
```bash
python vincular_usuario_manufactura.py
```

2. ✓ ¿Personal tiene pedidos asignados?
```python
rafael = Manufactura.objects.get(documento='DOC75156100')
rafael.pedidos_como_instalador.all()
```

3. ✓ ¿Usuario tiene permisos correctos? (debe tener SOLO IsAuthenticated)
```bash
# Django Admin → Grupos → instalador
# NO debe tener: pedidos_servicio.view_pedidoservicio
```

4. ✓ ¿Usuario cerró sesión después de cambios?
   - Cambios de permisos requieren logout/login

---

**✅ Sistema Implementado y Funcionando**
- Usuario `instalador` vinculado a `Rafael Reyes`
- Pedido `PED-0000018` asignado
- Endpoint `/api/v1/pedidos-servicio/mis_pedidos/` funcionando
- Frontend `/mis-tareas` accesible

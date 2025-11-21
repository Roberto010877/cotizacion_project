# Campo Colaborador (Instalador) - Guía Técnica

## 🎯 Descripción General

El campo **`colaborador`** en `PedidoServicio` representa al **instalador/trabajador** que ejecuta la instalación de las cortinas. Es un campo **ForeignKey** a la tabla `User` de Django.

---

## 📊 Configuración en Backend

### Modelo (models.py)
```python
colaborador = models.ForeignKey(
    settings.AUTH_USER_MODEL,      # ← Tabla User de Django
    on_delete=models.SET_NULL,     # Si se elimina User, se asigna NULL
    null=True,                     # Puede ser vacío (instalador no asignado)
    blank=True,                    # Opcional en formularios
    related_name='pedidos_servicio_como_instalador',
    verbose_name="Instalador",
    help_text="Usuario colaborador que realiza la instalación"
)
```

### Datos en Base de Datos
```
pedidos_servicio table:
├─ id: 1
├─ numero_pedido: "PED-0000001"
├─ cliente_id: 5
├─ colaborador_id: 2           ← ID del usuario (FK)
├─ solicitante: "Sra. Rita"
├─ supervisor: "Carlos"
├─ fecha_inicio: "2025-11-20"
└─ ...

user table:
├─ id: 2
├─ username: "joao"
├─ first_name: "João"
├─ last_name: "Silva"
├─ email: "joao@example.com"
└─ ...
```

---

## 🔄 Flujo de Datos

### 1. Frontend → Backend (Crear Pedido)

**Formulario Frontend:**
```typescript
// PedidoForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  const payload = {
    cliente: 5,                    // ID del cliente
    solicitante: "Sra. Rita",      // Nombre de quien solicita (CharField)
    colaborador: 2,                // ← ID del usuario (ForeignKey)
    supervisor: "Carlos",          // Nombre del supervisor (CharField)
    fecha_inicio: "2025-11-20",
    fecha_fin: "2025-11-25",
    observaciones: "...",
    items: [...]
  };
  
  const response = await axiosInstance.post(
    '/api/v1/pedidos-servicio/',
    payload
  );
};
```

**Backend Recibe:**
```python
# views.py - PedidoServicioViewSet.create()
POST /api/v1/pedidos-servicio/
{
  "cliente": 5,
  "solicitante": "Sra. Rita",
  "colaborador": 2,              # ← Valida que exista User con id=2
  "supervisor": "Carlos",
  "fecha_inicio": "2025-11-20",
  "fecha_fin": "2025-11-25",
  "observaciones": "...",
  "items": [...]
}
```

### 2. Backend → Frontend (Listar Pedidos)

**Backend Serializa con `PedidoServicioListSerializer`:**
```python
# serializers.py
class PedidoServicioListSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(
        source='cliente.nombre',
        read_only=True
    )
    
    colaborador_nombre = serializers.SerializerMethodField()
    
    def get_colaborador_nombre(self, obj):
        if obj.colaborador:
            # Retorna: "João Silva"
            return obj.colaborador.get_full_name() or obj.colaborador.username
        return None
```

**Frontend Recibe:**
```json
{
  "id": 1,
  "numero_pedido": "PED-0000001",
  "cliente_nombre": "Casa de São Paulo",
  "solicitante": "Sra. Rita",
  "colaborador_nombre": "João Silva",    // ← Nombre completo
  "fecha_inicio": "2025-11-20",
  "fecha_fin": "2025-11-25",
  "estado": "EN_FABRICACION",
  "total_items": 3,
  "created_at": "2025-11-20T10:30:00Z"
}
```

---

## 🎨 Interfaz de Usuario (Frontend)

### Formulario de Creación

**Componente: PedidoForm.tsx**

```tsx
<div>
  <Label htmlFor="colaborador">
    {t('pedidos-servicio:form_installer')} *
  </Label>
  <Select
    value={formData.colaborador}
    onValueChange={(val) => handleSelectChange('colaborador', val)}
  >
    <SelectTrigger>
      <SelectValue placeholder={t('pedidos-servicio:form_installer_placeholder')} />
    </SelectTrigger>
    <SelectContent>
      {colaboradores.map((usuario) => (
        <SelectItem key={usuario.id} value={usuario.id.toString()}>
          {usuario.nombre_completo || usuario.nombre}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

**Carga de Opciones:**
```typescript
useEffect(() => {
  const loadOptions = async () => {
    try {
      const usuariosRes = await axiosInstance.get(
        '/api/v1/users/?page_size=100'
      );
      setColaboradores(usuariosRes.data.results || []);
      // Resultado:
      // [
      //   { id: 1, nombre: "admin", nombre_completo: "Admin User", ... },
      //   { id: 2, nombre: "joao", nombre_completo: "João Silva", ... },
      //   { id: 3, nombre: "maria", nombre_completo: "Maria Garcia", ... }
      // ]
    } catch (err) {
      console.error('Error:', err);
    }
  };
  loadOptions();
}, []);
```

### Tabla de Listado

**Columna: Instalador**
```
┌─────────────────────────────────────────┐
│ PED-0000087 │ Casa SP │ João Silva │ ... │
│ PED-0000088 │ Casa RJ │ Maria G    │ ... │
│ PED-0000089 │ Casa MG │ -          │ ... │  (sin asignar)
└─────────────────────────────────────────┘
```

---

## 🔍 Consultas a Base de Datos

### Obtener Pedidos con Instalador

**ORM Django:**
```python
# Obtener pedido con instalador
pedido = PedidoServicio.objects.select_related('colaborador').get(id=1)
print(pedido.colaborador.get_full_name())  # "João Silva"
print(pedido.colaborador.id)                # 2
print(pedido.colaborador.email)             # "joao@example.com"

# Filtrar por instalador específico
pedidos = PedidoServicio.objects.filter(colaborador_id=2)

# Obtener sin instalador
pedidos_sin_instalador = PedidoServicio.objects.filter(colaborador__isnull=True)

# Contar pedidos por instalador
from django.db.models import Count
instaladores = User.objects.annotate(
    total_pedidos=Count('pedidos_servicio_como_instalador')
).filter(total_pedidos__gt=0)
```

**SQL Equivalente:**
```sql
SELECT p.*, u.first_name, u.last_name
FROM pedidos_servicio_pedidoservicio p
LEFT JOIN auth_user u ON p.colaborador_id = u.id
WHERE p.id = 1;

-- Resultado:
-- id | numero_pedido | colaborador_id | first_name | last_name
-- 1  | PED-0000001   | 2              | João       | Silva
```

---

## ✅ Validaciones

### Backend (serializers.py)

```python
class PedidoServicioSerializer(serializers.ModelSerializer):
    colaborador_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),  # ← Valida que User existe
        write_only=True,
        source='colaborador',
        required=False,               # ← Opcional
        allow_null=True               # ← Permite NULL
    )
```

**Validación automática:**
```python
# Si enviamos colaborador_id que no existe → Error
POST /api/v1/pedidos-servicio/
{
  "cliente": 5,
  "colaborador": 999  # ← Error: No existe User con id=999
}

# Respuesta:
{
  "colaborador": ["Invalid pk \"999\" - object does not exist."]
}

# Si no enviamos → OK (null)
POST /api/v1/pedidos-servicio/
{
  "cliente": 5,
  "colaborador": null  # ← OK, pedido sin instalador asignado
}
```

### Frontend (PedidoForm.tsx)

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // Validación: Instalador requerido
  if (!formData.cliente || !formData.colaborador || ...) {
    setError('Por favor completa todos los campos requeridos');
    return;
  }
  
  // Conversión segura a ID
  const payload = {
    colaborador: formData.colaborador ? parseInt(formData.colaborador) : null,
    // ...
  };
};
```

---

## 📈 Escenarios Comunes

### Escenario 1: Crear Pedido SIN Instalador (Para después)
```
Rita: "Necesito un pedido pero aún no tengo instalador"
```

**Request:**
```json
{
  "cliente": 5,
  "solicitante": "Sra. Rita",
  "colaborador": null,        // ← Sin asignar
  "fecha_inicio": "2025-11-20"
}
```

**Response:**
```json
{
  "id": 1,
  "numero_pedido": "PED-0000087",
  "colaborador": null,
  "colaborador_nombre": null
}
```

### Escenario 2: Asignar Instalador Después (PATCH)
```
Admin: "Ahora asigno a João"
```

**Request:**
```json
{
  "colaborador": 2  // ← João
}
```

**Response:**
```json
{
  "id": 1,
  "numero_pedido": "PED-0000087",
  "colaborador": {
    "id": 2,
    "first_name": "João",
    "last_name": "Silva",
    "email": "joao@example.com"
  },
  "colaborador_nombre": "João Silva"
}
```

### Escenario 3: Ver Todos los Pedidos de un Instalador
```
Admin: "¿Cuántos pedidos tiene João?"
```

**Request:**
```python
# Código Backend
joao = User.objects.get(id=2)
pedidos_joao = joao.pedidos_servicio_como_instalador.all()
# Retorna: 15 pedidos asignados a João
```

**Frontend:**
```typescript
const pedidosJoao = pedidos.filter(p => p.colaborador?.id === 2);
```

---

## 🚨 Casos de Error Comunes

### Error 1: Instalador No Existe
```
Error: Invalid pk "999" - object does not exist.
Causa: Enviaste colaborador_id que no existe en la tabla User
Solución: Valida que el ID exista antes de enviar
```

### Error 2: Campo Requerido Vacío
```
Error: This field may not be null.
Causa: El formulario no permite colaborador = null pero lo enviaste
Solución: blank=True en modelo, required=False en serializer
```

### Error 3: Nombre del Instalador Vacío
```
Causa: get_full_name() retorna vacío (first_name y last_name vacíos)
Solución: Usar fallback a username
```

---

## 📝 Resumen

| Aspecto | Detalles |
|---------|----------|
| **Tipo** | ForeignKey → User |
| **Almacenamiento** | ID del usuario en `colaborador_id` |
| **Lectura** | `get_full_name()` o nombre completo en serializer |
| **Creación** | Enviar ID del usuario |
| **Opcional** | Sí (null=True, blank=True) |
| **Cascade** | SET_NULL (si se elimina User, se asigna NULL) |
| **Frontend** | Select con opciones de usuarios |
| **Validación** | Django valida que User exista |


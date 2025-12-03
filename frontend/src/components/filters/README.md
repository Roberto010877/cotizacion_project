# 🔍 Guía de Reutilización: Componentes de Búsqueda y Filtrado

## 📋 Resumen

Se han creado dos componentes reutilizables para implementar búsqueda y filtrado de pedidos en cualquier dashboard:

### ✅ Componentes Creados

1. **`PedidoSearchBar.tsx`** - Búsqueda local en tiempo real
2. **`DateRangeFilter.tsx`** - Filtro de fechas (backend)
3. **AdminDashboard.tsx** - Implementación de ejemplo

---

## 🚀 Cómo Usar en Otros Dashboards

### Paso 1: Importar los componentes

```tsx
import { PedidoSearchBar } from '@/components/filters/PedidoSearchBar';
import { DateRangeFilter } from '@/components/filters/DateRangeFilter';
import usePaginatedPedidosServicio from '@/hooks/usePaginatedPedidosServicio';
```

### Paso 2: Agregar estados para filtros

```tsx
const [localFilteredData, setLocalFilteredData] = useState<PedidoServicio[]>([]);
const [dateFilters, setDateFilters] = useState<{ fecha_inicio?: string; fecha_fin?: string }>({});
```

### Paso 3: Obtener datos con filtros de fecha

```tsx
const {
  data: pedidosData,
  isLoading: pedidosLoading,
  refetch: refetchPedidos,
} = usePaginatedPedidosServicio({
  page: 1,
  pageSize: 10,
  searchFilters: dateFilters, // Solo filtros backend (fechas)
});
```

### Paso 4: Crear handlers

```tsx
// Búsqueda local (número, cliente, solicitante)
const handleSearchChange = (filtered: PedidoServicio[]) => {
  setLocalFilteredData(filtered);
};

// Filtro de fechas (backend)
const handleDateFilterChange = (filters: { fecha_inicio?: string; fecha_fin?: string }) => {
  setDateFilters(filters);
};

// Limpiar filtros
const handleClearAllFilters = () => {
  setLocalFilteredData([]);
  setDateFilters({});
  refetchPedidos();
};
```

### Paso 5: Renderizar componentes

```tsx
<div className="flex flex-col sm:flex-row gap-3">
  <div className="flex-1">
    <PedidoSearchBar
      data={pedidosData?.results || []}
      onFilterChange={handleSearchChange}
      placeholder="Buscar por número, cliente o solicitante..."
    />
  </div>
  <DateRangeFilter
    onFilterChange={handleDateFilterChange}
    onClear={handleClearAllFilters}
  />
</div>
```

### Paso 6: Mostrar datos filtrados

```tsx
{(localFilteredData.length > 0 ? localFilteredData : pedidosData?.results || []).map((pedido) => (
  // Renderizar pedido
))}
```

---

## 📊 Arquitectura de Filtrado

### **Búsqueda Local (PedidoSearchBar)**
```
Usuario escribe → Filtro en tiempo real → Sin latencia de red
Busca en: numero_pedido, cliente_nombre, solicitante_nombre
```

### **Filtro de Fechas (DateRangeFilter)**
```
Usuario selecciona fechas → Query parameters → Backend filtra en BD
Parámetros: fecha_inicio, fecha_fin
```

### **Combinado (Híbrido)**
```
Datos del backend (con fechas) → Búsqueda local (número/cliente/solicitante)
= Mejor rendimiento + UX responsivo
```

---

## 🎯 Dashboards Disponibles para Refactorización

Basándome en tu estructura, puedes reutilizar estos componentes en:

1. **ComercialDashboard** - `/frontend/src/pages/Dashboard/ComercialDashboard.tsx`
2. **FabricadorDashboard** - `/frontend/src/pages/Dashboard/FabricadorDashboard.tsx`
3. **InstaladorDashboard** - `/frontend/src/pages/Dashboard/InstaladorDashboard.tsx`

Todos estos archivos muestran pedidos y pueden beneficiarse del mismo patrón de búsqueda/filtrado.

---

## 💡 Ejemplo Completo para ComercialDashboard

```tsx
// En ComercialDashboard.tsx
import { PedidoSearchBar } from '@/components/filters/PedidoSearchBar';
import { DateRangeFilter } from '@/components/filters/DateRangeFilter';

export const ComercialDashboard: React.FC = () => {
  const [localFilteredData, setLocalFilteredData] = useState<PedidoServicio[]>([]);
  const [dateFilters, setDateFilters] = useState<{ fecha_inicio?: string; fecha_fin?: string }>({});

  const { data: pedidosData, isLoading, refetch } = usePaginatedPedidosServicio({
    page: 1,
    pageSize: 15,
    searchFilters: dateFilters,
  });

  const handleSearchChange = (filtered: PedidoServicio[]) => {
    setLocalFilteredData(filtered);
  };

  const handleDateFilterChange = (filters) => {
    setDateFilters(filters);
  };

  const handleClearFilters = () => {
    setLocalFilteredData([]);
    setDateFilters({});
    refetch();
  };

  return (
    <div>
      {/* Barra de búsqueda y filtros */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <PedidoSearchBar
            data={pedidosData?.results || []}
            onFilterChange={handleSearchChange}
          />
        </div>
        <DateRangeFilter
          onFilterChange={handleDateFilterChange}
          onClear={handleClearFilters}
        />
      </div>

      {/* Tabla de pedidos */}
      {/* ... resto del código ... */}
    </div>
  );
};
```

---

## 🔧 Personalización

### Cambiar placeholder del buscador
```tsx
<PedidoSearchBar
  placeholder="Buscar mis pedidos..."
  data={pedidosData?.results || []}
  onFilterChange={handleSearchChange}
/>
```

### Cambiar cantidad de items por página
```tsx
usePaginatedPedidosServicio({
  page: 1,
  pageSize: 25,  // ← Cambiar aquí
  searchFilters: dateFilters,
})
```

### Agregar más filtros (ej: estado)
Modifica `DateRangeFilter` o crea un nuevo componente similar.

---

## 📝 Checklist para Implementar en Otro Dashboard

- [ ] Importar componentes
- [ ] Crear estados para filtros
- [ ] Llamar a `usePaginatedPedidosServicio` con `dateFilters`
- [ ] Crear handlers (`handleSearchChange`, `handleDateFilterChange`)
- [ ] Renderizar `PedidoSearchBar` y `DateRangeFilter`
- [ ] Mostrar datos: `localFilteredData.length > 0 ? localFilteredData : pedidosData?.results`
- [ ] Agregar botón "Limpiar Filtros"
- [ ] Probar en navegador

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué la búsqueda es local?**
R: Porque es rápida (sin latencia de red) y los datos ya están en el navegador. Ideal para búsquedas dentro de la página actual.

**P: ¿Por qué el filtro de fechas va al backend?**
R: Porque requiere procesar muchos registros en la BD. El backend es más eficiente para esto.

**P: ¿Puedo agregar más campos de búsqueda?**
R: Sí, modifica `PedidoSearchBar.tsx` en la función de filtrado para incluir más campos.

**P: ¿Qué pasa si tengo muchos pedidos?**
R: La búsqueda local funciona hasta ~1000 items. Para más, considera filtrado backend.

---

**Creado:** 2025-11-29
**Versión:** 1.0
**Estado:** Listo para reutilización

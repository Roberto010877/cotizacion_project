import { useEffect, useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAppTranslation } from '@/i18n/hooks';
import type { PedidoServicio } from '@/hooks/usePaginatedPedidosServicio';

// Hook simple para debounce (evita re-renderizados excesivos al escribir)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface PedidoSearchBarProps {
  data: PedidoServicio[] | undefined;
  onFilterChange: (filtered: PedidoServicio[]) => void;
  placeholder?: string;
  initialValue?: string;
}

export const PedidoSearchBar = ({
  data = [],
  onFilterChange,
  placeholder,
  initialValue = '',
}: PedidoSearchBarProps) => {
  const { t } = useAppTranslation(['common', 'pedidos_servicio']);
  
  // Estado local del input (se actualiza instantáneamente para que el UI sea fluido)
  const [searchTerm, setSearchTerm] = useState(initialValue);
  
  // Valor debounced (se actualiza 300ms después de dejar de escribir)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Lógica de filtrado centralizada (Memoizada)
  const filteredData = useMemo(() => {
    const sourceData = data || [];
    const term = debouncedSearchTerm.trim().toLowerCase();

    if (!term) return sourceData;

    return sourceData.filter((pedido) => {
      // Optimizamos creando un string único para buscar (más rápido que múltiples includes)
      const searchString = `
        ${pedido.numero_pedido || ''} 
        ${pedido.cliente_nombre || ''} 
        ${pedido.solicitante_nombre || ''}
      `.toLowerCase();

      return searchString.includes(term);
    });
  }, [data, debouncedSearchTerm]);

  // ✅ CORREGIDO: Agregar onFilterChange a las dependencias
  useEffect(() => {
    onFilterChange(filteredData);
  }, [filteredData, onFilterChange]); // Incluir onFilterChange en dependencias

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          type="text"
          placeholder={
            placeholder ||
            t('pedidos_servicio:search_by_number_client_requester') ||
            'Buscar por número, cliente o solicitante...'
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 py-2 w-full transition-all focus:ring-2 focus:ring-blue-100"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Feedback visual discreto */}
      {searchTerm && (
        <div className="absolute right-0 -bottom-5 text-[10px] text-gray-400 font-medium">
          {filteredData.length} resultado{filteredData.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default PedidoSearchBar;
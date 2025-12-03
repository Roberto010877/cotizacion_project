import { useState, memo } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppTranslation } from '@/i18n/hooks';

interface DateRangeFilterProps {
  // Actualizamos la interfaz para reflejar los nuevos campos de backend
  onFilterChange: (filters: { created_at__gte?: string; created_at__lte?: string }) => void;
  onClear?: () => void;
}

/**
 * Filtro de Rango de Fechas
 * Configurado para filtrar por FECHA DE CREACIÓN (created_at)
 */
const DateRangeFilterComponent = ({
  onFilterChange,
  onClear,
}: DateRangeFilterProps) => {
  const { t } = useAppTranslation(['common', 'pedidos_servicio']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyFilters = () => {
    // Usamos sufijos estándar de Django para rangos: __gte (>=) y __lte (<=)
    const filters: { created_at__gte?: string; created_at__lte?: string } = {};
    
    if (startDate) filters.created_at__gte = startDate;
    if (endDate) filters.created_at__lte = endDate;

    onFilterChange(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onFilterChange({});
    if (onClear) onClear();
    setIsOpen(false);
  };

  const isActive = startDate || endDate;

  return (
    <div className="relative">
      <Button
        variant={isActive ? 'default' : 'outline'}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Calendar className="h-4 w-4" />
        {/* Etiqueta genérica o específica */}
        Filtrar por Creación
        {isActive && <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-green-500"></span>}
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Fecha Creación (Desde)
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Fecha Creación (Hasta)
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                {t('common:cancel')}
              </Button>
              {isActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('common:clear')}
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={handleApplyFilters}
                disabled={!startDate && !endDate}
              >
                {t('pedidos_servicio:apply_filter')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DateRangeFilter = memo(DateRangeFilterComponent);

export default DateRangeFilter;
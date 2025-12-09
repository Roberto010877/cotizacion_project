import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input'; // Usamos el Input de Shadcn
import { Label } from '@/components/ui/label';  // Añadimos Label para mejor UI

// --- Tipos de Filtro ---
export type CotizacionFilters = {
  estado: string;
  fecha_desde: string | undefined;
  fecha_hasta: string | undefined;
};

// --- Opciones de Estado ---
const ESTADO_OPTIONS = [
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'ENVIADA', label: 'Enviada' },
  { value: 'ACEPTADA', label: 'Aceptada' },
  { value: 'RECHAZADA', label: 'Rechazada' },
  { value: 'VENCIDA', label: 'Vencida' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

interface CotizacionFilterProps {
  currentFilters: CotizacionFilters;
  onApplyFilters: (filters: CotizacionFilters) => void;
}

export function CotizacionFilter({
  currentFilters,
  onApplyFilters,
}: CotizacionFilterProps) {
  const { t } = useTranslation(['common', 'cotizaciones']);
  const [open, setOpen] = useState(false);
  
  // Estado local para el formulario del dropdown
  const [localFilters, setLocalFilters] = useState<CotizacionFilters>(currentFilters);

  // Manejador genérico de cambios
  const handleChange = (key: keyof CotizacionFilters, value: string | undefined) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    setOpen(false);
  };

  const handleClear = () => {
    const emptyFilters = { estado: '', fecha_desde: undefined, fecha_hasta: undefined };
    setLocalFilters(emptyFilters);
    onApplyFilters(emptyFilters);
    setOpen(false);
  };

  const hasActiveFilters = 
    !!currentFilters.estado || 
    !!currentFilters.fecha_desde || 
    !!currentFilters.fecha_hasta;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`h-10 gap-2 ${hasActiveFilters ? 'border-blue-500 bg-blue-50 text-blue-700' : ''}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t('common:filters') || 'Filtros'}
          {hasActiveFilters && (
            <span className="ml-1 flex h-2 w-2 rounded-full bg-blue-600" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-4" align="end">
        <DropdownMenuLabel className="mb-2 font-bold text-lg">
            {t('common:filter_by')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* 1. FILTRO DE ESTADO */}
        <div className="space-y-2 mt-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">
             {t('common:status')}
          </Label>
          <Select
            value={localFilters.estado}
            onValueChange={(val) => handleChange('estado', val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('common:all_statuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('common:all_statuses')}</SelectItem>
              {ESTADO_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 2. FILTRO FECHA DESDE */}
        <div className="space-y-2 mt-4">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">
             {t('common:start_date') || 'Fecha Desde'}
          </Label>
          <Input 
            type="date"
            value={localFilters.fecha_desde || ''}
            onChange={(e) => handleChange('fecha_desde', e.target.value)}
            className="w-full"
          />
        </div>

        {/* 3. FILTRO FECHA HASTA */}
        <div className="space-y-2 mt-4 mb-4">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">
             {t('common:end_date') || 'Fecha Hasta'}
          </Label>
          <Input 
            type="date"
            value={localFilters.fecha_hasta || ''}
            onChange={(e) => handleChange('fecha_hasta', e.target.value)}
            className="w-full"
          />
        </div>

        <DropdownMenuSeparator />

        {/* --- ACCIONES --- */}
        <div className="flex justify-between pt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClear} 
            disabled={!hasActiveFilters && !localFilters.estado} // Deshabilitar si está limpio
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <X className="mr-2 h-3 w-3" />
            {t('common:clear') || 'Limpiar'}
          </Button>
          <Button 
            size="sm" 
            onClick={handleApply}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t('common:apply') || 'Aplicar'}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
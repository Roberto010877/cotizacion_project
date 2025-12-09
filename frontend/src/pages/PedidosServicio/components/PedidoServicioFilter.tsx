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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PedidoServicioFilters } from '../types';

// --- Opciones de Estado ---
const ESTADO_OPTIONS = [
  { value: 'ENVIADO', label: 'Enviado' },
  { value: 'ACEPTADO', label: 'Aceptado' },
  { value: 'EN_FABRICACION', label: 'En Fabricación' },
  { value: 'LISTO_INSTALAR', label: 'Listo para Instalar' },
  { value: 'INSTALADO', label: 'Instalado' },
  { value: 'COMPLETADO', label: 'Completado' },
  { value: 'RECHAZADO', label: 'Rechazado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

interface PedidoServicioFilterProps {
  currentFilters: PedidoServicioFilters;
  onApplyFilters: (filters: PedidoServicioFilters) => void;
}

export function PedidoServicioFilter({
  currentFilters,
  onApplyFilters,
}: PedidoServicioFilterProps) {
  const { t } = useTranslation(['common', 'pedidos_servicio']);
  const [open, setOpen] = useState(false);
  
  // Estado local para el formulario del dropdown
  const [localFilters, setLocalFilters] = useState<PedidoServicioFilters>(currentFilters);

  // Manejador genérico de cambios
  const handleChange = (key: keyof PedidoServicioFilters, value: string | undefined) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    setOpen(false);
  };

  const handleClear = () => {
    const emptyFilters = { estado: '', fecha_emision_desde: undefined, fecha_emision_hasta: undefined };
    setLocalFilters(emptyFilters);
    onApplyFilters(emptyFilters);
    setOpen(false);
  };

  const hasActiveFilters = 
    !!currentFilters.estado || 
    !!currentFilters.fecha_emision_desde || 
    !!currentFilters.fecha_emision_hasta;

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

        {/* 2. FILTRO FECHA EMISIÓN DESDE */}
        <div className="space-y-2 mt-4">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">
            {t('common:start_date') || 'Fecha Emisión Desde'}
          </Label>
          <Input 
            type="date"
            value={localFilters.fecha_emision_desde || ''}
            onChange={(e) => handleChange('fecha_emision_desde', e.target.value)}
            className="w-full"
          />
        </div>

        {/* 3. FILTRO FECHA EMISIÓN HASTA */}
        <div className="space-y-2 mt-4 mb-4">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">
            {t('common:end_date') || 'Fecha Emisión Hasta'}
          </Label>
          <Input 
            type="date"
            value={localFilters.fecha_emision_hasta || ''}
            onChange={(e) => handleChange('fecha_emision_hasta', e.target.value)}
            className="w-full"
          />
        </div>

        <DropdownMenuSeparator />

        {/* --- ACCIONES --- */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-1" />
            {t('common:clear')}
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            className="flex-1"
          >
            {t('common:apply')}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

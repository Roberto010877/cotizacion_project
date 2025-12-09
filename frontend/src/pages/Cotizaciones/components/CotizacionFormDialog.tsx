import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CotizacionForm from '../CotizacionForm';
import { useAppTranslation } from '@/i18n/hooks';
import type { Cotizacion } from '../types';

interface CotizacionFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void; // Callback para refrescar datos en el padre
  cotizacion?: Cotizacion | null; // Datos para editar
  mode?: 'create' | 'edit'; // Modo del formulario
}

export function CotizacionFormDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess: onSuccessParent,
  cotizacion,
  mode = 'create',
}: CotizacionFormDialogProps) {
  const { t } = useAppTranslation(['cotizaciones']);
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Si se pasa open y onOpenChange, se usa modo controlado
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleSuccess = () => {
    console.log("🎉 [DIALOG] handleSuccess ejecutado - cerrando diálogo");
    // Cerrar el dialog después de crear/editar exitosamente
    onOpenChange?.(false);
    // Llamar al callback del padre para refrescar los datos
    onSuccessParent?.();
  };

  const handleCancel = () => {
    console.log("❌ [DIALOG] handleCancel ejecutado - cerrando diálogo");
    // Cerrar el dialog al cancelar
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-7xl max-h-[95vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' 
              ? t('cotizaciones:edit_quotation_title') 
              : t('cotizaciones:new_quotation_title')}
          </DialogTitle>
          <DialogDescription>
            {t('cotizaciones:form_description')}
          </DialogDescription>
        </DialogHeader>
        <CotizacionForm 
          onSuccess={handleSuccess} 
          onCancel={handleCancel}
          initialData={cotizacion}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
}

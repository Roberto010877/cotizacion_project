import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppTranslation } from '@/i18n/hooks';
import {apiClient} from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Cliente {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
}

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
  onSuccess?: () => void;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onOpenChange,
  cliente,
  onSuccess,
}) => {
  const { t } = useAppTranslation(['clientes', 'common']);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      if (!cliente?.id) {
        toast.error(t('common:error') || 'Error: No se encontró el cliente');
        return;
      }

      setIsDeleting(true);

      await apiClient.delete(`/api/v1/clientes/${cliente.id}/`);

      toast.success(t('clientes:delete_success') || 'Cliente eliminado exitosamente');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        t('common:error_loading_data') ||
        'Error al eliminar cliente';
      toast.error(errorMessage);
      console.error('Error deleting client:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('clientes:delete_confirmation')}</DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              {t('clientes:delete_confirmation_message') ||
                'Esta acción no se puede deshacer. Se eliminarán todos los datos del cliente.'}
            </p>
            {cliente && (
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm">
                  <span className="font-semibold">{t('clientes:name')}:</span> {cliente.nombre}
                </p>
                {cliente.email && (
                  <p className="text-sm">
                    <span className="font-semibold">{t('clientes:email')}:</span> {cliente.email}
                  </p>
                )}
                {cliente.telefono && (
                  <p className="text-sm">
                    <span className="font-semibold">{t('clientes:contact_phone')}:</span>{' '}
                    {cliente.telefono}
                  </p>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {t('clientes:cancel_delete') || 'Cancelar'}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {t('clientes:delete_client') || 'Eliminando...'}
              </>
            ) : (
              t('clientes:confirm_delete') || 'Eliminar'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;

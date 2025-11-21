import React from 'react';
import { useAppTranslation } from '@/i18n/hooks';
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
  direccion?: string;
  pais_nombre?: string;
  tipo?: string;
  origen?: string;
  preferencias_contacto?: string;
  numero_documento?: string;
}

interface ClienteDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
}

export const ClienteDetailModal: React.FC<ClienteDetailModalProps> = ({
  open,
  onOpenChange,
  cliente,
}) => {
  const { t } = useAppTranslation(['clientes', 'common']);



  if (!cliente) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('clientes:view_client') || 'Detalles del Cliente'}</DialogTitle>
          <DialogDescription>
            {t('clientes:client_information') || 'Información completa del cliente'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sección 1: Información Básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              {t('clientes:basic_info') || 'Información Básica'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  {t('clientes:name')}
                </p>
                <p className="text-sm text-gray-900 font-medium">{cliente.nombre}</p>
              </div>

              {/* Email */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  {t('clientes:email')}
                </p>
                <p className="text-sm text-gray-900">
                  {cliente.email ? (
                    <a href={`mailto:${cliente.email}`} className="text-blue-600 hover:underline">
                      {cliente.email}
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>

              {/* Teléfono */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  {t('clientes:contact_phone')}
                </p>
                <p className="text-sm text-gray-900">
                  {cliente.telefono ? (
                    <a href={`tel:${cliente.telefono}`} className="text-blue-600 hover:underline">
                      {cliente.telefono}
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Sección 2: Ubicación */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              {t('clientes:location_section') || 'Ubicación'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* País */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  {t('clientes:country_context')}
                </p>
                <p className="text-sm text-gray-900">{cliente.pais_nombre || '-'}</p>
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  {t('clientes:address')}
                </p>
                <p className="text-sm text-gray-900">{cliente.direccion || '-'}</p>
              </div>
            </div>
          </div>

          {/* Sección 3: Clasificación */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              {t('clientes:client_classification') || 'Clasificación'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  {t('clientes:client_type')}
                </p>
                <p className="text-sm text-gray-900">{cliente.tipo || '-'}</p>
              </div>

              {/* Origen */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  {t('clientes:client_origin')}
                </p>
                <p className="text-sm text-gray-900">{cliente.origen || '-'}</p>
              </div>

              {/* Preferencia de Contacto */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  {t('clientes:contact_preference')}
                </p>
                <p className="text-sm text-gray-900">{cliente.preferencias_contacto || '-'}</p>
              </div>
            </div>
          </div>

          {/* Botones de Cierre */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('common:close') || 'Cerrar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteDetailModal;

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAppTranslation } from '@/i18n/hooks';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreateClienteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  paisOptions: any[];
  tipoDocumentoOptions: any[];
  tiposClienteOptions: any[];
  origenesClienteOptions: any[];
}

interface ClienteFormData {
  nombre: string;
  numero_documento: string;
  tipo_documento: string;
  pais: string;
  email: string;
  telefono: string;
  direccion: string;
  tipo: string;
  origen: string;
  preferencias_contacto: string;
}

export const CreateClienteForm: React.FC<CreateClienteFormProps> = ({
  open,
  onOpenChange,
  onSuccess,
  paisOptions,
  tipoDocumentoOptions,
  tiposClienteOptions,
  origenesClienteOptions,
}) => {
  const { t } = useAppTranslation(['clientes', 'common']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ClienteFormData>({
    defaultValues: {
      preferencias_contacto: 'WHATSAPP',
      tipo: 'NUEVO',
      origen: 'WEB',
    },
  });

  const paisValue = watch('pais');

  // Filtrar tipos de documento según el país seleccionado
  const tiposDocumentoFiltrados = tipoDocumentoOptions.filter(
    (tipo) => tipo.pais === parseInt(paisValue)
  );

  const onSubmit = async (data: ClienteFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...data,
        pais: parseInt(data.pais),
        tipo_documento: parseInt(data.tipo_documento),
      };

      await axiosInstance.post('/api/v1/clientes/', payload);

      toast.success(t('clientes:cliente_created_success') || 'Cliente creado exitosamente');
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        t('common:error_loading_data') ||
        'Error al crear cliente';
      toast.error(errorMessage);
      console.error('Error creating client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('clientes:create_client')}</DialogTitle>
          <DialogDescription>
            {t('clientes:fill_client_form') || 'Complete los datos del nuevo cliente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Sección 1: Información Básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              {t('clientes:basic_info') || 'Información Básica'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">{t('clientes:name')} *</Label>
                <Input
                  id="nombre"
                  placeholder={t('clientes:name_placeholder') || 'Nombre o Razón Social'}
                  {...register('nombre', {
                    required: t('clientes:name_required') || 'El nombre es requerido',
                  })}
                  className={errors.nombre ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.nombre && (
                  <p className="text-sm text-red-500">{errors.nombre.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('clientes:email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('clientes:email_placeholder') || 'correo@ejemplo.com'}
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('clientes:email_invalid') || 'Email inválido',
                    },
                  })}
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono">{t('clientes:phone')}</Label>
                <Input
                  id="telefono"
                  placeholder={t('clientes:phone_placeholder') || '+591-2-1234567'}
                  {...register('telefono')}
                  disabled={isSubmitting}
                />
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <Label htmlFor="direccion">{t('clientes:address')}</Label>
                <Input
                  id="direccion"
                  placeholder={t('clientes:address_placeholder') || 'Dirección completa'}
                  {...register('direccion')}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Información de Documentos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              {t('clientes:document_info') || 'Información de Documentos'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* País */}
              <div className="space-y-2">
                <Label htmlFor="pais">{t('clientes:country')} *</Label>
                <Select
                  onValueChange={(value) => {
                    setValue('pais', value);
                    setValue('tipo_documento', '');
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="pais"
                    className={errors.pais ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder={t('clientes:select_country')} />
                  </SelectTrigger>
                  <SelectContent>
                    {paisOptions.map((pais) => (
                      <SelectItem key={pais.id} value={String(pais.id)}>
                        {pais.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.pais && (
                  <p className="text-sm text-red-500">{errors.pais.message}</p>
                )}
              </div>

              {/* Tipo de Documento */}
              <div className="space-y-2">
                <Label htmlFor="tipo_documento">{t('clientes:document_type')} *</Label>
                <Select
                  onValueChange={(value) => setValue('tipo_documento', value)}
                  disabled={isSubmitting || !paisValue}
                >
                  <SelectTrigger
                    id="tipo_documento"
                    className={errors.tipo_documento ? 'border-red-500' : ''}
                  >
                    <SelectValue
                      placeholder={
                        paisValue
                          ? t('clientes:select_document_type')
                          : t('clientes:select_country_first')
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposDocumentoFiltrados.map((tipo) => (
                      <SelectItem key={tipo.id} value={String(tipo.id)}>
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo_documento && (
                  <p className="text-sm text-red-500">{errors.tipo_documento.message}</p>
                )}
              </div>
            </div>

            {/* Número de Documento */}
            <div className="space-y-2">
              <Label htmlFor="numero_documento">
                {t('clientes:document_number')} *
              </Label>
              <Input
                id="numero_documento"
                placeholder={t('clientes:document_number_placeholder') || 'Número del documento'}
                {...register('numero_documento', {
                  required:
                    t('clientes:document_number_required') || 'El número de documento es requerido',
                })}
                className={errors.numero_documento ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.numero_documento && (
                <p className="text-sm text-red-500">{errors.numero_documento.message}</p>
              )}
            </div>
          </div>

          {/* Sección 3: Clasificación del Cliente */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              {t('clientes:client_classification') || 'Clasificación del Cliente'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Cliente */}
              <div className="space-y-2">
                <Label htmlFor="tipo">{t('clientes:client_type')} *</Label>
                <Select
                  onValueChange={(value) => setValue('tipo', value)}
                  defaultValue="NUEVO"
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="tipo"
                    className={errors.tipo ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder={t('clientes:select_type')} />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposClienteOptions.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <p className="text-sm text-red-500">{errors.tipo.message}</p>
                )}
              </div>

              {/* Origen del Cliente */}
              <div className="space-y-2">
                <Label htmlFor="origen">{t('clientes:client_origin')} *</Label>
                <Select
                  onValueChange={(value) => setValue('origen', value)}
                  defaultValue="WEB"
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="origen"
                    className={errors.origen ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder={t('clientes:select_origin')} />
                  </SelectTrigger>
                  <SelectContent>
                    {origenesClienteOptions.map((origen) => (
                      <SelectItem key={origen.value} value={origen.value}>
                        {origen.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.origen && (
                  <p className="text-sm text-red-500">{errors.origen.message}</p>
                )}
              </div>
            </div>

            {/* Preferencia de Contacto */}
            <div className="space-y-2">
              <Label htmlFor="preferencias_contacto">
                {t('clientes:contact_preference')}
              </Label>
              <Select
                onValueChange={(value) => setValue('preferencias_contacto', value)}
                defaultValue="WHATSAPP"
                disabled={isSubmitting}
              >
                <SelectTrigger id="preferencias_contacto">
                  <SelectValue placeholder={t('clientes:select_preference')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="LLAMADA">Llamada</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common:cancel') || 'Cancelar'}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {t('clientes:creating') || 'Creando...'}
                </>
              ) : (
                t('clientes:create_client')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClienteForm;

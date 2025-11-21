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
  tiposClienteOptions: any[];
  origenesClienteOptions: any[];
}

interface ClienteFormData {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  pais: string;
  tipo: string;
  origen: string;
  preferencias_contacto: string;
  telefono_contacto: string;
}

export const CreateClienteForm: React.FC<CreateClienteFormProps> = ({
  open,
  onOpenChange,
  onSuccess,
  paisOptions,
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
  } = useForm<ClienteFormData>({
    defaultValues: {
      preferencias_contacto: 'WHATSAPP',
      tipo: 'NUEVO',
      origen: 'WEB',
    },
  });

  const onSubmit = async (data: ClienteFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono_contacto,
        direccion: data.direccion,
        pais: parseInt(data.pais),
        tipo: data.tipo,
        origen: data.origen,
        preferencias_contacto: data.preferencias_contacto,
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
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
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

              {/* Teléfono de Contacto */}
              <div className="space-y-2">
                <Label htmlFor="telefono_contacto">{t('clientes:contact_phone')} *</Label>
                <Input
                  id="telefono_contacto"
                  placeholder={t('clientes:phone_placeholder') || '+591-2-1234567'}
                  {...register('telefono_contacto', {
                    required: t('clientes:contact_phone_required') || 'El teléfono de contacto es obligatorio',
                    validate: (value) => {
                      const digits = value.replace(/\D/g, '');
                      if (digits.length < 7 || digits.length > 15) {
                        return t('clientes:contact_phone_invalid') || 'El teléfono debe tener entre 7 y 15 dígitos';
                      }
                      return true;
                    },
                  })}
                  className={errors.telefono_contacto ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.telefono_contacto && (
                  <p className="text-sm text-red-500">{errors.telefono_contacto.message}</p>
                )}
              </div>
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
              <p className="text-xs text-gray-500">
                {t('clientes:address_note') || 'Puedes buscar la dirección en Google Maps y copiarla aquí'}
              </p>
            </div>
          </div>

          {/* Sección 2: Ubicación del Cliente */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              {t('clientes:location_section') || 'Ubicación del Cliente'}
            </h3>

            <div className="space-y-2">
              <Label htmlFor="pais">{t('clientes:country_context')} *</Label>
              <Select
                onValueChange={(value) => setValue('pais', value)}
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
                  disabled={isSubmitting}
                  defaultValue="NUEVO"
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
                  disabled={isSubmitting}
                  defaultValue="WEB"
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
                {t('clientes:contact_preference')} *
              </Label>
              <Select
                onValueChange={(value) => setValue('preferencias_contacto', value)}
                disabled={isSubmitting}
                defaultValue="WHATSAPP"
              >
                <SelectTrigger
                  id="preferencias_contacto"
                  className={errors.preferencias_contacto ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder={t('clientes:select_preference')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">{t('clientes:email') || 'Email'}</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="LLAMADA">{t('clientes:phone_call') || 'Llamada'}</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                </SelectContent>
              </Select>
              {errors.preferencias_contacto && (
                <p className="text-sm text-red-500">{errors.preferencias_contacto.message}</p>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common:cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting
                ? t('clientes:creating')
                : t(
                    'clientes:create_client'
                  )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClienteForm;

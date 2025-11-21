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
import { validateAddressWithGoogle, generateMapsUrl, type GeocodingResult } from '@/lib/addressUtils';

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
  ubicacion_lat?: number;
  ubicacion_lng?: number;
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
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [validatedAddress, setValidatedAddress] = useState<GeocodingResult | null>(null);
  const [lastValidatedAddress, setLastValidatedAddress] = useState<string>('');

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
  const direccionValue = watch('direccion');

  // Obtener nombre del país seleccionado
  const getPaisNombre = (): string => {
    if (!paisValue) return '';
    const pais = paisOptions.find((p) => String(p.id) === paisValue);
    return pais?.nombre || '';
  };

  // Función para validar dirección con Google (automática)
  const handleValidateAddress = async (addressToValidate?: string) => {
    try {
      const addressValue = addressToValidate || direccionValue;

      // Si la dirección está vacía o no cambió, no hacer nada
      if (!addressValue || !paisValue) {
        return;
      }

      // Si la dirección es la misma que la última validada, no revalidar
      if (addressValue === lastValidatedAddress) {
        return;
      }

      setIsValidatingAddress(true);

      const paisNombre = getPaisNombre();
      if (!paisNombre) {
        return;
      }

      const result = await validateAddressWithGoogle(addressValue, paisNombre);
      setValidatedAddress(result);
      setLastValidatedAddress(addressValue);
      
      // Auto-llenar el campo de dirección con la dirección limpia
      setValue('direccion', result.formattedAddress);
      setValue('ubicacion_lat', result.latitude);
      setValue('ubicacion_lng', result.longitude);

      toast.success(t('clientes:address_validated') || 'Dirección validada correctamente');
    } catch (error: any) {
      console.error('Error validating address:', error);
      // No mostrar error si es validación automática silenciosa
      // Solo mostrar si fue manual
    } finally {
      setIsValidatingAddress(false);
    }
  };

  // Handler para validación al salir del campo (onBlur)
  const handleAddressBlur = () => {
    if (direccionValue && paisValue && direccionValue !== lastValidatedAddress) {
      handleValidateAddress(direccionValue);
    }
  };

  // Función para obtener ubicación actual
  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setValue('ubicacion_lat', latitude);
          setValue('ubicacion_lng', longitude);

          try {
            // Reverse geocoding: coordenadas → dirección
            setIsValidatingAddress(true);
            
            // Usar Google Maps API para reverse geocoding
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            if (apiKey) {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
              );
              const data = await response.json();
              
              if (data.results.length > 0) {
                const address = data.results[0].formatted_address;
                setValue('direccion', address);
                setValidatedAddress({
                  formattedAddress: address,
                  latitude,
                  longitude,
                });
              }
            }

            toast.success(t('clientes:address_validated') || 'Ubicación obtenida correctamente');
          } catch (error) {
            console.error('Error in reverse geocoding:', error);
            toast.success('Ubicación obtenida, pero no se pudo obtener la dirección');
          } finally {
            setIsValidatingAddress(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error(t('common:error') || 'No se pudo obtener la ubicación. Verifica los permisos.');
        }
      );
    } else {
      toast.error('Geolocalización no soportada en este navegador');
    }
  };

  // Función para abrir en Google Maps
  const handleOpenInMaps = () => {
    if (validatedAddress?.formattedAddress) {
      const mapsUrl = generateMapsUrl(validatedAddress.formattedAddress);
      window.open(mapsUrl, '_blank');
    }
  };

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

              {/* Dirección */}
              <div className="space-y-2">
                <Label htmlFor="direccion">{t('clientes:address')}</Label>
                <Input
                  id="direccion"
                  placeholder={t('clientes:address_placeholder') || 'Dirección completa'}
                  {...register('direccion')}
                  onBlur={handleAddressBlur}
                  disabled={isSubmitting || isValidatingAddress}
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Ubicación del Cliente */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              {t('clientes:location_section') || 'Ubicación del Cliente'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* País */}
              <div className="space-y-2">
                <Label htmlFor="pais">{t('clientes:country_context')} *</Label>
                <Select
                  onValueChange={(value) => setValue('pais', value)}
                  disabled={isSubmitting || isValidatingAddress}
                  value={paisValue}
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

              {/* Botones de Validación */}
              <div className="space-y-2">
                <Label>{t('clientes:location')}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLastValidatedAddress('');
                      handleValidateAddress();
                    }}
                    disabled={isSubmitting || isValidatingAddress || !paisValue || !direccionValue}
                    className="flex-1"
                  >
                    🔍 {t('clientes:validate_address')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseMyLocation}
                    disabled={isSubmitting || isValidatingAddress || !paisValue}
                    className="flex-1"
                  >
                    📍 {t('clientes:use_my_location')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Mostrar Dirección Limpia - Vista Previa */}
            {validatedAddress && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                <div>
                  <p className="text-xs font-semibold text-green-700 uppercase">
                    {t('clientes:cleaned_address')}
                  </p>
                  <p className="text-sm text-green-900 font-medium">
                    {validatedAddress.formattedAddress}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-green-600">Latitud</p>
                    <p className="text-sm font-mono text-green-900">
                      {validatedAddress.latitude.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600">Longitud</p>
                    <p className="text-sm font-mono text-green-900">
                      {validatedAddress.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="default"
                  onClick={handleOpenInMaps}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  🗺️ {t('clientes:view_on_maps')}
                </Button>
              </div>
            )}
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

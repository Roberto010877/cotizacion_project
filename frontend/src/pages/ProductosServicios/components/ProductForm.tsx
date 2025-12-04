import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAppTranslation } from "@/i18n/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProductoServicio } from "../types";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: ProductoServicio | null;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface ProductFormData {
  codigo: string;
  nombre: string;
  tipo_producto: string;
  unidad_medida: string;
  precio_base: number | string;
  requiere_medidas: boolean;
  configuracion_ui: string;
}

export function ProductForm({
  open,
  onOpenChange,
  productToEdit,
  onSubmit,
  isSubmitting,
}: ProductFormProps) {
  const { t } = useAppTranslation(["common", "productos_servicios", "navigation"]);

  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch, 
    setError, // Importante para errores manuales
    clearErrors,
    formState: { errors } 
  } = useForm<ProductFormData>({
    defaultValues: {
      codigo: "",
      nombre: "",
      tipo_producto: "CORTINA",
      unidad_medida: "M2",
      precio_base: 0,
      requiere_medidas: false,
      configuracion_ui: "{}", 
    },
  });

  // Efecto para cargar datos al editar
  useEffect(() => {
    if (open) {
      // Limpiamos errores previos al abrir el modal
      clearErrors();
      
      if (productToEdit) {
        reset({
          codigo: productToEdit.codigo,
          nombre: productToEdit.nombre,
          tipo_producto: productToEdit.tipo_producto,
          unidad_medida: productToEdit.unidad_medida,
          precio_base: Number(productToEdit.precio_base),
          requiere_medidas: productToEdit.requiere_medidas,
          configuracion_ui: JSON.stringify(productToEdit.configuracion_ui || {}, null, 2),
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          tipo_producto: "CORTINA",
          unidad_medida: "M2",
          precio_base: 0,
          requiere_medidas: false,
          configuracion_ui: "{\n  \"pide_color\": true\n}",
        });
      }
    }
  }, [productToEdit, open, reset, clearErrors]);

  const handleFormSubmit = (data: ProductFormData) => {
    // 1. Validación manual del JSON (Sin alert, usando setError)
    let configParsed = {};
    try {
      configParsed = JSON.parse(data.configuracion_ui);
    } catch (e) {
      setError("configuracion_ui", { 
        type: "manual", 
        message: "El formato JSON es inválido. Verifica comillas y llaves." 
      });
      return; // Detenemos el proceso si hay error
    }

    const payload = {
      ...data,
      precio_base: Number(data.precio_base),
      configuracion_ui: configParsed,
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {productToEdit ? t("common:edit") : t("navigation:create_product")}
          </DialogTitle>
          <DialogDescription>
            {t("productos_servicios:manage_products")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CÓDIGO */}
            <div className="grid gap-2">
              <Label htmlFor="codigo" className={errors.codigo ? "text-red-500" : ""}>
                {t("common:code")} *
              </Label>
              <Input 
                id="codigo" 
                {...register("codigo", { 
                  required: "El código es requerido",
                  minLength: { value: 3, message: "Mínimo 3 caracteres" }
                })} 
                className={errors.codigo ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.codigo && (
                <span className="text-red-500 text-xs font-medium">{errors.codigo.message}</span>
              )}
            </div>

            {/* TIPO */}
            <div className="grid gap-2">
              <Label htmlFor="tipo">{t("productos_servicios:product_type")}</Label>
              <Select
                onValueChange={(val) => setValue("tipo_producto", val)}
                value={watch("tipo_producto")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CORTINA">Cortina</SelectItem>
                  <SelectItem value="PERSIANA">Persiana</SelectItem>
                  <SelectItem value="TOLDO">Toldo</SelectItem>
                  <SelectItem value="MOTOR">Motor</SelectItem>
                  <SelectItem value="RIEL">Riel/Barral</SelectItem>
                  <SelectItem value="SERVICIO">Servicio</SelectItem>
                  <SelectItem value="OTRO">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* NOMBRE */}
          <div className="grid gap-2">
            <Label htmlFor="nombre" className={errors.nombre ? "text-red-500" : ""}>
              {t("navigation:name")} *
            </Label>
            <Input 
              id="nombre" 
              {...register("nombre", { required: "El nombre es requerido" })} 
              className={errors.nombre ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {/* AGREGADO: Mensaje de error para nombre */}
            {errors.nombre && (
              <span className="text-red-500 text-xs font-medium">{errors.nombre.message}</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {/* PRECIO */}
             <div className="grid gap-2">
              <Label htmlFor="precio" className={errors.precio_base ? "text-red-500" : ""}>
                {t("common:price")} *
              </Label>
              <Input 
                id="precio" 
                type="number" 
                step="0.01" 
                {...register("precio_base", { 
                  required: "El precio es requerido", 
                  min: { value: 0, message: "No puede ser negativo" }
                })} 
                className={errors.precio_base ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {/* AGREGADO: Mensaje de error para precio */}
              {errors.precio_base && (
                <span className="text-red-500 text-xs font-medium">{errors.precio_base.message}</span>
              )}
            </div>

            {/* UNIDAD */}
            <div className="grid gap-2">
              <Label htmlFor="unidad">{t("productos_servicios:unit")}</Label>
              <Select
                onValueChange={(val) => setValue("unidad_medida", val)}
                value={watch("unidad_medida")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M2">Metros Cuadrados (m²)</SelectItem>
                  <SelectItem value="ML">Metros Lineales (ml)</SelectItem>
                  <SelectItem value="UN">Unidad (un)</SelectItem>
                  <SelectItem value="GL">Global (gl)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* REQUIERE MEDIDAS */}
          <div className="flex items-center space-x-2 py-2">
            <Checkbox 
              id="medidas" 
              checked={watch("requiere_medidas")}
              onCheckedChange={(checked) => setValue("requiere_medidas", checked as boolean)}
            />
            <Label htmlFor="medidas" className="cursor-pointer">
              ¿Requiere Medidas (Ancho x Alto)?
            </Label>
          </div>

          {/* CONFIGURACIÓN UI (JSON) */}
          <div className="grid gap-2">
            <Label htmlFor="config_ui" className={errors.configuracion_ui ? "text-red-500" : ""}>
              Configuración UI (JSON)
            </Label>
            <Textarea
              id="config_ui"
              className={`font-mono text-xs ${errors.configuracion_ui ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              rows={5}
              {...register("configuracion_ui")}
            />
            {/* CORRECCIÓN: Error inline en lugar de Alert */}
            {errors.configuracion_ui ? (
              <span className="text-red-500 text-xs font-medium">
                {errors.configuracion_ui.message}
              </span>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                Define los campos dinámicos: "pide_color": true, "pide_riel": true...
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common:cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("common:loading") : t("common:save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
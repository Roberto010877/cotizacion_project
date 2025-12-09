import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Filter, X } from "lucide-react";
import { useAppTranslation } from "@/i18n/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Definimos la estructura de los filtros
export interface FilterState {
  tipo_producto: string;
  unidad_medida: string;
}

interface ProductFilterProps {
  currentFilters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export function ProductFilter({
  currentFilters,
  onApplyFilters,
  onClearFilters,
}: ProductFilterProps) {
  const { t } = useAppTranslation(["productos_servicios", "common"]);
  
  // Usamos react-hook-form para manejar el estado del formulario localmente
  const { setValue, watch, handleSubmit, reset } = useForm<FilterState>({
    defaultValues: currentFilters,
  });

  // Sincronizar formulario si los filtros externos cambian (ej: limpiar desde fuera)
  useEffect(() => {
    reset(currentFilters);
  }, [currentFilters, reset]);

  const onSubmit = (data: FilterState) => {
    onApplyFilters(data);
  };

  const handleClear = () => {
    const emptyFilters = { tipo_producto: "", unidad_medida: "" };
    reset(emptyFilters);
    onClearFilters();
  };

  // Observamos valores para cambiar el estilo del botón si hay filtros activos
  const values = watch();
  const hasActiveFilters = values.tipo_producto || values.unidad_medida;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={hasActiveFilters ? "default" : "outline"} className="gap-2">
          <Filter className="h-4 w-4" />
          {t("common:filters")}
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
              •
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("common:filter_by")}</DialogTitle>
          <DialogDescription>
            {t("productos_servicios:filter_desc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          
          {/* FILTRO: TIPO DE PRODUCTO */}
          <div className="grid gap-2">
            <Label htmlFor="tipo">{t("productos_servicios:product_type")}</Label>
            <Select
              value={watch("tipo_producto")}
              onValueChange={(val) => setValue("tipo_producto", val === "ALL" ? "" : val)}
            >
              <SelectTrigger id="tipo">
                <SelectValue placeholder={t("common:select_all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("common:select_all")}</SelectItem>
                <SelectItem value="CORTINA">Cortina (Textil)</SelectItem>
                <SelectItem value="PERSIANA">Persiana (Mecánica)</SelectItem>
                <SelectItem value="TOLDO">Toldo (Exterior)</SelectItem>
                <SelectItem value="MOTOR">Motor / Automatización</SelectItem>
                <SelectItem value="RIEL">Riel / Barral</SelectItem>
                <SelectItem value="SERVICIO">Servicio (Mano de Obra)</SelectItem>
                <SelectItem value="OTRO">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* FILTRO: UNIDAD DE MEDIDA */}
          <div className="grid gap-2">
            <Label htmlFor="unidad">{t("productos_servicios:unit")}</Label>
            <Select
              value={watch("unidad_medida")}
              onValueChange={(val) => setValue("unidad_medida", val === "ALL" ? "" : val)}
            >
              <SelectTrigger id="unidad">
                <SelectValue placeholder={t("common:select_all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("common:select_all")}</SelectItem>
                <SelectItem value="M2">Metros Cuadrados (m²)</SelectItem>
                <SelectItem value="ML">Metros Lineales (ml)</SelectItem>
                <SelectItem value="UN">Unidad (un)</SelectItem>
                <SelectItem value="GL">Global (gl)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClear}
              className="text-muted-foreground w-full sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              {t("common:clear_filters")}
            </Button>
            <Button type="submit" className="w-full sm:w-auto">{t("common:apply")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

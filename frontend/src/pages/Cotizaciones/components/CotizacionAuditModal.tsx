import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, RefreshCw, Mail } from "lucide-react";
import { displayDateTimeWithZone, displayDateTime } from "@/lib/dateUtils";
import type { Cotizacion } from "../types";
import { useTranslation } from "react-i18next";

interface CotizacionAuditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cotizacion: Cotizacion;
}

export function CotizacionAuditModal({
  open,
  onOpenChange,
  cotizacion,
}: CotizacionAuditModalProps) {
  const { t } = useTranslation('common');
  
  const getUserDisplay = () => {
    if (!cotizacion.usuario_creacion_detalle) {
      return cotizacion.usuario_creacion ? `${t('user')} #${cotizacion.usuario_creacion}` : t('user');
    }
    
    const user = cotizacion.usuario_creacion_detalle;
    const fullName = `${user.first_name} ${user.last_name}`.trim() || user.username;
    return fullName;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            {t('audit_information')}
          </DialogTitle>
          <DialogDescription>
            {t('audit_description')}{" "}
            <span className="font-mono font-semibold text-blue-600">
              {cotizacion.numero}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sección: Creación */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase">
              <Calendar className="h-4 w-4" />
              {t('creation')}
            </div>
            
            <div className="pl-6 space-y-2">
              {/* Fecha/Hora con Timezone */}
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">
                  {t('date_and_time')}:
                </span>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {displayDateTime(cotizacion.created_at)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {displayDateTimeWithZone(cotizacion.created_at)}
                  </div>
                </div>
              </div>

              {/* Usuario */}
              {(cotizacion.usuario_creacion || cotizacion.usuario_creacion_detalle) && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {t('created_by')}:
                    </span>
                    <Badge variant="secondary" className="font-medium">
                      {getUserDisplay()}
                    </Badge>
                  </div>
                  
                  {/* Email del usuario */}
                  {cotizacion.usuario_creacion_detalle?.email && (
                    <div className="flex justify-between items-center pl-4">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {cotizacion.usuario_creacion_detalle.email}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Separador */}
          <div className="border-t"></div>

          {/* Sección: Última Modificación */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase">
              <RefreshCw className="h-4 w-4" />
              {t('last_modification')}
            </div>
            
            <div className="pl-6 space-y-2">
              {/* Fecha/Hora con Timezone */}
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">
                  {t('date_and_time')}:
                </span>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {displayDateTime(cotizacion.updated_at)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {displayDateTimeWithZone(cotizacion.updated_at)}
                  </div>
                </div>
              </div>

              {/* Diferencia de tiempo */}
              {cotizacion.created_at !== cotizacion.updated_at && (
                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  ⚠️ {t('modified_after_creation')}
                </div>
              )}
            </div>
          </div>

          {/* Nota Técnica */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase">
              {t('utc_references_technical')}
            </div>
            <div className="font-mono text-xs space-y-1">
              <div>
                <span className="text-muted-foreground">{t('created')}:</span>{" "}
                <span className="text-foreground">{cotizacion.created_at}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('modified')}:</span>{" "}
                <span className="text-foreground">{cotizacion.updated_at}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

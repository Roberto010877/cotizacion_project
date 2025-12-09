import { useState, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Search, Plus, CalendarDays, Eye, Pencil, Trash2, Clock } from "lucide-react";
import { format } from 'date-fns';
import { parseDateOnly } from '@/lib/dateUtils';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/apiClient';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// CORRECCIÓN DE RUTAS: Asumo que los componentes comunes están en src/components/common
import { DataTable } from "@/components/common/DataTable";
import Pagination from "@/components/common/Pagination";
import { Badge } from "@/components/ui/badge";

// CORRECCIÓN DE RUTAS: Asumo que los hooks están en src/hooks
import { useAppTranslation } from "@/i18n/hooks"; // Se mantiene asumiendo que el i18n/hooks existe
import { useMediaQuery } from "@/hooks/useMediaQuery";
import usePagination from "@/hooks/usePagination";

// CORRECCIÓN DE RUTAS: Se asume que usePaginatedCotizaciones se movió a src/hooks
import { usePaginatedCotizaciones } from "@/hooks/usePaginatedCotizaciones"; 
import { type Cotizacion, type CotizacionListFilters } from "./types";
import { CotizacionFilter, type CotizacionFilters } from "./components/CotizacionFilter";
import { CotizacionFormDialog } from "./components/CotizacionFormDialog";
import { CotizacionAuditModal } from "./components/CotizacionAuditModal";
import CotizacionDetailModal from "@/components/modals/CotizacionDetailModal";


// --- Mapeo de ESTADOS para la UI ---
const ESTADO_MAP: Record<Cotizacion['estado'], { label: string, color: string }> = {
    'BORRADOR': { label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
    'ENVIADA': { label: 'Enviada', color: 'bg-blue-100 text-blue-800' },
    'ACEPTADA': { label: 'Aceptada', color: 'bg-green-100 text-green-800' },
    'RECHAZADA': { label: 'Rechazada', color: 'bg-red-100 text-red-800' },
    'VENCIDA': { label: 'Vencida', color: 'bg-yellow-100 text-yellow-800' },
    'CANCELADA': { label: 'Cancelada', color: 'bg-purple-100 text-purple-800' },
};

const CotizacionesPage = () => {
  const { t } = useAppTranslation(['common', 'navigation', 'cotizaciones']);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const queryClient = useQueryClient();

  // Estados para controlar los dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [cotizacionToEdit, setCotizacionToEdit] = useState<Cotizacion | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [cotizacionForAudit, setCotizacionForAudit] = useState<Cotizacion | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [cotizacionToView, setCotizacionToView] = useState<Cotizacion | null>(null);

  // 1. ESTADO DE FILTROS GLOBALES
  const [filters, setFilters] = useState<CotizacionListFilters>({
    search: '',
    estado: '',
    fecha_desde: undefined,
    fecha_hasta: undefined,
  });

  const [searchTerm, setSearchTerm] = useState('');

  // 2. PAGINACIÓN
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 20,
    pageSizeOptions: [10, 20, 50],
  });

  // 3. DATOS API
  const { data, isLoading } = usePaginatedCotizaciones({
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
    filters: filters,
  });

  // Debounce de búsqueda para actualizar filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
      if (searchTerm !== filters.search) pagination.setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filters.search, pagination]);

  // Actualizar total count
  useEffect(() => {
    if (data?.count) pagination.setTotalCount(data.count);
  }, [data?.count, pagination]);

  // Handler para refrescar datos
  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
  };

  const handleApplyFilters = (newFilters: CotizacionFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    pagination.setPage(1);
  };

  // --- Handlers de Acciones ---
  const handleView = (cotizacion: Cotizacion) => {
    setCotizacionToView(cotizacion);
    setIsDetailModalOpen(true);
  };

  const handleEdit = async (cotizacion: Cotizacion) => {
    // Validar que el estado permita edición
    if (!['BORRADOR', 'ENVIADA'].includes(cotizacion.estado)) {
      toast.error(t('cotizaciones:cannot_edit_status', { estado: cotizacion.estado }));
      return;
    }
    
    try {
      // Cargar los datos completos de la cotización desde la API
      toast.loading(t('cotizaciones:loading_quotation'));
      const response = await apiClient.get(`/gestion/cotizaciones/${cotizacion.id}/`);
      toast.dismiss();
      
      console.log("📋 [EDIT] Datos completos de la cotización:", response.data);
      setCotizacionToEdit(response.data);
      setIsEditDialogOpen(true);
    } catch (error) {
      toast.dismiss();
      console.error("Error cargando cotización:", error);
      toast.error(t('common:error_generic'));
    }
  };

  const handleAudit = (cotizacion: Cotizacion) => {
    setCotizacionForAudit(cotizacion);
    setIsAuditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('common:delete_confirmation_generic', '¿Estás seguro de eliminar este elemento?'))) {
      try {
        console.log("Eliminando cotización ID:", id);
        await apiClient.delete(`/gestion/cotizaciones/${id}/`);
        toast.success(t('common:delete_success', 'Elemento eliminado exitosamente'));
        handleRefreshData();
      } catch (error: any) {
        console.error("Error al eliminar cotización:", error);
        const errorMsg = error.response?.data?.detail || t('common:error_generic', 'Error al procesar la solicitud');
        toast.error(errorMsg);
      }
    }
  };


  // --- COLUMNAS DE ESCRITORIO ---
  const columns: ColumnDef<Cotizacion>[] = [
    {
      accessorKey: "numero",
      header: t('common:number'),
      cell: ({ row }) => <span className="font-mono font-medium text-blue-600">{row.original.numero}</span>
    },
    {
      accessorKey: "cliente_nombre",
      header: t('common:client'),
    },
    {
      accessorKey: "vendedor_nombre",
      header: t('cotizaciones:vendedor_label'),
    },
    {
      accessorKey: "estado",
      header: t('common:status'),
      cell: ({ row }) => {
        const estado = row.original.estado;
        const { color } = ESTADO_MAP[estado] || { color: 'bg-gray-100 text-gray-800' };
        return <Badge className={color}>{t(`cotizaciones:status_${estado.toLowerCase()}`)}</Badge>;
      }
    },
    {
      accessorKey: "fecha_emision",
      header: t('cotizaciones:date_emision'),
      cell: ({ row }) => {
        const localDate = parseDateOnly(row.original.fecha_emision);
        return <div className="flex items-center gap-1 text-sm text-muted-foreground"><CalendarDays className="h-3 w-3" /> {format(localDate, 'dd/MM/yyyy')}</div>
      }
    },
    {
      accessorKey: "total_general",
      header: () => <div className="text-right">{t('cotizaciones:total_general')}</div>,
      cell: ({ row }) => {
        const amount = Number(row.original.total_general || 0);
        return <div className="text-right font-semibold text-lg text-green-700">${amount.toFixed(2)}</div>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t('common:actions')}</div>,
      cell: ({ row }) => {
        const cotizacion = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleView(cotizacion)}
              title={t('common:view')}
              className="text-gray-500 hover:text-blue-600 h-8 w-8"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAudit(cotizacion)}
              title={t('common:audit')}
              className="text-gray-500 hover:text-purple-600 h-8 w-8"
            >
              <Clock className="h-4 w-4" />
            </Button>
            {['BORRADOR', 'ENVIADA'].includes(cotizacion.estado) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(cotizacion)}
                title={t('common:edit')}
                className="text-gray-500 hover:text-orange-600 h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(cotizacion.id)}
              title={t('common:delete')}
              className="text-gray-500 hover:text-red-600 h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ];

  // --- COLUMNAS MÓVIL ---
  const columnsMobile: ColumnDef<Cotizacion>[] = [
    {
      id: "mobile-info",
      header: "Cotización",
      cell: ({ row }) => (
        <div className="flex flex-col py-1">
          <span className="font-medium text-sm text-blue-600">{row.original.numero}</span>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>{row.original.cliente_nombre}</span>
            <span>•</span>
            <Badge className={ESTADO_MAP[row.original.estado].color}>
                {t(`cotizaciones:status_${row.original.estado.toLowerCase()}`)}
            </Badge>
          </div>
        </div>
      )
    },
    {
      accessorKey: "total_general",
      header: () => <div className="text-right">Total</div>,
      cell: ({ row }) => {
         const amount = Number(row.original.total_general || 0);
         return <div className="text-right font-bold text-base text-green-700">${amount.toFixed(2)}</div>;
      },
    },
     {
        id: "mobile-actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(row.original)}>
              <Eye className="h-4 w-4" />
            </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(row.original)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(row.original.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      }
  ];

  const cotizaciones = data?.results || [];

  const currentFilterState: CotizacionFilters = {
    estado: filters.estado,
    fecha_desde: filters.fecha_desde,
    fecha_hasta: filters.fecha_hasta,
  };

  return (
    <Card className="h-full flex flex-col border-0 sm:border shadow-none sm:shadow-sm bg-transparent sm:bg-card">
      <CardHeader className="px-0 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>{t('navigation:cotizaciones')}</CardTitle>
            <CardDescription className="hidden sm:block">
              {t('cotizaciones:manage_cotizaciones')}
            </CardDescription>
          </div>
          
          <Button 
            className="w-full sm:w-auto cursor-pointer"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('cotizaciones:create_new_cotizacion')}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('cotizaciones:search_placeholder')}
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <CotizacionFilter
            currentFilters={currentFilterState}
            onApplyFilters={handleApplyFilters}
          />
        </div>
      </CardHeader>

      <CardContent className="px-0 sm:px-6 flex-1">
        <DataTable
          columns={isMobile ? columnsMobile : columns}
          data={cotizaciones}
          isLoading={isLoading}
          skeletonRows={pagination.pageSize}
        />
        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalCount={pagination.totalCount}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
            pageSizeOptions={[10, 20, 50]}
            isLoading={isLoading}
          />
        </div>
      </CardContent>

      {/* Dialog para CREAR cotización */}
      <CotizacionFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
            setIsCreateDialogOpen(false);
            handleRefreshData();
        }}
      />
      
      {/* Dialog para EDITAR cotización */}
      {cotizacionToEdit && (
        <CotizacionFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          cotizacion={cotizacionToEdit}
          mode="edit"
          onSuccess={() => {
              setIsEditDialogOpen(false);
              setCotizacionToEdit(null);
              handleRefreshData();
          }}
        />
      )}

      {/* Modal de Auditoría */}
      {cotizacionForAudit && (
        <CotizacionAuditModal
          open={isAuditModalOpen}
          onOpenChange={setIsAuditModalOpen}
          cotizacion={cotizacionForAudit}
        />
      )}

      {/* Modal de Detalles de Cotización */}
      {cotizacionToView && (
        <CotizacionDetailModal
          isOpen={isDetailModalOpen}
          cotizacion={cotizacionToView}
          onClose={() => {
            setIsDetailModalOpen(false);
            setCotizacionToView(null);
          }}
          onStatusChanged={handleRefreshData}
        />
      )}
    </Card>
  );
};

export default CotizacionesPage;
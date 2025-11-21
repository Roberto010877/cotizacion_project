import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/common/DataTable";
import Pagination from "@/components/common/Pagination";
import InfiniteScroll from "@/components/common/InfiniteScroll";
import { useAppTranslation } from "@/i18n/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import usePagination from "@/hooks/usePagination";
import usePaginatedPedidosServicio from "@/hooks/usePaginatedPedidosServicio";
import type { PedidoServicio } from "@/hooks/usePaginatedPedidosServicio";

const PedidosServicioPage = () => {
  const { t } = useAppTranslation(['navigation', 'common']);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isCreating, setIsCreating] = useState(false);

  // Paginación
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  });

  // Datos paginados
  const { data, isLoading } = usePaginatedPedidosServicio({
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
  });

  // Actualizar total de registros cuando llegan los datos
  useEffect(() => {
    if (data?.count) {
      pagination.setTotalCount(data.count);
    }
  }, [data?.count, pagination]);

  // Skeleton rows para loading state
  const skeletonRows = Array(pagination.pageSize).fill(null);

  // Define the columns for the table - Desktop view
  const columns: ColumnDef<PedidoServicio>[] = [
    {
      id: "col-id",
      accessorKey: "id",
      header: "ID",
    },
    {
      id: "col-numero",
      accessorKey: "numero_pedido",
      header: t('common:number'),
    },
    {
      id: "col-cliente",
      accessorKey: "cliente_nombre",
      header: t('navigation:client'),
    },
    {
      id: "col-solicitante",
      accessorKey: "solicitante",
      header: t('pedidos_servicio:requester'),
    },
    {
      id: "col-fecha_inicio",
      accessorKey: "fecha_inicio",
      header: t('common:start_date'),
      cell: ({ row }) => {
        const date = row.getValue("fecha_inicio");
        return date ? new Date(date as string).toLocaleDateString() : '-';
      },
    },
    {
      id: "col-estado",
      accessorKey: "estado_display",
      header: t('navigation:status'),
    },
    {
      id: "col-items",
      accessorKey: "total_items",
      header: t('pedidos_servicio:items'),
    },
    {
      id: "col-actions",
      header: t('common:actions'),
      cell: () => (
        <Button variant="ghost" size="sm">
          {t('common:view')}
        </Button>
      ),
    },
  ];

  // Columnas para vista móvil
  const columnsMobile: ColumnDef<PedidoServicio>[] = [
    {
      id: "mobile-numero",
      accessorKey: "numero_pedido",
      header: t('common:number'),
    },
    {
      id: "mobile-cliente",
      accessorKey: "cliente_nombre",
      header: t('navigation:client'),
    },
    {
      id: "mobile-estado",
      accessorKey: "estado_display",
      header: t('navigation:status'),
    },
    {
      id: "mobile-items",
      accessorKey: "total_items",
      header: t('pedidos_servicio:items'),
    },
    {
      id: "mobile-actions",
      header: t('common:actions'),
      cell: () => (
        <Button variant="ghost" size="sm">
          {t('common:view')}
        </Button>
      ),
    },
  ];

  const pedidos = data?.results || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('pedidos_servicio:title')}</CardTitle>
          <CardDescription>
            {t('pedidos_servicio:description')}
          </CardDescription>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          {t('pedidos_servicio:create_new')}
        </Button>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          // Mobile: Infinite Scroll
          <InfiniteScroll
            onLoadMore={pagination.loadMore}
            hasMore={pagination.hasNextPage}
            isLoading={isLoading}
          >
            <DataTable
              columns={columnsMobile}
              data={isLoading ? skeletonRows : pedidos}
              isLoading={isLoading}
            />
          </InfiniteScroll>
        ) : (
          // Desktop: Table + Pagination
          <>
            <DataTable
              columns={columns}
              data={isLoading ? skeletonRows : pedidos}
              isLoading={isLoading}
            />
            <div className="mt-4">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                totalCount={pagination.totalCount}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
                pageSizeOptions={[10, 25, 50, 100]}
                isLoading={isLoading}
              />
            </div>
          </>
        )}
      </CardContent>
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pedidos_servicio:create_new')}</DialogTitle>
            <DialogDescription>
              {t('pedidos_servicio:create_new_description') || 'Ingresa los datos del nuevo pedido de servicio'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Funcionalidad en desarrollo. Por favor, intenta nuevamente más tarde.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              {t('common:cancel')}
            </Button>
            <Button disabled>
              {t('common:save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PedidosServicioPage;



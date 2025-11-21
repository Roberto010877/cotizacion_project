import { useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import Pagination from "@/components/common/Pagination";
import InfiniteScroll from "@/components/common/InfiniteScroll";
import { useAppTranslation } from "@/i18n/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import usePagination from "@/hooks/usePagination";
import usePaginatedOrdenes from "@/hooks/usePaginatedOrdenes";

type OrdenCompra = {
  id: number;
  numero_orden: string;
  proveedor: number | string;
  fecha_entrega_prevista: string;
  total: number;
  estado: string;
};

const OrdenesCompraPage = () => {
  const { t } = useAppTranslation(['navigation', 'common']);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Paginación
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  });

  // Datos paginados
  const { data, isLoading } = usePaginatedOrdenes({
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

  // Define the columns for the table
  const columns: ColumnDef<OrdenCompra>[] = [
    {
      id: "col-id",
      accessorKey: "id",
      header: "ID",
    },
    {
      id: "col-numero",
      accessorKey: "numero_orden",
      header: t('common:number'),
    },
    {
      id: "col-proveedor",
      accessorKey: "proveedor",
      header: t('navigation:supplier'),
    },
    {
      id: "col-fecha_entrega",
      accessorKey: "fecha_entrega_prevista",
      header: t('common:estimated_delivery'),
    },
    {
      id: "col-total",
      accessorKey: "total",
      header: () => <div className="text-right">{t('navigation:total')}</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
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

  // Columnas móvil
  const columnsMobile: ColumnDef<OrdenCompra>[] = [
    {
      id: "mobile-numero",
      accessorKey: "numero",
      header: t('common:number'),
    },
    {
      id: "mobile-proveedor",
      accessorKey: "proveedor",
      header: t('navigation:supplier'),
    },
    {
      id: "mobile-total",
      accessorKey: "total",
      header: t('navigation:total'),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="text-right">{formatted}</div>;
      },
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

  const ordenes = data?.results || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('navigation:purchase_orders')}</CardTitle>
          <CardDescription>
            {t('navigation:manage_orders')}
          </CardDescription>
        </div>
        <Button>{t('navigation:create_order')}</Button>
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
              data={isLoading ? skeletonRows : ordenes}
              isLoading={isLoading}
            />
          </InfiniteScroll>
        ) : (
          // Desktop: Table + Pagination
          <>
            <DataTable
              columns={columns}
              data={isLoading ? skeletonRows : ordenes}
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
    </Card>
  );
};

export default OrdenesCompraPage;

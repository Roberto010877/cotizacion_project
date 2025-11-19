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
import usePaginatedProveedores from "@/hooks/usePaginatedProveedores";

type Proveedor = {
  id: number;
  nombre: string;
  ruc: string;
  email: string;
  telefono: string;
  ciudad: string;
  pais: string;
  estado: boolean;
};

const ProveedoresPage = () => {
  const { t } = useAppTranslation(['navigation', 'common']);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Paginación
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  });

  // Datos paginados
  const { data, isLoading } = usePaginatedProveedores({
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
  const columns: ColumnDef<Proveedor>[] = [
    {
      id: "col-id",
      accessorKey: "id",
      header: "ID",
    },
    {
      id: "col-nombre",
      accessorKey: "nombre",
      header: t('navigation:name'),
    },
    {
      id: "col-ruc",
      accessorKey: "ruc",
      header: "RUC",
    },
    {
      id: "col-email",
      accessorKey: "email",
      header: "Email",
    },
    {
      id: "col-telefono",
      accessorKey: "telefono",
      header: t('common:phone'),
    },
    {
      id: "col-ciudad",
      accessorKey: "ciudad",
      header: t('common:city'),
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
  const columnsMobile: ColumnDef<Proveedor>[] = [
    {
      id: "mobile-nombre",
      accessorKey: "nombre",
      header: t('navigation:name'),
    },
    {
      id: "mobile-ruc",
      accessorKey: "ruc",
      header: "RUC",
    },
    {
      id: "mobile-email",
      accessorKey: "email",
      header: "Email",
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

  const proveedores = data?.results || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('navigation:proveedores')}</CardTitle>
          <CardDescription>
            {t('navigation:manage_suppliers')}
          </CardDescription>
        </div>
        <Button>{t('navigation:create_supplier')}</Button>
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
              data={isLoading ? skeletonRows : proveedores}
              isLoading={isLoading}
            />
          </InfiniteScroll>
        ) : (
          // Desktop: Table + Pagination
          <>
            <DataTable
              columns={columns}
              data={isLoading ? skeletonRows : proveedores}
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

export default ProveedoresPage;

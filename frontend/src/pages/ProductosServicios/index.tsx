import { useState, useEffect, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Search, Plus } from 'lucide-react'; // Iconos para la búsqueda
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Campo de búsqueda
import { DataTable } from '@/components/common/DataTable';
import Pagination from '@/components/common/Pagination';
import InfiniteScroll from '@/components/common/InfiniteScroll';
import { useAppTranslation } from '@/i18n/hooks';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import usePagination from '@/hooks/usePagination';

// Importación del nuevo hook y tipos
import { usePaginatedCatalogo } from '@/hooks/usePaginatedCatalogo';
import { type ProductoServicio, type CatalogoFilters } from './types';


const ProductosPage = () => {
  // Asegúrate de que tu hook de traducción cargue los namespaces correctos
  const { t } = useAppTranslation(['navigation', 'common', 'productos_servicios']); 
  const isMobile = useMediaQuery('(max-width: 768px)');

  // 1. ESTADO DE LOS FILTROS
  const [filters, setFilters] = useState<Partial<CatalogoFilters>>({
    search: '',
    tipo_producto: '',
    unidad_medida: '',
  });

  // 2. ESTADO DE BÚSQUEDA TEMPORAL (para evitar peticiones API en cada tecla)
  const [searchTerm, setSearchTerm] = useState('');
  
  // 3. Paginación
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  });

  // 4. DATOS PAGINADOS (Usa el nuevo hook)
  const { data, isLoading } = usePaginatedCatalogo({
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
    filters: filters, // Pasamos el estado de filtros
  });
  
  // EFECTO para aplicar la búsqueda después de que el usuario deja de escribir (debounce)
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Aplica el término de búsqueda al estado principal de filtros
      setFilters(prev => ({ ...prev, search: searchTerm }));
      // Resetea la página a 1 cada vez que la búsqueda cambia
      pagination.setPage(1);
    }, 500); // 500ms de retraso
    return () => clearTimeout(timeout);
  }, [searchTerm]); // Depende únicamente del término que se está escribiendo

  // Actualizar total de registros cuando llegan los datos
  useEffect(() => {
    if (data?.count) {
      pagination.setTotalCount(data.count);
    }
  }, [data?.count, pagination]);

  // Skeleton rows para loading state
  const skeletonRows = useMemo(() => Array(pagination.pageSize).fill(null), [pagination.pageSize]);

  // Define the columns for the table (Versión Desktop)
  const columns: ColumnDef<ProductoServicio>[] = [
    {
      id: 'col-codigo',
      accessorKey: 'codigo',
      header: t('common:code'),
    },
    {
      id: 'col-nombre',
      accessorKey: 'nombre',
      header: t('navigation:name'),
    },
    {
      id: 'col-tipo',
      accessorKey: 'tipo_producto',
      header: t('productos_servicios:product_type'),
      cell: ({ row }) => t(`productos_servicios:${row.original.tipo_producto}`), // Asume traducción para el tipo
    },
    {
      id: 'col-medida',
      accessorKey: 'unidad_medida',
      header: t('productos_servicios:unit'),
    },
    {
      id: 'col-precio',
      accessorKey: 'precio_base',
      header: () => <div className="text-right">{t('common:price')}</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('precio_base') as string);
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      id: 'col-actions',
      header: t('common:actions'),
      cell: () => (
        <Button variant="ghost" size="sm">
          {t('common:view')}
        </Button>
      ),
    },
  ];

  // Columnas móvil
  const columnsMobile: ColumnDef<ProductoServicio>[] = [
    {
      id: 'mobile-nombre',
      accessorKey: 'nombre',
      header: t('navigation:name'),
    },
    {
      id: 'mobile-codigo',
      accessorKey: 'codigo',
      header: t('common:code'),
    },
    {
      id: 'mobile-precio',
      accessorKey: 'precio_base',
      header: t('common:price'),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('precio_base') as string);
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
        return <div className="text-right">{formatted}</div>;
      },
    },
    {
      id: 'mobile-actions',
      header: t('common:actions'),
      cell: () => (
        <Button variant="ghost" size="sm">
          {t('common:view')}
        </Button>
      ),
    },
  ];

  const productos = data?.results || [];

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className='flex-1'>
          <CardTitle>{t('productos_servicios:catalog_title')}</CardTitle>
          <CardDescription>
            {t('productos_servicios:manage_products')}
          </CardDescription>
        </div>
        
        {/* BARRA DE BÚSQUEDA Y BOTÓN DE ACCIÓN */}
        <div className='flex w-full sm:w-auto space-x-2'>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t('common:search_code_name')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('navigation:create_product')}
          </Button>
        </div>
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
              data={isLoading ? skeletonRows : productos}
              isLoading={isLoading}
            />
          </InfiniteScroll>
        ) : (
          // Desktop: Table + Pagination
          <>
            <DataTable
              columns={columns}
              data={isLoading ? skeletonRows : productos}
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

export default ProductosPage;
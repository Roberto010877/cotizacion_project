import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppTranslation } from '@/i18n/hooks';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  isLoading = false,
}) => {
  const { t } = useAppTranslation(['common']);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirstPage = () => {
    onPageChange(1);
  };

  const handleLastPage = () => {
    onPageChange(totalPages);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      {/* Info */}
      <div className="text-sm text-gray-600">
        {totalCount > 0 ? (
          <>
            {t('common:showing')}{' '}
            <span className="font-semibold">{startItem.toLocaleString()}</span>
            -
            <span className="font-semibold">{endItem.toLocaleString()}</span>
            {' '}{t('common:of')}{' '}
            <span className="font-semibold">{totalCount.toLocaleString()}</span>
            {' '}{t('common:records')}
          </>
        ) : (
          t('common:no_records')
        )}
      </div>

      {/* Page Size Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">{t('common:rows_per_page')}</label>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            onPageSizeChange(parseInt(value));
            onPageChange(1); // Reset to first page when changing size
          }}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* First Page */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleFirstPage}
          disabled={currentPage === 1 || isLoading || totalPages === 0}
          title={t('common:first_page')}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || isLoading || totalPages === 0}
          title={t('common:previous_page')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Info */}
        <div className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded border">
          {t('common:page')} {totalCount > 0 ? currentPage : 0} {t('common:of')} {totalPages}
        </div>

        {/* Next Page */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextPage}
          disabled={currentPage === totalPages || isLoading || totalPages === 0}
          title={t('common:next_page')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleLastPage}
          disabled={currentPage === totalPages || isLoading || totalPages === 0}
          title={t('common:last_page')}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;

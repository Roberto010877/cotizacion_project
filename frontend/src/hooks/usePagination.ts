import { useState, useCallback, useMemo } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

export interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalCount: (count: number) => void;
  resetPagination: () => void;
  // For infinite scroll
  offset: number;
  limit: number;
  hasNextPage: boolean;
  loadMore: () => void;
}

export const usePagination = (options: UsePaginationOptions = {}): UsePaginationReturn => {
  const {
    initialPage = 1,
    initialPageSize = 25,
    pageSizeOptions = [10, 25, 50, 100],
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = useMemo(
    () => Math.ceil(totalCount / pageSize) || 1,
    [totalCount, pageSize]
  );

  const offset = useMemo(() => (currentPage - 1) * pageSize, [currentPage, pageSize]);

  const hasNextPage = useMemo(() => currentPage < totalPages, [currentPage, totalPages]);

  const handleSetPage = useCallback((page: number) => {
    if (page < 1) {
      setCurrentPage(1);
    } else if (page > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const handleSetPageSize = useCallback((size: number) => {
    if (pageSizeOptions.includes(size)) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when changing size
    }
  }, [pageSizeOptions]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
    setTotalCount(0);
  }, [initialPage, initialPageSize]);

  return {
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    setTotalCount,
    resetPagination,
    offset,
    limit: pageSize,
    hasNextPage,
    loadMore: handleLoadMore,
  };
};

export default usePagination;

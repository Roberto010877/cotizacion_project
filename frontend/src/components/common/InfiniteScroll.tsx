import React, { useEffect, useRef, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface InfiniteScrollProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  loadingHeight?: number;
  threshold?: number;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  loadingHeight: _loadingHeight = 100,
  threshold = 100,
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver(handleIntersection, options);

    if (observerTarget.current) {
      observerRef.current.observe(observerTarget.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold]);

  return (
    <div>
      {children}
      {(hasMore || isLoading) && (
        <div
          ref={observerTarget}
          className="w-full flex items-center justify-center py-8"
        >
          {isLoading ? (
            <div className="space-y-2 w-full">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full rounded" />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Scroll para cargar más...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;

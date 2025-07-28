'use client';

import { useState, useCallback, useMemo } from 'react';
import { PaginationInfo } from '@/lib/utils/api-response';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  changeLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  reset: () => void;
}

export interface PaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  maxLimit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function usePagination(options: PaginationOptions = {}): PaginationState & PaginationActions {
  const {
    initialPage = 1,
    initialLimit = 10,
    maxLimit = 100,
    onPageChange,
    onLimitChange,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  // Computed values
  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);
  const hasNext = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPrev = useMemo(() => page > 1, [page]);

  // Actions
  const goToPage = useCallback((newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages || 1));
    setPage(validPage);
    onPageChange?.(validPage);
  }, [totalPages, onPageChange]);

  const nextPage = useCallback(() => {
    if (hasNext) {
      goToPage(page + 1);
    }
  }, [hasNext, page, goToPage]);

  const prevPage = useCallback(() => {
    if (hasPrev) {
      goToPage(page - 1);
    }
  }, [hasPrev, page, goToPage]);

  const firstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const lastPage = useCallback(() => {
    if (totalPages > 0) {
      goToPage(totalPages);
    }
  }, [totalPages, goToPage]);

  const changeLimit = useCallback((newLimit: number) => {
    const validLimit = Math.max(1, Math.min(newLimit, maxLimit));
    setLimit(validLimit);
    setPage(1); // Reset to first page when changing limit
    onLimitChange?.(validLimit);
  }, [maxLimit, onLimitChange]);

  const setTotalCount = useCallback((newTotal: number) => {
    setTotal(Math.max(0, newTotal));
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setTotal(0);
  }, [initialPage, initialLimit]);

  return {
    // State
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    
    // Actions
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    changeLimit,
    setTotal: setTotalCount,
    reset,
  };
}

// Hook for working with server pagination info
export function useServerPagination(
  paginationInfo: PaginationInfo | null,
  options: PaginationOptions = {}
) {
  const pagination = usePagination(options);

  // Update local state when server pagination info changes
  useMemo(() => {
    if (paginationInfo) {
      pagination.setTotal(paginationInfo.total);
    }
  }, [paginationInfo, pagination]);

  return {
    ...pagination,
    // Override with server values when available
    page: paginationInfo?.page || pagination.page,
    limit: paginationInfo?.limit || pagination.limit,
    total: paginationInfo?.total || pagination.total,
    totalPages: paginationInfo?.totalPages || pagination.totalPages,
    hasNext: paginationInfo?.hasNext ?? pagination.hasNext,
    hasPrev: paginationInfo?.hasPrev ?? pagination.hasPrev,
  };
}

// Pagination utilities
export const paginationUtils = {
  // Calculate skip value for database queries
  getSkip: (page: number, limit: number) => (page - 1) * limit,

  // Get page range for pagination UI
  getPageRange: (currentPage: number, totalPages: number, maxVisible: number = 5) => {
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  },

  // Get pagination summary text
  getSummaryText: (page: number, limit: number, total: number) => {
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return `Showing ${start}-${end} of ${total} results`;
  },

  // Validate pagination parameters
  validatePagination: (page: number, limit: number, maxLimit: number = 100) => {
    return {
      page: Math.max(1, Math.floor(page)),
      limit: Math.max(1, Math.min(Math.floor(limit), maxLimit)),
    };
  },
};

// Hook for infinite scroll pagination
export function useInfiniteScroll<T>(
  fetchMore: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options: {
    initialPage?: number;
    threshold?: number;
    enabled?: boolean;
  } = {}
) {
  const { initialPage = 1, threshold = 100, enabled = true } = options;

  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchMore(page);
      setData(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, page, loading, hasMore, enabled]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  }, [initialPage]);

  // Scroll event handler
  const handleScroll = useCallback((event: Event) => {
    if (!enabled || loading || !hasMore) return;

    const target = event.target as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMore();
    }
  }, [enabled, loading, hasMore, threshold, loadMore]);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    handleScroll,
  };
}

// Hook for cursor-based pagination
export function useCursorPagination<T>(
  fetchPage: (cursor?: string) => Promise<{ data: T[]; nextCursor?: string; hasMore: boolean }>,
  options: {
    enabled?: boolean;
    pageSize?: number;
  } = {}
) {
  const { enabled = true, pageSize = 10 } = options;

  const [data, setData] = useState<T[]>([]);
  const [cursors, setCursors] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [hasPrev, setHasPrev] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadPage = useCallback(async (cursor?: string, direction: 'next' | 'prev' = 'next') => {
    if (loading || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchPage(cursor);
      setData(result.data);
      setHasNext(result.hasMore);

      if (direction === 'next' && result.nextCursor) {
        setCursors(prev => {
          const newCursors = [...prev];
          newCursors[currentIndex + 1] = result.nextCursor!;
          return newCursors;
        });
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchPage, loading, enabled, currentIndex]);

  const nextPage = useCallback(() => {
    if (hasNext && cursors[currentIndex + 1]) {
      setCurrentIndex(prev => prev + 1);
      setHasPrev(true);
      loadPage(cursors[currentIndex + 1], 'next');
    }
  }, [hasNext, cursors, currentIndex, loadPage]);

  const prevPage = useCallback(() => {
    if (hasPrev && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      const prevCursor = currentIndex > 1 ? cursors[currentIndex - 1] : undefined;
      loadPage(prevCursor, 'prev');
      setHasPrev(currentIndex > 1);
    }
  }, [hasPrev, currentIndex, cursors, loadPage]);

  const reset = useCallback(() => {
    setData([]);
    setCursors([]);
    setCurrentIndex(0);
    setHasNext(true);
    setHasPrev(false);
    setError(null);
    loadPage();
  }, [loadPage]);

  // Load initial page
  useMemo(() => {
    if (enabled && data.length === 0) {
      loadPage();
    }
  }, [enabled, data.length, loadPage]);

  return {
    data,
    loading,
    hasNext,
    hasPrev,
    error,
    nextPage,
    prevPage,
    reset,
  };
}
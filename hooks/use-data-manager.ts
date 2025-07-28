'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIResponse, PaginationInfo } from '@/lib/utils/api-response';

// Base interfaces for data management
export interface DataManagerOptions<T> {
  endpoint: string;
  queryKey: string[];
  initialFilters?: Record<string, any>;
  initialPage?: number;
  initialLimit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
  onSuccess?: (data: T[]) => void;
  onError?: (error: Error) => void;
}

export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface BulkOperationOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  optimisticUpdate?: boolean;
}

export interface DataManagerState<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationInfo | null;
  filters: FilterOptions;
  selectedItems: string[];
  isRefreshing: boolean;
}

export interface DataManagerActions<T, CreateData, UpdateData> {
  // Data fetching
  refresh: () => void;
  refetch: () => void;
  
  // Pagination
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  changeLimit: (limit: number) => void;
  
  // Filtering and sorting
  setFilters: (filters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  setSearch: (search: string) => void;
  setSorting: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  
  // Selection
  selectItem: (id: string) => void;
  selectItems: (ids: string[]) => void;
  deselectItem: (id: string) => void;
  deselectAll: () => void;
  selectAll: () => void;
  toggleSelection: (id: string) => void;
  
  // CRUD operations
  create: (data: CreateData) => Promise<T>;
  update: (id: string, data: UpdateData) => Promise<T>;
  delete: (id: string) => Promise<void>;
  
  // Bulk operations
  bulkCreate: (data: CreateData[]) => Promise<any>;
  bulkUpdate: (ids: string[], data: UpdateData) => Promise<any>;
  bulkDelete: (ids: string[]) => Promise<any>;
  
  // Export
  exportData: (format?: 'json' | 'csv') => Promise<string>;
}

// Generic API client functions
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Main data manager hook
export function useDataManager<T, CreateData = any, UpdateData = any>(
  options: DataManagerOptions<T>
): DataManagerState<T> & DataManagerActions<T, CreateData, UpdateData> {
  const {
    endpoint,
    queryKey,
    initialFilters = {},
    initialPage = 1,
    initialLimit = 10,
    autoRefresh = false,
    refreshInterval = 30000,
    staleTime = 5000,
    cacheTime = 300000,
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const queryClient = useQueryClient();

  // State management
  const [filters, setFiltersState] = useState<FilterOptions>(initialFilters);
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: initialPage,
    limit: initialLimit,
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Build query parameters
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', pagination.page.toString());
    params.set('limit', pagination.limit.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value.toString());
        }
      }
    });
    
    return params.toString();
  }, [filters, pagination]);

  // Data fetching query
  const {
    data: queryData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: async () => {
      const response = await apiRequest<T[]>(`${endpoint}?${queryParams}`);
      onSuccess?.(response.data || []);
      return response;
    },
    enabled,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime,
    cacheTime,
    onError: (err: Error) => {
      onError?.(err);
    },
  });

  const data = queryData?.data || [];
  const paginationInfo = queryData?.pagination || null;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (createData: CreateData) => {
      const response = await apiRequest<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(createData),
      });
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string; data: UpdateData }) => {
      const response = await apiRequest<T>(`${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`${endpoint}/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setSelectedItems(prev => prev.filter(item => item !== deleteMutation.variables));
    },
  });

  // Bulk create mutation
  const bulkCreateMutation = useMutation({
    mutationFn: async (dataArray: CreateData[]) => {
      const response = await apiRequest(`${endpoint}/bulk`, {
        method: 'POST',
        body: JSON.stringify({ data: dataArray }),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, data: updateData }: { ids: string[]; data: UpdateData }) => {
      const response = await apiRequest(`${endpoint}/bulk`, {
        method: 'PUT',
        body: JSON.stringify({ ids, data: updateData }),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiRequest(`${endpoint}/bulk`, {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setSelectedItems([]);
    },
  });

  // Actions
  const actions: DataManagerActions<T, CreateData, UpdateData> = {
    // Data fetching
    refresh: useCallback(() => {
      refetch();
    }, [refetch]),

    refetch: useCallback(() => {
      refetch();
    }, [refetch]),

    // Pagination
    goToPage: useCallback((page: number) => {
      setPagination(prev => ({ ...prev, page: Math.max(1, page) }));
    }, []),

    nextPage: useCallback(() => {
      if (paginationInfo?.hasNext) {
        setPagination(prev => ({ ...prev, page: prev.page + 1 }));
      }
    }, [paginationInfo?.hasNext]),

    prevPage: useCallback(() => {
      if (paginationInfo?.hasPrev) {
        setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
      }
    }, [paginationInfo?.hasPrev]),

    changeLimit: useCallback((limit: number) => {
      setPagination({ page: 1, limit: Math.max(1, Math.min(100, limit)) });
    }, []),

    // Filtering and sorting
    setFilters: useCallback((newFilters: Partial<FilterOptions>) => {
      setFiltersState(prev => ({ ...prev, ...newFilters }));
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    }, []),

    clearFilters: useCallback(() => {
      setFiltersState(initialFilters);
      setPagination({ page: 1, limit: pagination.limit });
    }, [initialFilters, pagination.limit]),

    setSearch: useCallback((search: string) => {
      setFiltersState(prev => ({ ...prev, search }));
      setPagination(prev => ({ ...prev, page: 1 }));
    }, []),

    setSorting: useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') => {
      setFiltersState(prev => ({ ...prev, sortBy, sortOrder }));
    }, []),

    // Selection
    selectItem: useCallback((id: string) => {
      setSelectedItems(prev => prev.includes(id) ? prev : [...prev, id]);
    }, []),

    selectItems: useCallback((ids: string[]) => {
      setSelectedItems(prev => {
        const newIds = ids.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }, []),

    deselectItem: useCallback((id: string) => {
      setSelectedItems(prev => prev.filter(item => item !== id));
    }, []),

    deselectAll: useCallback(() => {
      setSelectedItems([]);
    }, []),

    selectAll: useCallback(() => {
      const allIds = data.map((item: any) => item.id).filter(Boolean);
      setSelectedItems(allIds);
    }, [data]),

    toggleSelection: useCallback((id: string) => {
      setSelectedItems(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    }, []),

    // CRUD operations
    create: useCallback(async (createData: CreateData) => {
      return createMutation.mutateAsync(createData);
    }, [createMutation]),

    update: useCallback(async (id: string, updateData: UpdateData) => {
      return updateMutation.mutateAsync({ id, data: updateData });
    }, [updateMutation]),

    delete: useCallback(async (id: string) => {
      return deleteMutation.mutateAsync(id);
    }, [deleteMutation]),

    // Bulk operations
    bulkCreate: useCallback(async (dataArray: CreateData[]) => {
      return bulkCreateMutation.mutateAsync(dataArray);
    }, [bulkCreateMutation]),

    bulkUpdate: useCallback(async (ids: string[], updateData: UpdateData) => {
      return bulkUpdateMutation.mutateAsync({ ids, data: updateData });
    }, [bulkUpdateMutation]),

    bulkDelete: useCallback(async (ids: string[]) => {
      return bulkDeleteMutation.mutateAsync(ids);
    }, [bulkDeleteMutation]),

    // Export
    exportData: useCallback(async (format: 'json' | 'csv' = 'json') => {
      const exportParams = new URLSearchParams(queryParams);
      exportParams.set('format', format);
      exportParams.delete('page');
      exportParams.delete('limit');
      
      const response = await fetch(`${endpoint}/export?${exportParams.toString()}`);
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      return response.text();
    }, [endpoint, queryParams]),
  };

  // State
  const state: DataManagerState<T> = {
    data,
    loading: isLoading,
    error: error as Error | null,
    pagination: paginationInfo,
    filters,
    selectedItems,
    isRefreshing: isRefetching,
  };

  return { ...state, ...actions };
}

// Specialized hooks for common use cases
export function useTableData<T, CreateData = any, UpdateData = any>(
  endpoint: string,
  queryKey: string[],
  options?: Partial<DataManagerOptions<T>>
) {
  return useDataManager<T, CreateData, UpdateData>({
    endpoint,
    queryKey,
    initialLimit: 10,
    autoRefresh: false,
    ...options,
  });
}

export function useRealtimeData<T, CreateData = any, UpdateData = any>(
  endpoint: string,
  queryKey: string[],
  options?: Partial<DataManagerOptions<T>>
) {
  return useDataManager<T, CreateData, UpdateData>({
    endpoint,
    queryKey,
    autoRefresh: true,
    refreshInterval: 5000,
    staleTime: 1000,
    ...options,
  });
}

export function useCachedData<T, CreateData = any, UpdateData = any>(
  endpoint: string,
  queryKey: string[],
  options?: Partial<DataManagerOptions<T>>
) {
  return useDataManager<T, CreateData, UpdateData>({
    endpoint,
    queryKey,
    staleTime: 300000, // 5 minutes
    cacheTime: 600000, // 10 minutes
    ...options,
  });
}
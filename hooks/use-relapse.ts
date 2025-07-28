import { useState, useEffect } from 'react'
import { RelapseService, RelapseData, RelapseFilters, RelapseStats } from '@/lib/services/relapse.service'

const relapseService = new RelapseService()

export interface UseRelapseReturn {
  relapses: any[]
  stats: RelapseStats | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  fetchRelapses: (filters?: RelapseFilters) => Promise<void>
  createRelapse: (data: RelapseData) => Promise<void>
  updateRelapse: (id: string, data: Partial<RelapseData>) => Promise<void>
  deleteRelapse: (id: string) => Promise<void>
  refreshData: () => Promise<void>
}

export function useRelapse(initialFilters: RelapseFilters = {}): UseRelapseReturn {
  const [relapses, setRelapses] = useState<any[]>([])
  const [stats, setStats] = useState<RelapseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [currentFilters, setCurrentFilters] = useState<RelapseFilters>(initialFilters)

  const fetchRelapses = async (filters: RelapseFilters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const mergedFilters = { ...currentFilters, ...filters }
      setCurrentFilters(mergedFilters)
      
      const response = await relapseService.getRelapses(mergedFilters)
      
      setRelapses(response.relapses)
      setStats(response.stats)
      setPagination(response.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createRelapse = async (data: RelapseData) => {
    try {
      setError(null)
      await relapseService.createRelapse(data)
      await refreshData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create relapse')
      throw err
    }
  }

  const updateRelapse = async (id: string, data: Partial<RelapseData>) => {
    try {
      setError(null)
      await relapseService.updateRelapse(id, data)
      await refreshData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update relapse')
      throw err
    }
  }

  const deleteRelapse = async (id: string) => {
    try {
      setError(null)
      await relapseService.deleteRelapse(id)
      await refreshData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete relapse')
      throw err
    }
  }

  const refreshData = async () => {
    await fetchRelapses(currentFilters)
  }

  useEffect(() => {
    fetchRelapses(initialFilters)
  }, [])

  return {
    relapses,
    stats,
    loading,
    error,
    pagination,
    fetchRelapses,
    createRelapse,
    updateRelapse,
    deleteRelapse,
    refreshData
  }
}
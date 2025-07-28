"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingDown, Calendar, BarChart3, Plus, Edit, Trash2, RefreshCw, Search } from "lucide-react"
import { RelapseDialog } from "@/components/relapse-dialog"
import { toast } from "sonner"
import {
  useFetchRelapses,
  useCreateRelapse,
  useUpdateRelapse,
  useDeleteRelapse,
  useRelapseStats
} from "@/hooks/use-api"
import { RelapseFilters, RelapseData } from "@/types/api"

// Utility functions
const formatDate = (date: string | Date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('tr-TR')
}

const formatTime = (time: string | Date | null) => {
  if (!time) return '-'
  return new Date(time).toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'destructive'
    case 'medium': return 'default'
    case 'low': return 'secondary'
    default: return 'outline'
  }
}

const getSeverityLabel = (severity: string) => {
  switch (severity) {
    case 'high': return 'Yüksek'
    case 'medium': return 'Orta'
    case 'low': return 'Düşük'
    default: return 'Bilinmeyen'
  }
}

// Client-side filtering functions
const filterByTime = (relapses: RelapseData[], timeFilter: string) => {
  if (timeFilter === 'all') return relapses
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  return relapses.filter(relapse => {
    const relapseDate = new Date(relapse.date || relapse.createdAt || '')
    
    switch (timeFilter) {
      case 'today':
        return relapseDate >= today
      case 'week':
        return relapseDate >= weekAgo
      case 'month':
        return relapseDate >= monthAgo
      default:
        return true
    }
  })
}

const filterBySeverity = (relapses: RelapseData[], severityFilter: string) => {
  if (severityFilter === 'all') return relapses
  return relapses.filter(relapse => relapse.severity === severityFilter)
}

const filterBySearch = (relapses: RelapseData[], searchTerm: string) => {
  if (!searchTerm.trim()) return relapses
  
  const term = searchTerm.toLowerCase()
  return relapses.filter(relapse => 
    relapse.user?.name?.toLowerCase().includes(term) ||
    relapse.trigger?.toLowerCase().includes(term) ||
    relapse.mood?.toLowerCase().includes(term) ||
    relapse.notes?.toLowerCase().includes(term) ||
    relapse.recovery?.toLowerCase().includes(term)
  )
}

export default function RelapsePage() {
  const [timeFilter, setTimeFilter] = useState<RelapseFilters['timeFilter']>("all")
  const [severityFilter, setSeverityFilter] = useState<RelapseFilters['severityFilter']>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const itemsPerPage = 10

  // API Hooks - Tüm veriyi bir kez çek
  const { 
    data: relapseResponse, 
    isLoading: isRelapseLoading, 
    isError: isRelapseError, 
    error: relapseError,
    refetch: refetchRelapses 
  } = useFetchRelapses({ limit: 100 }) // Tüm veriyi çek

  const { 
    data: stats, 
    isLoading: isStatsLoading,
    refetch: refetchStats 
  } = useRelapseStats()

  const createRelapseMutation = useCreateRelapse()
  const updateRelapseMutation = useUpdateRelapse()
  const deleteRelapseMutation = useDeleteRelapse()

  // Client-side filtering and pagination
  const filteredAndPaginatedData = useMemo(() => {
    const allRelapses = relapseResponse?.data || []
    
    // Apply filters
    let filtered = filterByTime(allRelapses, timeFilter || 'all')
    filtered = filterBySeverity(filtered, severityFilter || 'all')
    filtered = filterBySearch(filtered, searchTerm)
    
    // Calculate pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = filtered.slice(startIndex, endIndex)
    
    return {
      data: paginatedData,
      pagination: {
        total,
        page: currentPage,
        pages: totalPages,
        limit: itemsPerPage
      }
    }
  }, [relapseResponse?.data, timeFilter, severityFilter, searchTerm, currentPage, itemsPerPage])

  // Handlers
  const handleCreateRelapse = async (data: RelapseData) => {
    try {
      // Test için geçici userId ekliyoruz
      const relapseData = {
        ...data,
        userId: data.userId || 'user_123' // Geçici test kullanıcısı
      }
      await createRelapseMutation.mutateAsync(relapseData)
      toast.success("Yeni relapse kaydı eklendi")
      refetchRelapses()
      refetchStats()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Relapse kaydı eklenirken hata oluştu"
      toast.error(errorMessage)
    }
  }

  const handleUpdateRelapse = async (id: string, data: RelapseData) => {
    try {
      await updateRelapseMutation.mutateAsync({ id, data })
      toast.success("Relapse kaydı güncellendi")
      refetchRelapses()
      refetchStats()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Relapse kaydı güncellenirken hata oluştu"
      toast.error(errorMessage)
    }
  }

  const handleDeleteRelapse = async (id: string) => {
    if (!confirm("Bu relapse kaydını silmek istediğinizden emin misiniz?")) {
      return
    }

    try {
      await deleteRelapseMutation.mutateAsync(id)
      toast.success("Relapse kaydı silindi")
      refetchRelapses()
      refetchStats()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Relapse kaydı silinirken hata oluştu"
      toast.error(errorMessage)
    }
  }

  const handleRefresh = () => {
    refetchRelapses()
    refetchStats()
  }

  const handleFilterChange = (type: 'time' | 'severity', value: string) => {
    if (type === 'time') {
      setTimeFilter(value as RelapseFilters['timeFilter'])
    } else {
      setSeverityFilter(value as RelapseFilters['severityFilter'])
    }
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when search changes
  }

  // Data extraction
  const relapses = filteredAndPaginatedData.data
  const pagination = filteredAndPaginatedData.pagination
  
  const isLoading = isRelapseLoading || createRelapseMutation.isPending || 
                   updateRelapseMutation.isPending || deleteRelapseMutation.isPending

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relapse Takibi</h2>
          <p className="text-muted-foreground">
            Kullanıcı relapse verilerini analiz edin ve destek sağlayın
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <RelapseDialog
            trigger={
              <Button disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Relapse
              </Button>
            }
            title="Yeni Relapse Kaydı"
            onSave={handleCreateRelapse}
          />
        </div>
      </div>

      {(isRelapseError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {relapseError?.message || 'Veri yüklenirken hata oluştu'}
        </div>
      )}

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isStatsLoading ? "-" : stats?.today || 0}
            </div>
            <p className="text-xs text-muted-foreground">Bugünkü relapse sayısı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Hafta</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isStatsLoading ? "-" : stats?.week || 0}
            </div>
            <p className="text-xs text-muted-foreground">Bu haftaki toplam</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Ay</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isStatsLoading ? "-" : stats?.month || 0}
            </div>
            <p className="text-xs text-muted-foreground">Bu ayki toplam</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Streak</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isStatsLoading ? "-" : `${Math.round(stats?.averageStreak || 0)} gün`}
            </div>
            <p className="text-xs text-muted-foreground">Relapse öncesi</p>
          </CardContent>
        </Card>
      </div>

      {/* Tetikleyici Analizi */}
      <Card>
        <CardHeader>
          <CardTitle>En Yaygın Tetikleyiciler</CardTitle>
          <CardDescription>
            Relapse&apos;e neden olan ana faktörler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isStatsLoading ? (
              <div className="text-center text-muted-foreground py-4">
                Yükleniyor...
              </div>
            ) : stats?.triggerStats && stats.triggerStats.length > 0 ? (
              stats.triggerStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="font-medium">{stat.trigger || 'Belirtilmemiş'}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">{stat.count} kez</span>
                    <Badge variant="outline">{stat.percentage}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Henüz veri bulunmuyor
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Relapse Kayıtları */}
      <Card>
        <CardHeader>
          <CardTitle>Son Relapse Kayıtları</CardTitle>
          <CardDescription>
            Kullanıcıların bildirdiği relapse detayları
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtreleme ve Arama */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı, tetikleyici, ruh hali ara..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={timeFilter} onValueChange={(value) => handleFilterChange('time', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Zaman filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="today">Bugün</SelectItem>
                <SelectItem value="week">Bu Hafta</SelectItem>
                <SelectItem value="month">Bu Ay</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={(value) => handleFilterChange('severity', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Şiddet filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Tarih & Saat</TableHead>
                <TableHead>Önceki Streak</TableHead>
                <TableHead>Tetikleyici</TableHead>
                <TableHead>Ruh Hali</TableHead>
                <TableHead>Şiddet</TableHead>
                <TableHead>Notlar</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isRelapseLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : relapses && relapses.length > 0 ? (
                relapses
                  .filter((relapse): relapse is RelapseData & { id: string } => !!relapse.id)
                  .map((relapse) => (
                  <TableRow key={relapse.id}>
                    <TableCell className="font-medium">
                      {relapse.user?.name || 'Bilinmeyen Kullanıcı'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatDate(relapse.date || '')}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(relapse.time)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{relapse.previousStreak || 0} gün</Badge>
                    </TableCell>
                    <TableCell>
                      {relapse.trigger ? (
                        <Badge variant="secondary">{relapse.trigger}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{relapse.mood || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(relapse.severity) as "destructive" | "default" | "secondary" | "outline"}>
                        {getSeverityLabel(relapse.severity)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {relapse.notes || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <RelapseDialog
                          trigger={
                            <Button variant="ghost" size="sm" disabled={isLoading}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                          title="Relapse Düzenle"
                          relapse={relapse}
                          onSave={(data) => handleUpdateRelapse(relapse.id, data)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRelapse(relapse.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm || timeFilter !== 'all' || severityFilter !== 'all' 
                      ? 'Filtrelere uygun kayıt bulunamadı' 
                      : 'Henüz relapse kaydı bulunmuyor'
                    }
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Toplam {pagination.total} kayıt, sayfa {pagination.page} / {pagination.pages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={pagination.page <= 1 || isLoading}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={pagination.page >= pagination.pages || isLoading}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
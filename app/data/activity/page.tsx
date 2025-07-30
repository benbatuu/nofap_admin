"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Activity, Users, Clock, TrendingUp, Smartphone, Monitor, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { ActivityService } from "@/lib/services/data-activity.service"
import { useDataActivity } from "@/hooks/use-api"
import { ActivityAnalytics, ActivityFilters } from "@/types/api"

export default function ActivityPage() {
  const [timeFilter, setTimeFilter] = useState("24h")
  const [deviceFilter, setDeviceFilter] = useState("all")
  const [activityData, setActivityData] = useState<ActivityAnalytics | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // API hook kullanımı
  const filters: ActivityFilters = {
    timeFilter,
    limit: 50
  }

  const {
    data: apiData,
    isLoading,
    error,
    refetch
  } = useDataActivity(filters)

  // Local state güncellemesi
  useEffect(() => {
    if (apiData) {
      setActivityData(apiData)
    }
  }, [apiData])

  // Filtre değişikliklerini handle et
  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value)
  }

  const handleDeviceFilterChange = (value: string) => {
    setDeviceFilter(value)
  }

  // Filtrelenmiş ve aranmış aktiviteler
  const filteredAndSearchedActivities = useMemo(() => {
    if (!activityData?.recentActivities) return []

    let filtered = ActivityService.filterByDevice(activityData.recentActivities, deviceFilter)

    // Arama filtresi uygula
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(activity =>
        activity.username.toLowerCase().includes(query) ||
        activity.device.toLowerCase().includes(query) ||
        activity.location.toLowerCase().includes(query) ||
        activity.status.toLowerCase().includes(query) ||
        activity.actions.some(action => action.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [activityData?.recentActivities, deviceFilter, searchQuery])

  // Pagination hesaplamaları
  const totalItems = filteredAndSearchedActivities.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentActivities = filteredAndSearchedActivities.slice(startIndex, endIndex)

  // Sayfa değiştiğinde en üste scroll
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, deviceFilter, timeFilter])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Aktivite verileri yükleniyor...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !activityData) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-500 mb-4">Aktivite verileri yüklenirken hata oluştu</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kullanıcı Aktivitesi</h2>
          <p className="text-muted-foreground">
            Kullanıcı davranışlarını ve uygulama kullanımını analiz edin
          </p>
        </div>
      </div>

      {activityData && (
        <>
          {/* Aktivite İstatistikleri */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Çevrimiçi Kullanıcı</CardTitle>
                <Activity className="h-4 w-4 text-green-500 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activityData.stats?.onlineUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Şu anda aktif</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Günlük Aktif</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activityData.stats?.dailyActiveUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activityData.stats?.dailyActiveUsersChange} dünden
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ortalama Oturum</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activityData.stats?.averageSessionDuration}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activityData.stats?.sessionDurationChange} artış
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activityData.stats?.engagementRate}%
                </div>
                <p className="text-xs text-muted-foreground">Günlük geri dönüş</p>
              </CardContent>
            </Card>
          </div>

          {/* Cihaz Dağılımı */}
          <Card>
            <CardHeader>
              <CardTitle>Cihaz Kullanımı</CardTitle>
              <CardDescription>
                Kullanıcıların tercih ettiği cihaz türleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityData?.deviceStats?.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {stat.device === "Mobile" && <Smartphone className="h-4 w-4" />}
                      {stat.device === "Desktop" && <Monitor className="h-4 w-4" />}
                      {stat.device === "Tablet" && <Monitor className="h-4 w-4" />}
                      <span className="font-medium">{stat.device}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground">
                        {stat.count.toLocaleString()}
                      </span>
                      <Badge variant="outline">{stat.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Son Aktiviteler */}
          <Card>
            <CardHeader>
              <CardTitle>Son Kullanıcı Aktiviteleri</CardTitle>
              <CardDescription>
                Kullanıcıların son oturum bilgileri ve eylemleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Kullanıcı, cihaz, konum veya eylem ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Zaman filtresi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Son 1 saat</SelectItem>
                    <SelectItem value="24h">Son 24 saat</SelectItem>
                    <SelectItem value="7d">Son 7 gün</SelectItem>
                    <SelectItem value="30d">Son 30 gün</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={deviceFilter} onValueChange={handleDeviceFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Cihaz filtresi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Cihazlar</SelectItem>
                    <SelectItem value="mobile">Mobil</SelectItem>
                    <SelectItem value="desktop">Masaüstü</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sonuç sayısı */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {totalItems} sonuçtan {startIndex + 1}-{Math.min(endIndex, totalItems)} arası gösteriliyor
                </p>
                <p className="text-sm text-muted-foreground">
                  Sayfa {currentPage} / {totalPages}
                </p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Son Görülme</TableHead>
                    <TableHead>Oturum Süresi</TableHead>
                    <TableHead>Cihaz</TableHead>
                    <TableHead>Konum</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Son Eylemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentActivities?.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.username}</TableCell>
                      <TableCell>{activity.lastSeen}</TableCell>
                      <TableCell>{activity.sessionDuration}</TableCell>
                      <TableCell>{activity.device}</TableCell>
                      <TableCell>{activity.location}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            activity.status === "online" ? "default" :
                              activity.status === "away" ? "secondary" : "outline"
                          }
                          className={
                            activity.status === "online" ? "bg-green-500 dark:bg-green-600" :
                              activity.status === "away" ? "bg-yellow-500 dark:bg-yellow-600" : ""
                          }
                        >
                          {activity.status === "online" ? "Çevrimiçi" :
                            activity.status === "away" ? "Uzakta" : "Çevrimdışı"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {activity.actions.slice(0, 2)?.map((action, index) => (
                            <div key={index} className="text-xs text-muted-foreground">
                              • {action}
                            </div>
                          ))}
                          {activity.actions.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{activity.actions.length - 2} daha...
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Önceki
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Sonraki
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      const newItemsPerPage = parseInt(value)
                      setItemsPerPage(newItemsPerPage)
                      const newTotalPages = Math.ceil(totalItems / newItemsPerPage)
                      setCurrentPage(prev => Math.min(prev, newTotalPages))
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 / sayfa</SelectItem>
                      <SelectItem value="10">10 / sayfa</SelectItem>
                      <SelectItem value="20">20 / sayfa</SelectItem>
                      <SelectItem value="50">50 / sayfa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {filteredAndSearchedActivities.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchQuery ?
                      `"${searchQuery}" araması için sonuç bulunamadı` :
                      "Seçilen filtrelerle eşleşen aktivite bulunamadı"
                    }
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      Aramayı Temizle
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aktivite Öngörüleri */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivite Öngörüleri</CardTitle>
              <CardDescription>
                Kullanıcı davranış analizine dayalı öngörüler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityData.insights?.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${insight.color === 'blue' ? 'bg-blue-50 dark:bg-blue-950/20' :
                      insight.color === 'green' ? 'bg-green-50 dark:bg-green-950/20' :
                        insight.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-950/20' :
                          'bg-red-50 dark:bg-red-950/20'
                      }`}
                  >
                    <h4 className={`font-medium ${insight.color === 'blue' ? 'text-blue-800 dark:text-blue-200' :
                      insight.color === 'green' ? 'text-green-800 dark:text-green-200' :
                        insight.color === 'yellow' ? 'text-yellow-800 dark:text-yellow-200' :
                          'text-red-800 dark:text-red-200'
                      }`}>
                      {insight.title}
                    </h4>
                    <p className={`text-sm mt-1 ${insight.color === 'blue' ? 'text-blue-700 dark:text-blue-300' :
                      insight.color === 'green' ? 'text-green-700 dark:text-green-300' :
                        insight.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-300' :
                          'text-red-700 dark:text-red-300'
                      }`}>
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
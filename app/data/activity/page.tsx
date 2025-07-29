"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Users, Clock, TrendingUp, Smartphone, Monitor, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { ActivityService } from "@/lib/services/data-activity.service"
import { useDataActivity } from "@/hooks/use-api"
import { ActivityAnalytics, ActivityFilters } from "@/types/api"

export default function ActivityPage() {
  const [timeFilter, setTimeFilter] = useState("24h")
  const [deviceFilter, setDeviceFilter] = useState("all")
  const [activityData, setActivityData] = useState<ActivityAnalytics | null>(null)

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

  // Filtrelenmiş aktiviteler
  const filteredActivities = activityData?.recentActivities 
    ? ActivityService.filterByDevice(
        ActivityService.filterByTimeRange(activityData.recentActivities, timeFilter),
        deviceFilter
      )
    : []

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
              <div className="flex items-center space-x-2 mb-4">
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
                  {filteredActivities?.map((activity) => (
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

              {filteredActivities.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Seçilen filtrelerle eşleşen aktivite bulunamadı
                  </p>
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
                    className={`p-4 border rounded-lg ${
                      insight.color === 'blue' ? 'bg-blue-50 dark:bg-blue-950/20' :
                      insight.color === 'green' ? 'bg-green-50 dark:bg-green-950/20' :
                      insight.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-950/20' :
                      'bg-red-50 dark:bg-red-950/20'
                    }`}
                  >
                    <h4 className={`font-medium ${
                      insight.color === 'blue' ? 'text-blue-800 dark:text-blue-200' :
                      insight.color === 'green' ? 'text-green-800 dark:text-green-200' :
                      insight.color === 'yellow' ? 'text-yellow-800 dark:text-yellow-200' :
                      'text-red-800 dark:text-red-200'
                    }`}>
                      {insight.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      insight.color === 'blue' ? 'text-blue-700 dark:text-blue-300' :
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
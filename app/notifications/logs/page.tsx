"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, CheckCircle, XCircle, Clock, Users, TrendingUp, Search, Calendar, Eye, RefreshCw } from "lucide-react"
import { useNotificationLogs, useNotificationLogAnalytics, useNotificationLogStats } from "@/hooks/use-api"

export default function NotificationLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  // API Hooks
  const { 
    data: logsData, 
    isLoading: isLogsLoading,
    refetch: refetchLogs 
  } = useNotificationLogs({
    page: 1,
    limit: 50,
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined
  })

  const { 
    data: analytics, 
    isLoading: isAnalyticsLoading 
  } = useNotificationLogAnalytics()

  const { 
    data: stats, 
    isLoading: isStatsLoading 
  } = useNotificationLogStats()

  const notificationLogs = logsData?.data || []
  const filteredLogs = notificationLogs

  const calculateOpenRate = (opened: number, delivered: number) => {
    return delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : "0.0"
  }

  const calculateClickRate = (clicked: number, opened: number) => {
    return opened > 0 ? ((clicked / opened) * 100).toFixed(1) : "0.0"
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bildirim Logları</h2>
          <p className="text-muted-foreground">
            Gönderilen tüm bildirimlerin detaylı raporları ve istatistikleri
          </p>
        </div>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün Gönderilen</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded mt-2"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.today?.sent?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">{notificationLogs.length} kampanya</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teslim Oranı</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isAnalyticsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded mt-2"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{analytics?.deliveryRate?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.totalDelivered?.toLocaleString() || 0} / {analytics?.totalSent?.toLocaleString() || 0}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Açılma Oranı</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isAnalyticsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded mt-2"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{analytics?.openRate?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.totalRead?.toLocaleString() || 0} açıldı
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tıklama Oranı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isAnalyticsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded mt-2"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{analytics?.clickRate?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.totalClicked?.toLocaleString() || 0} tıklandı
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Kampanya Performansı */}
      <Card>
        <CardHeader>
          <CardTitle>En İyi Performans Gösteren Kampanyalar</CardTitle>
          <CardDescription>
            Açılma ve tıklama oranlarına göre en başarılı kampanyalar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAnalyticsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-pulse w-6 h-6 bg-muted rounded-full"></div>
                    <div>
                      <div className="animate-pulse h-4 bg-muted rounded w-32 mb-1"></div>
                      <div className="animate-pulse h-3 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="animate-pulse h-4 bg-muted rounded w-20 mb-1"></div>
                    <div className="animate-pulse h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : analytics?.topPerformingCampaigns && analytics.topPerformingCampaigns.length > 0 ? (
            <div className="space-y-4">
              {analytics.topPerformingCampaigns.map((campaign: any, index: any) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? "bg-yellow-500 dark:bg-yellow-600" : index === 1 ? "bg-gray-400 dark:bg-gray-500" : "bg-orange-500 dark:bg-orange-600"
                      }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{campaign.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {campaign.totalSent.toLocaleString()} gönderim
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{campaign.openRate.toFixed(1)}% açılma</div>
                    <div className="text-sm text-muted-foreground">
                      {campaign.clickRate.toFixed(1)}% tıklama
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                Henüz kampanya performans verisi bulunmuyor
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bildirim Logları */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bildirim Geçmişi</CardTitle>
              <CardDescription>
                Gönderilen tüm bildirimlerin detaylı kayıtları
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchLogs()}
              disabled={isLogsLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLogsLoading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtreler */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Bildirim ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="sending">Gönderiliyor</SelectItem>
                <SelectItem value="failed">Başarısız</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="scheduled">Zamanlanmış</SelectItem>
                <SelectItem value="manual">Manuel</SelectItem>
                <SelectItem value="trigger">Tetikleyici</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tarih" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Zamanlar</SelectItem>
                <SelectItem value="today">Bugün</SelectItem>
                <SelectItem value="week">Bu Hafta</SelectItem>
                <SelectItem value="month">Bu Ay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bildirim</TableHead>
                <TableHead>Gönderim Zamanı</TableHead>
                <TableHead>Hedef Grup</TableHead>
                <TableHead>Gönderilen</TableHead>
                <TableHead>Teslim Edilen</TableHead>
                <TableHead>Açılan</TableHead>
                <TableHead>Tıklanan</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tür</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLogsLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-24"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-20 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-16"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-16"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-16 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-12"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-16 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-12"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-16 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-12"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-6 bg-muted rounded w-16"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-muted-foreground">
                      Henüz bildirim logu bulunmuyor
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.title}</div>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {log.content}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(log.sentAt).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.targetGroup}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.totalSent.toLocaleString()} kullanıcı
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{log.totalSent.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.delivered.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {((log.delivered / log.totalSent) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.opened.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {calculateOpenRate(log.opened, log.delivered)}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.clicked.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {calculateClickRate(log.clicked, log.opened)}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.status === "completed" ? "default" :
                          log.status === "sending" ? "secondary" : "destructive"
                      }
                      className={
                        log.status === "completed" ? "bg-green-500 dark:bg-green-600" :
                          log.status === "sending" ? "bg-blue-500 dark:bg-blue-600" : ""
                      }
                    >
                      {log.status === "completed" ? "Tamamlandı" :
                        log.status === "sending" ? "Gönderiliyor" : "Başarısız"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {log.type === "scheduled" ? "Zamanlanmış" :
                        log.type === "manual" ? "Manuel" :
                          log.type === "trigger" ? "Tetikleyici" : log.type}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performans Öngörüleri */}
      <Card>
        <CardHeader>
          <CardTitle>Performans Öngörüleri</CardTitle>
          <CardDescription>
            Bildirim verilerine dayalı analiz ve öneriler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-800 dark:text-green-200">Yüksek Etkileşim</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Milestone kutlama bildirimleri %74 açılma oranına sahip. Bu tür kişiselleştirilmiş mesajlar artırılabilir.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Optimal Zamanlama</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Sabah 09:00 ve akşam 21:00 saatlerinde gönderilen bildirimler en yüksek açılma oranına sahip.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">İçerik Optimizasyonu</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Emoji içeren başlıklar %15 daha fazla açılıyor. Motivasyonel içerikler daha yüksek tıklama oranına sahip.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Clock, Users, Play, Pause, Trash2, Edit, Bell, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import {
  useScheduledNotifications,
  useScheduledNotificationAnalytics,
  useUpcomingNotifications,
  useNotificationTimeSuggestions,
  useUpdateScheduledNotification,
  useDeleteScheduledNotification
} from "@/hooks/use-api"

export default function ScheduledNotificationsPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [frequencyFilter, setFrequencyFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // API Hooks
  const { 
    data: notificationsResponse, 
    isLoading: isNotificationsLoading, 
    isError: isNotificationsError, 
    error: notificationsError,
    refetch: refetchNotifications 
  } = useScheduledNotifications({
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    frequency: frequencyFilter !== 'all' ? frequencyFilter : undefined
  })

  const { 
    data: analytics, 
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics 
  } = useScheduledNotificationAnalytics()

  const { 
    data: upcomingNotifications, 
    isLoading: isUpcomingLoading,
    refetch: refetchUpcoming 
  } = useUpcomingNotifications({ hours: 24, limit: 3 })

  const { 
    data: timeSuggestions, 
    isLoading: isSuggestionsLoading 
  } = useNotificationTimeSuggestions()

  const updateNotificationMutation = useUpdateScheduledNotification()
  const deleteNotificationMutation = useDeleteScheduledNotification()

  const handleRefresh = () => {
    refetchNotifications()
    refetchAnalytics()
    refetchUpcoming()
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active'
      await updateNotificationMutation.mutateAsync({ 
        id, 
        data: { status: newStatus } 
      })
      toast.success(`Bildirim ${newStatus === 'active' ? 'aktif edildi' : 'duraklatıldı'}`)
    } catch (error) {
      toast.error('Durum güncellenirken hata oluştu')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu zamanlanmış bildirimi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await deleteNotificationMutation.mutateAsync(id)
      toast.success('Zamanlanmış bildirim silindi')
    } catch (error) {
      toast.error('Silme işlemi sırasında hata oluştu')
    }
  }

  const notifications = notificationsResponse?.data || []
  const pagination = notificationsResponse?.pagination || { total: 0, page: 1, pages: 1, limit: itemsPerPage }
  
  const isLoading = isNotificationsLoading || updateNotificationMutation.isPending || deleteNotificationMutation.isPending

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500 dark:bg-green-600"
      case "paused": return "bg-yellow-500 dark:bg-yellow-600"
      case "completed": return "bg-blue-500 dark:bg-blue-600"
      default: return ""
    }
  }

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "daily": return "Günlük"
      case "weekly": return "Haftalık"
      case "monthly": return "Aylık"
      case "once": return "Tek Seferlik"
      case "trigger": return "Tetikleyici"
      default: return frequency
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Zamanlanmış Bildirimler</h2>
          <p className="text-muted-foreground">
            Otomatik bildirim kampanyalarını yönetin ve takip edin
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
          <Dialog>
            <DialogTrigger asChild>
              <Button disabled={isLoading}>
                <Bell className="mr-2 h-4 w-4" />
                Yeni Zamanlama
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Zamanlanmış Bildirim</DialogTitle>
                <DialogDescription>
                  Otomatik gönderilecek bir bildirim oluşturun
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Bu özellik yakında eklenecek...
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {(isNotificationsError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {notificationsError?.message || 'Veri yüklenirken hata oluştu'}
        </div>
      )}

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Zamanlama</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isAnalyticsLoading ? "-" : analytics?.activeScheduled || 0}
            </div>
            <p className="text-xs text-muted-foreground">Çalışan kampanya</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün Gönderilecek</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isAnalyticsLoading ? "-" : analytics?.todayScheduled || 0}
            </div>
            <p className="text-xs text-muted-foreground">Bildirim planlandı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Hedef</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isAnalyticsLoading ? "-" : `${Math.round((analytics?.totalTargetUsers || 0) / 1000)}K`}
            </div>
            <p className="text-xs text-muted-foreground">Kullanıcı erişimi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Hafta Gönderilen</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isAnalyticsLoading ? "-" : analytics?.weeklyDelivered || 0}
            </div>
            <p className="text-xs text-muted-foreground">Otomatik bildirim</p>
          </CardContent>
        </Card>
      </div>

      {/* Zamanlanmış Bildirimler */}
      <Card>
        <CardHeader>
          <CardTitle>Zamanlanmış Kampanyalar</CardTitle>
          <CardDescription>
            Tüm otomatik bildirim kampanyalarının listesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtreler */}
          <div className="flex items-center space-x-2 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="paused">Duraklatılmış</SelectItem>
                <SelectItem value="completed">Tamamlanmış</SelectItem>
              </SelectContent>
            </Select>

            <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sıklık" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Sıklıklar</SelectItem>
                <SelectItem value="daily">Günlük</SelectItem>
                <SelectItem value="weekly">Haftalık</SelectItem>
                <SelectItem value="monthly">Aylık</SelectItem>
                <SelectItem value="once">Tek Seferlik</SelectItem>
                <SelectItem value="trigger">Tetikleyici</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Zamanlanmış Saat</TableHead>
                <TableHead>Hedef Grup</TableHead>
                <TableHead>Sıklık</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Son Çalışma</TableHead>
                <TableHead>Oluşturan</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isNotificationsLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : notifications && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {notification.message}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(notification.scheduledAt).toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{notification.targetGroup}</div>
                        <div className="text-sm text-muted-foreground">
                          {notification.targetCount?.toLocaleString() || 0} kullanıcı
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getFrequencyText(notification.frequency)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={notification.status === "active" ? "default" : "secondary"}
                        className={getStatusColor(notification.status)}
                      >
                        {notification.status === "active" ? "Aktif" :
                          notification.status === "paused" ? "Duraklatılmış" :
                            "Tamamlanmış"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {notification.lastRun ?
                          new Date(notification.lastRun).toLocaleString('tr-TR') :
                          "Henüz çalışmadı"
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{notification.createdBy || 'admin'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title={notification.status === "active" ? "Duraklat" : "Başlat"}
                          onClick={() => handleToggleStatus(notification.id, notification.status)}
                          disabled={isLoading}
                        >
                          {notification.status === "active" ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" title="Düzenle" disabled={isLoading}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Sil" 
                          className="text-red-600"
                          onClick={() => handleDelete(notification.id)}
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
                    Henüz zamanlanmış bildirim bulunmuyor
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

      {/* Yaklaşan Bildirimler */}
      <Card>
        <CardHeader>
          <CardTitle>Yaklaşan Bildirimler</CardTitle>
          <CardDescription>
            Önümüzdeki 24 saat içinde gönderilecek bildirimler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isUpcomingLoading ? (
              <div className="text-center text-muted-foreground py-4">
                Yükleniyor...
              </div>
            ) : upcomingNotifications && upcomingNotifications.length > 0 ? (
              upcomingNotifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {notification.targetGroup} • {notification.targetCount.toLocaleString()} kullanıcı
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {new Date(notification.scheduledAt).toLocaleString('tr-TR')}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {getFrequencyText(notification.frequency)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {notification.timeUntil}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Yaklaşan bildirim bulunmuyor
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Zamanlama Önerileri */}
      <Card>
        <CardHeader>
          <CardTitle>Zamanlama Önerileri</CardTitle>
          <CardDescription>
            Kullanıcı aktivite verilerine dayalı öneriler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isSuggestionsLoading ? (
              <div className="text-center text-muted-foreground py-4">
                Yükleniyor...
              </div>
            ) : timeSuggestions && timeSuggestions.length > 0 ? (
              timeSuggestions.slice(0, 3).map((suggestion, index) => (
                <div 
                  key={suggestion.hour} 
                  className={`p-4 border rounded-lg ${
                    suggestion.recommendation === 'high' ? 'bg-green-50 dark:bg-green-950/20' :
                    suggestion.recommendation === 'medium' ? 'bg-blue-50 dark:bg-blue-950/20' :
                    'bg-yellow-50 dark:bg-yellow-950/20'
                  }`}
                >
                  <h4 className={`font-medium ${
                    suggestion.recommendation === 'high' ? 'text-green-800 dark:text-green-200' :
                    suggestion.recommendation === 'medium' ? 'text-blue-800 dark:text-blue-200' :
                    'text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {String(suggestion.hour).padStart(2, '0')}:00 - {suggestion.description}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    suggestion.recommendation === 'high' ? 'text-green-700 dark:text-green-300' :
                    suggestion.recommendation === 'medium' ? 'text-blue-700 dark:text-blue-300' :
                    'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    Açılma oranı: %{suggestion.openRate} • Tıklama oranı: %{suggestion.clickRate} • 
                    Kullanıcı aktivitesi: %{suggestion.userActivity}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Öneri verisi yüklenemedi
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
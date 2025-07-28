'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, AlertTriangle, DollarSign, Target, Shield, Bell } from "lucide-react"
import { useDashboardStats, useRecentActivities, useSystemStatus, useMonthlyStats } from "@/hooks/use-api"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats()
  const { data: activities, isLoading: activitiesLoading } = useRecentActivities()
  const { data: systemStatus, isLoading: systemLoading } = useSystemStatus()
  const { data: monthlyStats, isLoading: monthlyLoading } = useMonthlyStats()
  const router = useRouter()

  const isLoading = statsLoading
  const error = statsError

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Veri Yüklenemedi</h3>
            <p className="text-muted-foreground">Dashboard verileri yüklenirken bir hata oluştu.</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">NoFap Admin Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            Son Güncelleme: {new Date().toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Badge>
        </div>
      </div>

      {/* Ana İstatistikler */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.users.total?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  Aktif: {stats?.users.active || 0}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Kullanıcı</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.users.premium?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  Premium aboneler
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Mesaj</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.messages?.total?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  Bekleyen: {stats?.messages?.pending || 0}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Görevler</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.tasks.active?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  Tamamlanan: {stats?.tasks.completed || 0}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detaylı Kartlar */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
            <CardDescription>
              Sistemdeki son kullanıcı aktiviteleri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activitiesLoading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              activities?.map((activity) => {
                const colorClasses = {
                  green: 'bg-green-500 dark:bg-green-400',
                  blue: 'bg-blue-500 dark:bg-blue-400',
                  yellow: 'bg-yellow-500 dark:bg-yellow-400',
                  purple: 'bg-purple-500 dark:bg-purple-400'
                }

                return (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${colorClasses[activity.color]}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.details}</p>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Hızlı Eylemler</CardTitle>
            <CardDescription>
              Sık kullanılan yönetim işlemleri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div 
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => router.push('/notifications/send')}
            >
              <div className="flex items-center space-x-3">
                <Bell className="h-4 w-4" />
                <span className="text-sm">Toplu Bildirim Gönder</span>
              </div>
            </div>
            <div 
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => router.push('/users')}
            >
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4" />
                <span className="text-sm">Kullanıcı Yönetimi</span>
              </div>
            </div>
            <div 
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => router.push('/security/logs')}
            >
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Güvenlik Logları</span>
              </div>
            </div>
            <div 
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => router.push('/dashboard/statistics')}
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Analiz Raporları</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sistem Durumu */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sistem Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Durumu</span>
                    <Badge variant="default" className={`${systemStatus?.api?.status === 'online' ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600'}`}>
                      {systemStatus?.api?.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Veritabanı</span>
                    <Badge variant="default" className={`${systemStatus?.database?.status === 'online' ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600'}`}>
                      {systemStatus?.database?.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bildirim Servisi</span>
                    <Badge variant="default" className={`${systemStatus?.notifications?.status === 'online' ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600'}`}>
                      {systemStatus?.notifications?.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bu Ay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {monthlyLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm">Yeni Kayıtlar</span>
                    <span className="font-medium">{monthlyStats?.newRegistrations?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Premium Dönüşüm</span>
                    <span className="font-medium">{monthlyStats?.premiumConversion || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Ortalama Streak</span>
                    <span className="font-medium">{monthlyStats?.averageStreak || 0} gün</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gelir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {monthlyLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm">Bu Ay</span>
                    <span className="font-medium">${monthlyStats?.totalRevenue?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Reklam Geliri</span>
                    <span className="font-medium">${monthlyStats?.adRevenue?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Premium Geliri</span>
                    <span className="font-medium">${monthlyStats?.premiumRevenue?.toLocaleString() || '0'}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
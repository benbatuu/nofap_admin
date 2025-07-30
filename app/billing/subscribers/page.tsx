"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Crown, Users, DollarSign, TrendingUp, Search, MoreHorizontal, CreditCard, Calendar, RefreshCw } from "lucide-react"
import { useSubscribers, useSubscriberAnalytics } from "@/hooks/use-api"
import { toast } from "sonner"

interface Subscriber {
  id: string
  username: string
  email: string
  avatar?: string
  plan: string
  status: 'active' | 'trial' | 'cancelled' | 'expired'
  startDate: string
  nextBilling: string
  amount: number
  paymentMethod: string
  totalPaid: number
  lastPaymentStatus: string
  country: string
}

interface SubscriberAnalytics {
  overview?: {
    totalSubscribers: number
    activeSubscribers: number
    trialUsers: number
    churnRate: number
    growthRate: number
    conversionRate: number
  }
  revenue?: {
    totalRevenue: number
    monthlyRevenue: number
    averageRevenuePerUser: number
  }
  planDistribution?: Array<{
    plan: string
    count: number
    revenue: number
  }>
  insights?: {
    activeRate: number
    trialConversionRate: number
    yearlyPlanPreference: number
  }
}



export default function SubscribersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPage(1) // Reset to first page when searching
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [statusFilter, planFilter])

  // API Hooks
  const {
    data: subscribersData,
    isLoading: isSubscribersLoading,
    error: subscribersError,
    refetch: refetchSubscribers
  } = useSubscribers({
    page,
    limit,
    search: debouncedSearchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    plan: planFilter === "all" ? undefined : planFilter
  })

  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    error: analyticsError
  } = useSubscriberAnalytics()

  const subscribers: Subscriber[] = subscribersData?.data?.subscribers || []
  const pagination = subscribersData?.data?.pagination || { total: 0, page: 1, totalPages: 1 }
  const analytics: SubscriberAnalytics = analyticsData?.data || {}

  // Handle errors
  useEffect(() => {
    if (subscribersError) {
      toast.error('Abone verileri yüklenirken hata oluştu')
    }
    if (analyticsError) {
      toast.error('Analytics verileri yüklenirken hata oluştu')
    }
  }, [subscribersError, analyticsError])

  // Memoized subscription stats
  const subscriptionStats = useMemo(() =>
    analytics.planDistribution || [
      { plan: "Premium Aylık", count: 0, revenue: 0 },
      { plan: "Premium Yıllık", count: 0, revenue: 0 },
      { plan: "Deneme", count: 0, revenue: 0 }
    ], [analytics.planDistribution])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Aboneler</h2>
          <p className="text-muted-foreground">
            Premium aboneleri yönetin ve abonelik durumlarını takip edin
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              await refetchSubscribers()
              toast.success('Veriler başarıyla yenilendi')
            } catch (error) {
              toast.error('Veriler yenilenirken hata oluştu')
            }
          }}
          disabled={isSubscribersLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSubscribersLoading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Abone</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isAnalyticsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded mt-2"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{analytics.overview?.totalSubscribers?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.overview?.growthRate ?
                    `${analytics.overview.growthRate > 0 ? '+' : ''}${analytics.overview.growthRate.toFixed(1)}% bu ay` :
                    'Bu ay'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Abonelik</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isAnalyticsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded mt-2"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{analytics.overview?.activeSubscribers?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.overview?.conversionRate ? `${analytics.overview.conversionRate}% dönüşüm oranı` : 'Aktif aboneler'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aylık Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isAnalyticsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded mt-2"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">${analytics.revenue?.monthlyRevenue?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  ARPU: ${analytics.revenue?.averageRevenuePerUser?.toFixed(2) || 0}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Oranı</CardTitle>
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
                <div className="text-2xl font-bold">{analytics.overview?.churnRate?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.overview?.trialUsers ? `${analytics.overview.trialUsers} deneme kullanıcısı` : 'Aylık churn'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Dağılımı */}
      <Card>
        <CardHeader>
          <CardTitle>Abonelik Plan Dağılımı</CardTitle>
          <CardDescription>
            Plan türlerine göre abone sayısı ve gelir
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAnalyticsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptionStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Crown className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                    <div>
                      <div className="font-medium">{stat.plan}</div>
                      <div className="text-sm text-muted-foreground">{stat.count.toLocaleString()} abone</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${stat.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Aylık gelir</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Abone Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Abone Listesi</CardTitle>
          <CardDescription>
            Tüm premium abonelerin detaylı bilgileri
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtreler */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı ara..."
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
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="trial">Deneme</SelectItem>
                <SelectItem value="cancelled">İptal Edilmiş</SelectItem>
                <SelectItem value="expired">Süresi Dolmuş</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Planlar</SelectItem>
                <SelectItem value="NoFap Premium">Premium Aylık</SelectItem>
                <SelectItem value="NoFap Premium Yıllık">Premium Yıllık</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Başlangıç</TableHead>
                <TableHead>Sonraki Ödeme</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Ödeme Yöntemi</TableHead>
                <TableHead>Toplam Ödenen</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isSubscribersLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-32"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-6 bg-muted rounded w-16"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-20"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-20"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-16"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-24"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-16"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-6 bg-muted rounded w-8"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {debouncedSearchTerm || statusFilter !== "all" || planFilter !== "all"
                        ? "Arama kriterlerinize uygun abone bulunamadı"
                        : "Henüz abone bulunmuyor"}
                    </div>
                    {(debouncedSearchTerm || statusFilter !== "all" || planFilter !== "all") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setSearchTerm("")
                          setDebouncedSearchTerm("")
                          setStatusFilter("all")
                          setPlanFilter("all")
                        }}
                      >
                        Filtreleri Temizle
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((subscriber: Subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscriber.username}</div>
                        <div className="text-sm text-muted-foreground">{subscriber.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {subscriber.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          subscriber.status === "active" ? "default" :
                            subscriber.status === "trial" ? "secondary" :
                              subscriber.status === "cancelled" ? "destructive" : "outline"
                        }
                        className={
                          subscriber.status === "active" ? "bg-green-500 dark:bg-green-600" :
                            subscriber.status === "trial" ? "bg-blue-500 dark:bg-blue-600" : ""
                        }
                      >
                        {subscriber.status === "active" ? "Aktif" :
                          subscriber.status === "trial" ? "Deneme" :
                            subscriber.status === "cancelled" ? "İptal" : "Diğer"}
                      </Badge>
                    </TableCell>
                    <TableCell>{subscriber.startDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{subscriber.nextBilling}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${subscriber.amount}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <CreditCard className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{subscriber.paymentMethod}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${subscriber.totalPaid}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Toplam {pagination.total} kayıt, sayfa {pagination.page} / {pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1 || isSubscribersLoading}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages || isSubscribersLoading}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Abone Öngörüleri */}
      <Card>
        <CardHeader>
          <CardTitle>Abone Öngörüleri</CardTitle>
          <CardDescription>
            Abonelik verilerine dayalı analiz ve öneriler
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAnalyticsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <h4 className="font-medium text-green-800 dark:text-green-200">Yüksek Sadakat</h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Yıllık plan tercihi %{analytics.insights?.yearlyPlanPreference || 0}.
                  {analytics.insights?.yearlyPlanPreference && analytics.insights.yearlyPlanPreference > 20
                    ? " Yıllık plana geçiş teşvik edilmeli."
                    : " Yıllık plan avantajları vurgulanabilir."}
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Deneme Dönüşümü</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Deneme kullanıcılarının %{analytics.insights?.trialConversionRate || 0}&apos;i premium&apos;a geçiyor.
                  {analytics.insights?.trialConversionRate && analytics.insights.trialConversionRate > 70
                    ? " Mükemmel dönüşüm oranı!"
                    : " Deneme süresi optimize edilebilir."}
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Aktiflik Oranı</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Abonelerin %{analytics.insights?.activeRate || 0}&apos;i aktif kullanıcı.
                  {analytics.insights?.activeRate && analytics.insights.activeRate < 70
                    ? " Kullanıcı etkileşimini artırmak için özel kampanya düzenlenebilir."
                    : " Harika bir aktiflik oranı!"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
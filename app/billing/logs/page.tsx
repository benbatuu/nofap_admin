/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, CreditCard, AlertCircle, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Search, RefreshCw } from "lucide-react"
import { useBillingLogs, useBillingAnalytics, useBillingAnalyze } from "@/hooks/use-api"
import { toast } from "sonner"

interface BillingLog {
  id: string
  userId: string
  userName: string
  amount: number
  currency: string
  status: 'success' | 'failed' | 'pending'
  paymentMethod: string
  description: string
  createdAt: string
  user?: {
    id: string
    name: string
    email: string
    avatar?: string
    isPremium: boolean
  }
}

interface Analytics {
  overview?: {
    totalTransactions: number
    successfulTransactions: number
    failedTransactions: number
    pendingTransactions: number
    totalRevenue: number
    successRate: number
    failureRate: number
    pendingRate: number
  }
  today?: {
    transactions: number
    revenue: number
    successfulTransactions: number
    failedTransactions: number
    pendingTransactions: number
  }
}

interface Analysis {
  issues?: Array<{
    type: string
    severity: 'high' | 'medium' | 'low'
    title: string
    description: string
    suggestion?: string
  }>
  opportunities?: Array<{
    type: string
    title: string
    description: string
    expectedGain?: string
  }>
}



export default function BillingLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
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
  }, [statusFilter, dateFilter])

  // API Hooks
  const {
    data: billingLogsData,
    isLoading: isLogsLoading,
    error: logsError,
    refetch: refetchLogs
  } = useBillingLogs({
    page,
    limit,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: debouncedSearchTerm || undefined,
    // Date filter implementation
    dateFrom: dateFilter === "today" ? new Date().toISOString().split('T')[0] :
      dateFilter === "week" ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
        dateFilter === "month" ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
          undefined,
    dateTo: dateFilter === "today" ? new Date().toISOString().split('T')[0] : undefined
  })

  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    error: analyticsError
  } = useBillingAnalytics({ days: 30, period: 'month' })

  const {
    data: analyzeData,
    isLoading: isAnalyzeLoading,
    error: analyzeError
  } = useBillingAnalyze()

  // Handle errors
  useEffect(() => {
    if (logsError) {
      toast.error('Ödeme logları yüklenirken hata oluştu')
    }
    if (analyticsError) {
      toast.error('Analytics verileri yüklenirken hata oluştu')
    }
    if (analyzeError) {
      toast.error('Analiz verileri yüklenirken hata oluştu')
    }
  }, [logsError, analyticsError, analyzeError])

  const billingLogs: BillingLog[] = billingLogsData?.data?.billingLogs || []
  const pagination = billingLogsData?.data?.pagination || { total: 0, page: 1, totalPages: 1 }
  const analytics: Analytics = analyticsData?.data || {}
  const analysis: Analysis = analyzeData?.data || {}

  // Calculate payment stats from analytics
  const paymentStats = useMemo(() => [
    {
      status: "Başarılı",
      count: analytics.overview?.successfulTransactions || 0,
      percentage: analytics.overview?.successRate || 0,
      color: "green"
    },
    {
      status: "Başarısız",
      count: analytics.overview?.failedTransactions || 0,
      percentage: analytics.overview?.failureRate || 0,
      color: "red"
    },
    {
      status: "Beklemede",
      count: analytics.overview?.pendingTransactions || 0,
      percentage: analytics.overview?.pendingRate || 0,
      color: "yellow"
    }
  ], [analytics.overview])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ödeme Logları</h2>
          <p className="text-muted-foreground">
            Tüm ödeme işlemlerini ve faturalandırma loglarını takip edin
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              await refetchLogs()
              toast.success('Veriler başarıyla yenilendi')
            } catch (error) {
              toast.error('Veriler yenilenirken hata oluştu')
            }
          }}
          disabled={isLogsLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLogsLoading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü İşlemler</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isAnalyticsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded mt-2"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{analytics.today?.transactions?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">Bugün</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
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
                <div className="text-2xl font-bold">${analytics.today?.revenue?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">Bugün</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarı Oranı</CardTitle>
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
                <div className="text-2xl font-bold">{analytics.overview?.successRate?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground">Genel oran</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen İşlem</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isAnalyticsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded mt-2"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{analytics.today?.pendingTransactions?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">Manuel onay bekliyor</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ödeme Durumu Dağılımı */}
      <Card>
        <CardHeader>
          <CardTitle>Ödeme Durumu Dağılımı</CardTitle>
          <CardDescription>
            İşlem durumlarına göre dağılım
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
              {paymentStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {stat.color === "green" && <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />}
                    {stat.color === "red" && <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />}
                    {stat.color === "yellow" && <Clock className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />}
                    <div>
                      <div className="font-medium">{stat.status}</div>
                      <div className="text-sm text-muted-foreground">{stat.count.toLocaleString()} işlem</div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      stat.color === "green" ? "border-green-500 text-green-700 dark:border-green-400 dark:text-green-300" :
                        stat.color === "red" ? "border-red-500 text-red-700 dark:border-red-400 dark:text-red-300" :
                          "border-yellow-500 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300"
                    }
                  >
                    {stat.percentage.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* İşlem Logları */}
      <Card>
        <CardHeader>
          <CardTitle>İşlem Logları</CardTitle>
          <CardDescription>
            Tüm ödeme işlemlerinin detaylı kayıtları
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtreler */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="İşlem ara..."
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
                <SelectItem value="success">Başarılı</SelectItem>
                <SelectItem value="failed">Başarısız</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="subscription">Abonelik</SelectItem>
                <SelectItem value="refund">İade</SelectItem>
                <SelectItem value="chargeback">Ters İbraz</SelectItem>
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
                <TableHead>İşlem ID</TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Ödeme Yöntemi</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Açıklama</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLogsLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-32"></div>
                      </div>
                    </TableCell>
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
                        <div className="h-6 bg-muted rounded w-16"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-32"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-40"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : billingLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {debouncedSearchTerm || statusFilter !== "all" || dateFilter !== "all"
                        ? "Arama kriterlerinize uygun ödeme logu bulunamadı"
                        : "Henüz ödeme logu bulunmuyor"}
                    </div>
                    {(debouncedSearchTerm || statusFilter !== "all" || dateFilter !== "all") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setSearchTerm("")
                          setDebouncedSearchTerm("")
                          setStatusFilter("all")
                          setDateFilter("all")
                        }}
                      >
                        Filtreleri Temizle
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                billingLogs.map((log: BillingLog) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {log.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.userName}</div>
                        <div className="text-sm text-muted-foreground">{log.user?.email || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        Ödeme
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.status === "success" ? "default" :
                            log.status === "failed" ? "destructive" :
                              log.status === "pending" ? "secondary" : "outline"
                        }
                        className={
                          log.status === "success" ? "bg-green-500 dark:bg-green-600" :
                            log.status === "pending" ? "bg-yellow-500 dark:bg-yellow-600" : ""
                        }
                      >
                        {log.status === "success" ? "Başarılı" :
                          log.status === "failed" ? "Başarısız" :
                            log.status === "pending" ? "Beklemede" : "Diğer"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${log.amount < 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                        {log.amount < 0 ? "-" : ""}${Math.abs(log.amount)} {log.currency}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <CreditCard className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{log.paymentMethod}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Sistem</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{new Date(log.createdAt).toLocaleString('tr-TR')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-muted-foreground truncate">
                        {log.description}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
                  disabled={page <= 1 || isLogsLoading}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages || isLogsLoading}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ödeme Analizi */}
      <Card>
        <CardHeader>
          <CardTitle>Ödeme Analizi</CardTitle>
          <CardDescription>
            Ödeme verilerine dayalı öngörüler ve öneriler
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAnalyzeLoading ? (
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
              {analysis.issues?.map((issue: any, index: number) => (
                <div key={index} className={`p-4 border rounded-lg ${issue.severity === 'high' ? 'bg-red-50 dark:bg-red-950/20' :
                  issue.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-950/20' :
                    'bg-blue-50 dark:bg-blue-950/20'
                  }`}>
                  <h4 className={`font-medium ${issue.severity === 'high' ? 'text-red-800 dark:text-red-200' :
                    issue.severity === 'medium' ? 'text-yellow-800 dark:text-yellow-200' :
                      'text-blue-800 dark:text-blue-200'
                    }`}>
                    {issue.title}
                  </h4>
                  <p className={`text-sm mt-1 ${issue.severity === 'high' ? 'text-red-700 dark:text-red-300' :
                    issue.severity === 'medium' ? 'text-yellow-700 dark:text-yellow-300' :
                      'text-blue-700 dark:text-blue-300'
                    }`}>
                    {issue.description}
                  </p>
                  {issue.suggestion && (
                    <p className={`text-xs mt-2 ${issue.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                      issue.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`}>
                      Öneri: {issue.suggestion}
                    </p>
                  )}
                </div>
              )) || (
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-medium text-green-800 dark:text-green-200">Sistem Sağlıklı</h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Ödeme sistemi normal çalışıyor, kritik sorun tespit edilmedi.
                    </p>
                  </div>
                )}

              {analysis.opportunities?.map((opportunity: unknown, index: number) => (
                <div key={index} className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <h4 className="font-medium text-green-800 dark:text-green-200">{opportunity.title}</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {opportunity.description}
                  </p>
                  {opportunity.expectedGain && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Beklenen Fayda: {opportunity.expectedGain}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
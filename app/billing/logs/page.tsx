"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, CreditCard, AlertCircle, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Search } from "lucide-react"

const billingLogs = [
  {
    id: "1",
    transactionId: "txn_1234567890",
    username: "premium_user_1",
    email: "user1@example.com",
    type: "subscription",
    status: "success",
    amount: 9.99,
    currency: "USD",
    paymentMethod: "Visa ****1234",
    timestamp: "2024-01-25 14:30:25",
    description: "NoFap Premium - Aylık abonelik",
    gateway: "Stripe",
    country: "TR"
  },
  {
    id: "2",
    transactionId: "txn_1234567891",
    username: "yearly_subscriber",
    email: "user2@example.com",
    type: "subscription",
    status: "success",
    amount: 95.99,
    currency: "USD",
    paymentMethod: "PayPal",
    timestamp: "2024-01-25 12:15:10",
    description: "NoFap Premium Yıllık - Yıllık abonelik",
    gateway: "PayPal",
    country: "US"
  },
  {
    id: "3",
    transactionId: "txn_1234567892",
    username: "failed_payment",
    email: "user3@example.com",
    type: "subscription",
    status: "failed",
    amount: 9.99,
    currency: "USD",
    paymentMethod: "Visa ****5678",
    timestamp: "2024-01-25 10:45:33",
    description: "NoFap Premium - Aylık abonelik (Yetersiz bakiye)",
    gateway: "Stripe",
    country: "DE"
  },
  {
    id: "4",
    transactionId: "txn_1234567893",
    username: "refund_user",
    email: "user4@example.com",
    type: "refund",
    status: "success",
    amount: -9.99,
    currency: "USD",
    paymentMethod: "Visa ****9012",
    timestamp: "2024-01-25 09:20:15",
    description: "NoFap Premium - İade",
    gateway: "Stripe",
    country: "UK"
  },
  {
    id: "5",
    transactionId: "txn_1234567894",
    username: "pending_user",
    email: "user5@example.com",
    type: "subscription",
    status: "pending",
    amount: 9.99,
    currency: "USD",
    paymentMethod: "Bank Transfer",
    timestamp: "2024-01-25 08:10:42",
    description: "NoFap Premium - Aylık abonelik (Banka transferi bekliyor)",
    gateway: "Manual",
    country: "FR"
  }
]

const paymentStats = [
  { status: "Başarılı", count: 1247, percentage: 89.2, color: "green" },
  { status: "Başarısız", count: 89, percentage: 6.4, color: "red" },
  { status: "Beklemede", count: 45, percentage: 3.2, color: "yellow" },
  { status: "İade", count: 17, percentage: 1.2, color: "blue" }
]

export default function BillingLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const filteredLogs = billingLogs.filter(log => {
    const matchesSearch = log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || log.status === statusFilter
    const matchesType = typeFilter === "all" || log.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ödeme Logları</h2>
          <p className="text-muted-foreground">
            Tüm ödeme işlemlerini ve faturalandırma loglarını takip edin
          </p>
        </div>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü İşlemler</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12% dünden</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,450</div>
            <p className="text-xs text-muted-foreground">Bugün</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarı Oranı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.2%</div>
            <p className="text-xs text-muted-foreground">+2.1% artış</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen İşlem</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Manuel onay bekliyor</p>
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
          <div className="space-y-4">
            {paymentStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {stat.color === "green" && <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />}
                  {stat.color === "red" && <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />}
                  {stat.color === "yellow" && <Clock className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />}
                  {stat.color === "blue" && <AlertCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />}
                  <div>
                    <div className="font-medium">{stat.status}</div>
                    <div className="text-sm text-muted-foreground">{stat.count} işlem</div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    stat.color === "green" ? "border-green-500 text-green-700 dark:border-green-400 dark:text-green-300" :
                      stat.color === "red" ? "border-red-500 text-red-700 dark:border-red-400 dark:text-red-300" :
                        stat.color === "yellow" ? "border-yellow-500 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300" :
                          "border-blue-500 text-blue-700 dark:border-blue-400 dark:text-blue-300"
                  }
                >
                  {stat.percentage}%
                </Badge>
              </div>
            ))}
          </div>
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
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {log.transactionId}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.username}</div>
                      <div className="text-sm text-muted-foreground">{log.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {log.type === "subscription" ? "Abonelik" :
                        log.type === "refund" ? "İade" : "Diğer"}
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
                    <Badge variant="outline">{log.gateway}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{log.timestamp}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-sm text-muted-foreground truncate">
                      {log.description}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
          <div className="space-y-3">
            <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
              <h4 className="font-medium text-red-800 dark:text-red-200">Başarısız Ödemeler</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Son 24 saatte 12 başarısız ödeme. En yaygın neden: yetersiz bakiye. Kullanıcılara hatırlatma gönderilebilir.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Bekleyen İşlemler</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                45 banka transferi manuel onay bekliyor. Otomatik onay sistemi kurulabilir.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-800 dark:text-green-200">Yüksek Başarı Oranı</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                %89.2 başarı oranı sektör ortalamasının üzerinde. Mevcut ödeme altyapısı iyi çalışıyor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
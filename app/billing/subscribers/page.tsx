"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Crown, Users, DollarSign, TrendingUp, Search, Filter, MoreHorizontal, CreditCard, Calendar } from "lucide-react"

const subscribers = [
  {
    id: "1",
    username: "premium_user_1",
    email: "user1@example.com",
    plan: "NoFap Premium",
    status: "active",
    startDate: "2023-12-15",
    nextBilling: "2024-02-15",
    amount: 9.99,
    paymentMethod: "Kredi Kartı",
    totalPaid: 29.97,
    country: "Türkiye"
  },
  {
    id: "2",
    username: "yearly_subscriber",
    email: "user2@example.com",
    plan: "NoFap Premium Yıllık",
    status: "active",
    startDate: "2023-06-01",
    nextBilling: "2024-06-01",
    amount: 95.99,
    paymentMethod: "PayPal",
    totalPaid: 95.99,
    country: "ABD"
  },
  {
    id: "3",
    username: "cancelled_user",
    email: "user3@example.com",
    plan: "NoFap Premium",
    status: "cancelled",
    startDate: "2023-10-20",
    nextBilling: "-",
    amount: 9.99,
    paymentMethod: "Kredi Kartı",
    totalPaid: 59.94,
    country: "Almanya"
  },
  {
    id: "4",
    username: "trial_user",
    email: "user4@example.com",
    plan: "NoFap Premium",
    status: "trial",
    startDate: "2024-01-20",
    nextBilling: "2024-01-27",
    amount: 0.00,
    paymentMethod: "Kredi Kartı",
    totalPaid: 0.00,
    country: "İngiltere"
  }
]

const subscriptionStats = [
  { plan: "Premium Aylık", count: 1850, revenue: 18450 },
  { plan: "Premium Yıllık", count: 500, revenue: 47995 },
  { plan: "Deneme", count: 234, revenue: 0 }
]

export default function SubscribersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || subscriber.status === statusFilter
    const matchesPlan = planFilter === "all" || subscriber.plan === planFilter

    return matchesSearch && matchesStatus && matchesPlan
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Aboneler</h2>
          <p className="text-muted-foreground">
            Premium aboneleri yönetin ve abonelik durumlarını takip edin
          </p>
        </div>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Abone</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,584</div>
            <p className="text-xs text-muted-foreground">+12% bu ay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Abonelik</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">91% aktif oran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aylık Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$23,450</div>
            <p className="text-xs text-muted-foreground">+8% geçen aydan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Oranı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">-0.5% iyileşme</p>
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
          <div className="space-y-4">
            {subscriptionStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Crown className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                  <div>
                    <div className="font-medium">{stat.plan}</div>
                    <div className="text-sm text-muted-foreground">{stat.count} abone</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${stat.revenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Aylık gelir</div>
                </div>
              </div>
            ))}
          </div>
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
              {filteredSubscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscriber.username}</div>
                      <div className="text-sm text-muted-foreground">{subscriber.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {subscriber.plan.includes("Yıllık") ? "Yıllık" : "Aylık"}
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
              ))}
            </TableBody>
          </Table>
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
          <div className="space-y-3">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-800 dark:text-green-200">Yüksek Sadakat</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Yıllık plan abonelerinin %95&apos;i ikinci yıllarını yeniliyor. Yıllık plana geçiş teşvik edilmeli.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Deneme Dönüşümü</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Deneme kullanıcılarının %78&apos;i premium&apos;a geçiyor. Deneme süresi optimize edilebilir.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Churn Riski</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                3 aydan uzun süredir giriş yapmayan aboneler risk altında. Özel kampanya düzenlenebilir.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
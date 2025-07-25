"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Users, Clock, TrendingUp, Smartphone, Monitor } from "lucide-react"
import { useState } from "react"

const activityData = [
  {
    id: "1",
    username: "active_user_1",
    lastSeen: "2024-01-25 14:30",
    sessionDuration: "45 dakika",
    device: "iPhone 15",
    location: "İstanbul, TR",
    actions: ["Streak güncelleme", "Profil görüntüleme", "Motivasyon okuma"],
    status: "online"
  },
  {
    id: "2",
    username: "regular_user",
    lastSeen: "2024-01-25 12:15",
    sessionDuration: "23 dakika",
    device: "Samsung Galaxy S23",
    location: "Ankara, TR",
    actions: ["Relapse bildirimi", "Destek arama"],
    status: "away"
  },
  {
    id: "3",
    username: "premium_member",
    lastSeen: "2024-01-25 10:45",
    sessionDuration: "67 dakika",
    device: "MacBook Pro",
    location: "İzmir, TR",
    actions: ["İstatistik inceleme", "Premium özellik kullanımı", "Topluluk etkileşimi"],
    status: "offline"
  }
]

const deviceStats = [
  { device: "Mobile", count: 28456, percentage: 68.2 },
  { device: "Desktop", count: 9234, percentage: 22.1 },
  { device: "Tablet", count: 4056, percentage: 9.7 }
]

export default function ActivityPage() {
  const [timeFilter, setTimeFilter] = useState("24h")
  const [deviceFilter, setDeviceFilter] = useState("all")

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

      {/* Aktivite İstatistikleri */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Çevrimiçi Kullanıcı</CardTitle>
            <Activity className="h-4 w-4 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Şu anda aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Aktif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,456</div>
            <p className="text-xs text-muted-foreground">+12% dünden</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Oturum</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34 dk</div>
            <p className="text-xs text-muted-foreground">+5 dk artış</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
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
            {deviceStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {stat.device === "Mobile" && <Smartphone className="h-4 w-4" />}
                  {stat.device === "Desktop" && <Monitor className="h-4 w-4" />}
                  {stat.device === "Tablet" && <Monitor className="h-4 w-4" />}
                  <span className="font-medium">{stat.device}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">{stat.count.toLocaleString()}</span>
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
            <Select value={timeFilter} onValueChange={setTimeFilter}>
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

            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
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
              {activityData.map((activity) => (
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
                      {activity.actions.slice(0, 2).map((action, index) => (
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
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Yoğun Saatler</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                En yoğun kullanım saatleri: 20:00-22:00 arası. Bu saatlerde özel içerik sunulabilir.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-800 dark:text-green-200">Mobil Odaklı</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Kullanıcıların %68`i mobil cihaz kullanıyor. Mobil deneyim öncelikli olmalı.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Engagement Artırma</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Ortalama oturum süresi artıyor. Daha fazla etkileşimli içerik eklenebilir.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Clock, Users, Play, Pause, Trash2, Edit, Bell } from "lucide-react"

const scheduledNotifications = [
  {
    id: "1",
    title: "Günlük Motivasyon",
    content: "Bugün harika bir gün! Hedeflerine odaklan ve güçlü kal. 💪",
    scheduledTime: "2024-01-26 09:00:00",
    targetGroup: "Tüm Kullanıcılar",
    targetCount: 45231,
    status: "active",
    frequency: "daily",
    createdBy: "admin",
    lastRun: "2024-01-25 09:00:00"
  },
  {
    id: "2",
    title: "Haftalık Özet",
    content: "Bu hafta nasıl geçti? İstatistiklerini kontrol et ve gelecek hafta için plan yap!",
    scheduledTime: "2024-01-28 18:00:00",
    targetGroup: "Aktif Kullanıcılar",
    targetCount: 38492,
    status: "active",
    frequency: "weekly",
    createdBy: "admin",
    lastRun: "2024-01-21 18:00:00"
  },
  {
    id: "3",
    title: "Premium Hatırlatması",
    content: "Premium özelliklerini keşfet! İlk ay %50 indirimli.",
    scheduledTime: "2024-01-27 20:00:00",
    targetGroup: "Ücretsiz Kullanıcılar",
    targetCount: 42881,
    status: "paused",
    frequency: "once",
    createdBy: "marketing",
    lastRun: null
  },
  {
    id: "4",
    title: "Streak Kutlaması",
    content: "Tebrikler! 30 günlük streak'ini tamamladın! 🎉",
    scheduledTime: "2024-01-26 12:00:00",
    targetGroup: "30 Gün Streak",
    targetCount: 1234,
    status: "active",
    frequency: "trigger",
    createdBy: "system",
    lastRun: "2024-01-25 15:30:00"
  },
  {
    id: "5",
    title: "Destek Mesajı",
    content: "Zorlandığın anları hatırla - sen bundan daha güçlüsün. Topluluk seninle! 🤝",
    scheduledTime: "2024-01-26 21:00:00",
    targetGroup: "Zorlanıyor (Streak < 7)",
    targetCount: 5678,
    status: "active",
    frequency: "daily",
    createdBy: "support",
    lastRun: "2024-01-25 21:00:00"
  }
]

export default function ScheduledNotificationsPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [frequencyFilter, setFrequencyFilter] = useState("all")

  const filteredNotifications = scheduledNotifications.filter(notification => {
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter
    const matchesFrequency = frequencyFilter === "all" || notification.frequency === frequencyFilter
    return matchesStatus && matchesFrequency
  })

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
        <Dialog>
          <DialogTrigger asChild>
            <Button>
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

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Zamanlama</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Çalışan kampanya</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün Gönderilecek</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Bildirim planlandı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Hedef</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">133K</div>
            <p className="text-xs text-muted-foreground">Kullanıcı erişimi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Hafta Gönderilen</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
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
              {filteredNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {notification.content}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(notification.scheduledTime).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{notification.targetGroup}</div>
                      <div className="text-sm text-muted-foreground">
                        {notification.targetCount.toLocaleString()} kullanıcı
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
                    <Badge variant="outline">{notification.createdBy}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {notification.status === "active" ? (
                        <Button variant="ghost" size="sm" title="Duraklat">
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" title="Başlat">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" title="Düzenle">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Sil" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
            {scheduledNotifications
              .filter(n => n.status === "active")
              .slice(0, 3)
              .map((notification) => (
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
                      {new Date(notification.scheduledTime).toLocaleString('tr-TR')}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getFrequencyText(notification.frequency)}
                    </Badge>
                  </div>
                </div>
              ))}
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
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Optimal Saatler</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                En yüksek açılma oranları: 09:00-10:00 ve 20:00-21:00 arası. Bu saatlerde bildirim planlaması önerilir.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-800 dark:text-green-200">Haftalık Dağılım</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Pazartesi ve Çarşamba günleri en yüksek etkileşim oranları. Önemli kampanyalar bu günlere planlanabilir.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Sıklık Optimizasyonu</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Günlük bildirimler %23 açılma oranına sahip. Haftalık bildirimlerde %31 oranı görülüyor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
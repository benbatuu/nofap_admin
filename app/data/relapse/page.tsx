"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, TrendingDown, Calendar, Clock, BarChart3 } from "lucide-react"

const relapseData = [
  {
    id: "1",
    username: "user_12345",
    date: "2024-01-25",
    time: "14:30",
    previousStreak: 45,
    trigger: "Stres",
    mood: "Kötü",
    notes: "İş stresi nedeniyle",
    severity: "high"
  },
  {
    id: "2",
    username: "struggling_user",
    date: "2024-01-24",
    time: "22:15",
    previousStreak: 12,
    trigger: "Yalnızlık",
    mood: "Üzgün",
    notes: "Akşam saatlerinde yalnızlık hissi",
    severity: "medium"
  },
  {
    id: "3",
    username: "new_member",
    date: "2024-01-24",
    time: "16:45",
    previousStreak: 3,
    trigger: "Sıkıntı",
    mood: "Nötr",
    notes: "Evde sıkıldım",
    severity: "low"
  }
]

const triggerStats = [
  { trigger: "Stres", count: 234, percentage: 28.5 },
  { trigger: "Yalnızlık", count: 189, percentage: 23.1 },
  { trigger: "Sıkıntı", count: 156, percentage: 19.0 },
  { trigger: "Üzüntü", count: 98, percentage: 12.0 },
  { trigger: "Diğer", count: 143, percentage: 17.4 }
]

export default function RelapsePage() {
  const [timeFilter, setTimeFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relapse Takibi</h2>
          <p className="text-muted-foreground">
            Kullanıcı relapse verilerini analiz edin ve destek sağlayın
          </p>
        </div>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">-12% dünden</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Hafta</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">623</div>
            <p className="text-xs text-muted-foreground">-8% geçen haftadan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Ay</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,456</div>
            <p className="text-xs text-muted-foreground">-15% geçen aydan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Streak</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18 gün</div>
            <p className="text-xs text-muted-foreground">Relapse öncesi</p>
          </CardContent>
        </Card>
      </div>

      {/* Tetikleyici Analizi */}
      <Card>
        <CardHeader>
          <CardTitle>En Yaygın Tetikleyiciler</CardTitle>
          <CardDescription>
            Relapse'e neden olan ana faktörler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {triggerStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="font-medium">{stat.trigger}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">{stat.count} kez</span>
                  <Badge variant="outline">{stat.percentage}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Relapse Kayıtları */}
      <Card>
        <CardHeader>
          <CardTitle>Son Relapse Kayıtları</CardTitle>
          <CardDescription>
            Kullanıcıların bildirdiği relapse detayları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Zaman filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="today">Bugün</SelectItem>
                <SelectItem value="week">Bu Hafta</SelectItem>
                <SelectItem value="month">Bu Ay</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Şiddet filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Tarih & Saat</TableHead>
                <TableHead>Önceki Streak</TableHead>
                <TableHead>Tetikleyici</TableHead>
                <TableHead>Ruh Hali</TableHead>
                <TableHead>Şiddet</TableHead>
                <TableHead>Notlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relapseData.map((relapse) => (
                <TableRow key={relapse.id}>
                  <TableCell className="font-medium">{relapse.username}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{relapse.date}</span>
                      <span className="text-xs text-muted-foreground">{relapse.time}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{relapse.previousStreak} gün</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{relapse.trigger}</Badge>
                  </TableCell>
                  <TableCell>{relapse.mood}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        relapse.severity === "high" ? "destructive" :
                          relapse.severity === "medium" ? "default" : "secondary"
                      }
                    >
                      {relapse.severity === "high" ? "Yüksek" :
                        relapse.severity === "medium" ? "Orta" : "Düşük"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{relapse.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Destek Önerileri */}
      <Card>
        <CardHeader>
          <CardTitle>Destek Önerileri</CardTitle>
          <CardDescription>
            Relapse verilerine dayalı iyileştirme önerileri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Stres Yönetimi</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                En yaygın tetikleyici stres. Stres yönetimi içerikleri ve egzersizleri eklenebilir.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Sosyal Destek</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Yalnızlık ikinci en yaygın tetikleyici. Topluluk özelliklerini güçlendirin.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-800 dark:text-green-200">Aktivite Önerileri</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Sıkıntı anlarında yapılabilecek aktivite önerileri sisteme eklenebilir.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
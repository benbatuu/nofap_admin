"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, AlertTriangle, Eye, Search, Download, Filter } from "lucide-react"

const securityLogs = [
  {
    id: "1",
    timestamp: "2024-01-25 14:30:25",
    event: "login_attempt",
    severity: "info",
    user: "user_12345",
    ip: "192.168.1.100",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    location: "İstanbul, TR",
    status: "success",
    details: "Başarılı giriş"
  },
  {
    id: "2",
    timestamp: "2024-01-25 14:28:15",
    event: "failed_login",
    severity: "warning",
    user: "suspicious_user",
    ip: "45.123.45.67",
    userAgent: "curl/7.68.0",
    location: "Unknown",
    status: "blocked",
    details: "5 başarısız giriş denemesi"
  },
  {
    id: "3",
    timestamp: "2024-01-25 14:25:10",
    event: "data_access",
    severity: "high",
    user: "admin_user",
    ip: "10.0.0.5",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    location: "İstanbul, TR",
    status: "success",
    details: "Kullanıcı verilerine erişim"
  },
  {
    id: "4",
    timestamp: "2024-01-25 14:20:45",
    event: "api_abuse",
    severity: "critical",
    user: "bot_user",
    ip: "123.45.67.89",
    userAgent: "Python-requests/2.28.1",
    location: "Unknown",
    status: "blocked",
    details: "Rate limit aşımı - 1000 req/min"
  }
]

const eventTypes = [
  { value: "all", label: "Tüm Olaylar" },
  { value: "login_attempt", label: "Giriş Denemeleri" },
  { value: "failed_login", label: "Başarısız Girişler" },
  { value: "data_access", label: "Veri Erişimi" },
  { value: "api_abuse", label: "API Kötüye Kullanımı" },
  { value: "security_breach", label: "Güvenlik İhlali" }
]

const severityLevels = [
  { value: "all", label: "Tüm Seviyeler" },
  { value: "info", label: "Bilgi" },
  { value: "warning", label: "Uyarı" },
  { value: "high", label: "Yüksek" },
  { value: "critical", label: "Kritik" }
]

export default function SecurityLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [eventFilter, setEventFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("24h")

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500"
      case "high": return "bg-orange-500"
      case "warning": return "bg-yellow-500"
      case "info": return "bg-blue-500"
      default: return "bg-gray-500"
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "critical": return "Kritik"
      case "high": return "Yüksek"
      case "warning": return "Uyarı"
      case "info": return "Bilgi"
      default: return severity
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-500"
      case "blocked": return "bg-red-500"
      case "pending": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Güvenlik Logları</h2>
          <p className="text-muted-foreground">
            Sistem güvenlik olaylarını izleyin ve analiz edin
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Güvenlik Özeti */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Olay</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Son 24 saat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kritik Olaylar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">23</div>
            <p className="text-xs text-muted-foreground">Acil müdahale gerekli</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engellenen IP</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Otomatik engelleme</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarısız Giriş</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Son 1 saat</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Log Filtreleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="IP, kullanıcı veya olay ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Olay türü" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Önem seviyesi" />
              </SelectTrigger>
              <SelectContent>
                {severityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Zaman" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Son 1 saat</SelectItem>
                <SelectItem value="24h">Son 24 saat</SelectItem>
                <SelectItem value="7d">Son 7 gün</SelectItem>
                <SelectItem value="30d">Son 30 gün</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Log Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Güvenlik Olayları</CardTitle>
          <CardDescription>
            Gerçek zamanlı güvenlik olay logları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zaman</TableHead>
                <TableHead>Olay</TableHead>
                <TableHead>Önem</TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>IP Adresi</TableHead>
                <TableHead>Konum</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Detaylar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {securityLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {log.timestamp}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {log.event.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(log.severity)}>
                      {getSeverityText(log.severity)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.user}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.ip}
                  </TableCell>
                  <TableCell>
                    {log.location}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(log.status)}>
                      {log.status === "success" ? "Başarılı" :
                        log.status === "blocked" ? "Engellendi" : log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {log.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Güvenlik Önerileri */}
      <Card>
        <CardHeader>
          <CardTitle>Güvenlik Önerileri</CardTitle>
          <CardDescription>
            Mevcut güvenlik durumuna göre öneriler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
              <h4 className="font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Yüksek Risk
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                123.45.67.89 IP adresinden sürekli saldırı girişimi tespit edildi. Kalıcı engelleme önerilir.
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                Rate Limiting
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                API rate limit değerlerini gözden geçirin. Bazı endpoint'lerde aşırı kullanım tespit edildi.
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">
                Monitoring İyileştirmesi
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Gerçek zamanlı alert sistemi kurulması önerilir. Kritik olaylar için SMS/email bildirimi ekleyin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
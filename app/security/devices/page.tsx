"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Shield, Smartphone, Monitor, Globe, Ban, Search, Plus, Trash2, AlertTriangle, Clock, MapPin } from "lucide-react"

// Mock data
const blockedIPs = [
  {
    id: "1",
    ip: "192.168.1.100",
    reason: "Brute force attack",
    blockedAt: "2024-01-25 14:30",
    blockedBy: "Auto-system",
    attempts: 15,
    location: "İstanbul, TR",
    status: "active"
  },
  {
    id: "2",
    ip: "45.123.45.67",
    reason: "Spam activity",
    blockedAt: "2024-01-24 09:15",
    blockedBy: "admin",
    attempts: 8,
    location: "Unknown",
    status: "active"
  },
  {
    id: "3",
    ip: "203.45.67.89",
    reason: "Suspicious behavior",
    blockedAt: "2024-01-23 16:45",
    blockedBy: "moderator",
    attempts: 12,
    location: "Moscow, RU",
    status: "temporary"
  }
]

const suspiciousDevices = [
  {
    id: "1",
    deviceId: "device_abc123",
    deviceType: "mobile",
    os: "Android 12",
    browser: "Chrome 120",
    lastSeen: "2024-01-25 15:30",
    ip: "192.168.1.100",
    location: "İstanbul, TR",
    riskLevel: "high",
    flags: ["Multiple failed logins", "Unusual location"],
    userId: "user_456"
  },
  {
    id: "2",
    deviceId: "device_def456",
    deviceType: "desktop",
    os: "Windows 11",
    browser: "Firefox 121",
    lastSeen: "2024-01-25 12:15",
    ip: "45.123.45.67",
    location: "Unknown",
    riskLevel: "medium",
    flags: ["New device", "VPN usage"],
    userId: "user_789"
  }
]

const deviceStats = {
  totalBlocked: 156,
  activeBlocks: 89,
  temporaryBlocks: 67,
  autoBlocked: 134,
  manualBlocked: 22
}

export default function SecurityDevicesPage() {
  const [selectedTab, setSelectedTab] = useState("blocked-ips")
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newBlock, setNewBlock] = useState({
    ip: "",
    reason: "",
    duration: "permanent"
  })

  const handleAddBlock = () => {
    console.log("Adding new block:", newBlock)
    setIsAddDialogOpen(false)
    setNewBlock({ ip: "", reason: "", duration: "permanent" })
  }

  const handleUnblock = (id) => {
    console.log("Unblocking:", id)
  }

  const getRiskBadge = (level) => {
    switch (level) {
      case "high":
        return <Badge variant="destructive">Yüksek Risk</Badge>
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Orta Risk</Badge>
      case "low":
        return <Badge variant="outline">Düşük Risk</Badge>
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>
    }
  }

  const getDeviceIcon = (type) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "desktop":
        return <Monitor className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cihaz ve IP Güvenliği</h2>
          <p className="text-muted-foreground">
            Şüpheli cihazları ve IP adreslerini yönetin
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              IP Engelle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>IP Adresi Engelle</DialogTitle>
              <DialogDescription>
                Yeni bir IP adresini engellemek için bilgileri girin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">IP Adresi</label>
                <Input
                  placeholder="192.168.1.1"
                  value={newBlock.ip}
                  onChange={(e) => setNewBlock({ ...newBlock, ip: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Engelleme Sebebi</label>
                <Textarea
                  placeholder="Engelleme sebebini açıklayın..."
                  value={newBlock.reason}
                  onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Süre</label>
                <Select value={newBlock.duration} onValueChange={(value) => setNewBlock({ ...newBlock, duration: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1hour">1 Saat</SelectItem>
                    <SelectItem value="24hours">24 Saat</SelectItem>
                    <SelectItem value="7days">7 Gün</SelectItem>
                    <SelectItem value="30days">30 Gün</SelectItem>
                    <SelectItem value="permanent">Kalıcı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleAddBlock}>
                IP'yi Engelle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Engelli</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.totalBlocked}</div>
            <p className="text-xs text-muted-foreground">IP adresi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Engel</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.activeBlocks}</div>
            <p className="text-xs text-muted-foreground">Kalıcı engel</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geçici Engel</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.temporaryBlocks}</div>
            <p className="text-xs text-muted-foreground">Süreli engel</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Otomatik</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.autoBlocked}</div>
            <p className="text-xs text-muted-foreground">Sistem engeli</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manuel</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceStats.manualBlocked}</div>
            <p className="text-xs text-muted-foreground">Admin engeli</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="blocked-ips">Engelli IP'ler</TabsTrigger>
          <TabsTrigger value="suspicious-devices">Şüpheli Cihazlar</TabsTrigger>
          <TabsTrigger value="security-rules">Güvenlik Kuralları</TabsTrigger>
        </TabsList>

        <TabsContent value="blocked-ips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engellenmiş IP Adresleri</CardTitle>
              <CardDescription>
                Sisteme erişimi engellenmiş IP adresleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="IP adresi ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Adresi</TableHead>
                    <TableHead>Sebep</TableHead>
                    <TableHead>Engellenme Zamanı</TableHead>
                    <TableHead>Engelleyen</TableHead>
                    <TableHead>Deneme Sayısı</TableHead>
                    <TableHead>Konum</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedIPs.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.ip}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                      <TableCell>{item.blockedAt}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.blockedBy}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{item.attempts}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{item.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === "active" ? "destructive" : "secondary"}>
                          {item.status === "active" ? "Engelli" : "Geçici"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnblock(item.id)}
                        >
                          Engeli Kaldır
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspicious-devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Şüpheli Cihazlar</CardTitle>
              <CardDescription>
                Güvenlik riski taşıyan cihazlar ve oturum bilgileri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suspiciousDevices.map((device) => (
                  <div key={device.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getDeviceIcon(device.deviceType)}
                          <span className="font-medium">Cihaz ID: {device.deviceId}</span>
                          {getRiskBadge(device.riskLevel)}
                        </div>

                        <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
                          <div>İşletim Sistemi: {device.os}</div>
                          <div>Tarayıcı: {device.browser}</div>
                          <div>Son Görülme: {device.lastSeen}</div>
                          <div>IP: {device.ip}</div>
                          <div>Konum: {device.location}</div>
                          <div>Kullanıcı: {device.userId}</div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm font-medium">Güvenlik Uyarıları:</div>
                          <div className="flex flex-wrap gap-1">
                            {device.flags.map((flag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Detaylar
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Ban className="h-4 w-4 mr-1" />
                          Engelle
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security-rules" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Otomatik Engelleme Kuralları</CardTitle>
                <CardDescription>
                  Sistem tarafından otomatik uygulanan güvenlik kuralları
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <div className="font-medium">Brute Force Koruması</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    5 dakika içinde 5 başarısız giriş denemesi yapan IP'leri 1 saat engelle
                  </div>
                  <Badge className="mt-2 bg-green-500">Aktif</Badge>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="font-medium">Spam Koruması</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Dakikada 10'dan fazla API isteği yapan IP'leri geçici engelle
                  </div>
                  <Badge className="mt-2 bg-green-500">Aktif</Badge>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="font-medium">Coğrafi Kısıtlama</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Belirli ülkelerden gelen trafiği engelle
                  </div>
                  <Badge className="mt-2" variant="secondary">Pasif</Badge>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="font-medium">VPN/Proxy Tespiti</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Bilinen VPN/Proxy IP'lerini otomatik engelle
                  </div>
                  <Badge className="mt-2" variant="secondary">Pasif</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Güvenlik Önerileri</CardTitle>
                <CardDescription>
                  Sistem güvenliğini artırmak için öneriler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Yüksek Risk IP'ler</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Son 24 saatte 15 IP adresi otomatik olarak engellendi. Manuel inceleme önerilir.
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Coğrafi Analiz</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Rusya ve Çin'den gelen trafikte artış var. Ek güvenlik önlemleri alınabilir.
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-medium text-green-800 dark:text-green-200">Sistem Performansı</h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Güvenlik kuralları düzgün çalışıyor. %99.8 uptime sağlanıyor.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
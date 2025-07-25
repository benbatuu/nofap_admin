import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Info, Download, Github, ExternalLink, CheckCircle, Clock, AlertCircle } from "lucide-react"

const versionHistory = [
  {
    version: "2.1.0",
    date: "2024-01-25",
    status: "current",
    changes: [
      "Yeni admin dashboard tasarımı",
      "Gelişmiş analitik raporları",
      "Bildirim sistemi iyileştirmeleri",
      "Güvenlik güncellemeleri"
    ]
  },
  {
    version: "2.0.5",
    date: "2024-01-15",
    status: "stable",
    changes: [
      "Hata düzeltmeleri",
      "Performans iyileştirmeleri",
      "UI/UX güncellemeleri"
    ]
  },
  {
    version: "2.0.0",
    date: "2024-01-01",
    status: "major",
    changes: [
      "Yeni kullanıcı arayüzü",
      "Premium abonelik sistemi",
      "Sosyal özellikler",
      "Çoklu dil desteği"
    ]
  }
]

const systemInfo = {
  platform: "Next.js 15.4.3",
  database: "PostgreSQL 15.2",
  cache: "Redis 7.0",
  deployment: "Vercel",
  monitoring: "Sentry",
  analytics: "Google Analytics 4"
}

export default function VersionPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sürüm Bilgisi</h2>
          <p className="text-muted-foreground">
            Uygulama sürümü ve sistem bilgileri
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mevcut Sürüm */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Mevcut Sürüm
            </CardTitle>
            <CardDescription>
              Şu anda çalışan uygulama sürümü
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">NoFap Admin v2.1.0</h3>
                <p className="text-sm text-muted-foreground">Yayın Tarihi: 25 Ocak 2024</p>
              </div>
              <Badge className="bg-green-500 dark:bg-green-600">Güncel</Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Bu Sürümdeki Yenilikler:</h4>
              <ul className="space-y-1">
                {versionHistory[0].changes.map((change, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {change}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Sürüm Notları
              </Button>
              <Button variant="outline" size="sm">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sistem Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Sistem Bilgileri</CardTitle>
            <CardDescription>
              Teknik altyapı ve bağımlılıklar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {Object.entries(systemInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <Badge variant="outline">{value}</Badge>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Sistem Durumu:</h4>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uptime</span>
                  <Badge className="bg-green-500 dark:bg-green-600">99.9%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Son Güncelleme</span>
                  <span className="text-xs text-muted-foreground">2 saat önce</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sonraki Bakım</span>
                  <span className="text-xs text-muted-foreground">Planlanmadı</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sürüm Geçmişi */}
      <Card>
        <CardHeader>
          <CardTitle>Sürüm Geçmişi</CardTitle>
          <CardDescription>
            Önceki sürümler ve değişiklik logları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {versionHistory.map((version, index) => (
              <div key={version.version} className="relative">
                {index !== versionHistory.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                )}

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border bg-background">
                    {version.status === "current" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {version.status === "stable" && <Clock className="h-4 w-4 text-blue-500" />}
                    {version.status === "major" && <AlertCircle className="h-4 w-4 text-orange-500" />}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">v{version.version}</h3>
                      <Badge
                        variant={version.status === "current" ? "default" : "secondary"}
                        className={version.status === "current" ? "bg-green-500" : ""}
                      >
                        {version.status === "current" ? "Güncel" :
                          version.status === "stable" ? "Kararlı" : "Büyük Güncelleme"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{version.date}</span>
                    </div>

                    <ul className="space-y-1">
                      {version.changes.map((change, changeIndex) => (
                        <li key={changeIndex} className="text-sm text-muted-foreground">
                          • {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Güncelleme Kontrolü */}
      <Card>
        <CardHeader>
          <CardTitle>Güncelleme Kontrolü</CardTitle>
          <CardDescription>
            Yeni sürüm kontrolü ve güncelleme seçenekleri
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Otomatik Güncelleme</h4>
              <p className="text-sm text-muted-foreground">
                Yeni sürümler otomatik olarak kontrol edilir
              </p>
            </div>
            <Badge className="bg-green-500">Aktif</Badge>
          </div>

          <div className="flex gap-2">
            <Button>
              <ExternalLink className="mr-2 h-4 w-4" />
              Güncellemeleri Kontrol Et
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Manuel Güncelleme
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
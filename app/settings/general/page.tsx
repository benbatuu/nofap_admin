"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, RefreshCw, Globe, Shield, Bell } from "lucide-react"

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState({
    appName: "NoFap Tracker",
    appDescription: "Bağımlılıkla mücadele eden kişiler için destek uygulaması",
    supportEmail: "support@nofaptracker.com",
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxStreakDays: 365,
    defaultLanguage: "tr",
    timezone: "Europe/Istanbul",
    analyticsEnabled: true,
    crashReportingEnabled: true
  })

  const handleSave = () => {
    // Ayarları kaydetme işlemi
    console.log("Ayarlar kaydedildi:", settings)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Genel Ayarlar</h2>
          <p className="text-muted-foreground">
            Uygulamanın temel ayarlarını yönetin
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Değişiklikleri Kaydet
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Uygulama Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Uygulama Bilgileri
            </CardTitle>
            <CardDescription>
              Uygulamanın temel bilgilerini düzenleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Uygulama Adı</label>
                <Input
                  value={settings.appName}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Destek E-postası</label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Uygulama Açıklaması</label>
              <Textarea
                value={settings.appDescription}
                onChange={(e) => setSettings({ ...settings, appDescription: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sistem Ayarları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Sistem Ayarları
            </CardTitle>
            <CardDescription>
              Sistem genelindeki temel ayarlar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Varsayılan Dil</label>
                <Select value={settings.defaultLanguage} onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tr">Türkçe</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Zaman Dilimi</label>
                <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Istanbul">İstanbul (UTC+3)</SelectItem>
                    <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                    <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                    <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Bakım Modu</h4>
                  <p className="text-sm text-muted-foreground">
                    Uygulamayı geçici olarak kapatır
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Yeni Kayıt</h4>
                  <p className="text-sm text-muted-foreground">
                    Yeni kullanıcı kaydına izin ver
                  </p>
                </div>
                <Switch
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">E-posta Doğrulama</h4>
                  <p className="text-sm text-muted-foreground">
                    Kayıt sırasında e-posta doğrulama zorunlu
                  </p>
                </div>
                <Switch
                  checked={settings.emailVerificationRequired}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailVerificationRequired: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uygulama Limitleri */}
        <Card>
          <CardHeader>
            <CardTitle>Uygulama Limitleri</CardTitle>
            <CardDescription>
              Sistem limitlerini ve kısıtlamaları ayarlayın
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Maksimum Streak Günü</label>
              <Input
                type="number"
                value={settings.maxStreakDays}
                onChange={(e) => setSettings({ ...settings, maxStreakDays: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Kullanıcıların ulaşabileceği maksimum streak günü
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Veri ve Analitik */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Veri ve Analitik
            </CardTitle>
            <CardDescription>
              Veri toplama ve analitik ayarları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Analitik Takibi</h4>
                <p className="text-sm text-muted-foreground">
                  Kullanıcı davranışlarını analiz et
                </p>
              </div>
              <Switch
                checked={settings.analyticsEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, analyticsEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Hata Raporlama</h4>
                <p className="text-sm text-muted-foreground">
                  Otomatik hata raporları gönder
                </p>
              </div>
              <Switch
                checked={settings.crashReportingEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, crashReportingEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sistem Durumu */}
        <Card>
          <CardHeader>
            <CardTitle>Sistem Durumu</CardTitle>
            <CardDescription>
              Mevcut sistem durumu ve sağlık bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">API Durumu</p>
                  <p className="text-xs text-muted-foreground">Çevrimiçi</p>
                </div>
                <Badge className="bg-green-500 dark:bg-green-600">Aktif</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Veritabanı</p>
                  <p className="text-xs text-muted-foreground">Bağlantı OK</p>
                </div>
                <Badge className="bg-green-500 dark:bg-green-600">Aktif</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Bildirim Servisi</p>
                  <p className="text-xs text-muted-foreground">Çalışıyor</p>
                </div>
                <Badge className="bg-green-500 dark:bg-green-600">Aktif</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tehlikeli İşlemler */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Tehlikeli İşlemler</CardTitle>
            <CardDescription>
              Bu işlemler geri alınamaz. Dikkatli kullanın.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
              <div>
                <h4 className="text-sm font-medium">Önbelleği Temizle</h4>
                <p className="text-sm text-muted-foreground">
                  Tüm sistem önbelleğini temizler
                </p>
              </div>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                <RefreshCw className="mr-2 h-4 w-4" />
                Temizle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
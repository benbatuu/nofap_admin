"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Globe, Plus, Edit, Trash2, Upload, Download, CheckCircle, AlertCircle } from "lucide-react"

const languages = [
  {
    id: "tr",
    name: "Türkçe",
    nativeName: "Türkçe",
    code: "tr-TR",
    isDefault: true,
    isActive: true,
    completionRate: 100,
    totalStrings: 1247,
    translatedStrings: 1247,
    lastUpdated: "2024-01-25"
  },
  {
    id: "en",
    name: "English",
    nativeName: "English",
    code: "en-US",
    isDefault: false,
    isActive: true,
    completionRate: 98,
    totalStrings: 1247,
    translatedStrings: 1222,
    lastUpdated: "2024-01-24"
  },
  {
    id: "es",
    name: "Spanish",
    nativeName: "Español",
    code: "es-ES",
    isDefault: false,
    isActive: true,
    completionRate: 85,
    totalStrings: 1247,
    translatedStrings: 1060,
    lastUpdated: "2024-01-20"
  },
  {
    id: "fr",
    name: "French",
    nativeName: "Français",
    code: "fr-FR",
    isDefault: false,
    isActive: false,
    completionRate: 45,
    totalStrings: 1247,
    translatedStrings: 561,
    lastUpdated: "2024-01-15"
  },
  {
    id: "de",
    name: "German",
    nativeName: "Deutsch",
    code: "de-DE",
    isDefault: false,
    isActive: false,
    completionRate: 23,
    totalStrings: 1247,
    translatedStrings: 287,
    lastUpdated: "2024-01-10"
  }
]

const translationStats = [
  { category: "Genel UI", total: 245, translated: 245, percentage: 100 },
  { category: "Bildirimler", total: 156, translated: 148, percentage: 95 },
  { category: "Ayarlar", total: 89, translated: 89, percentage: 100 },
  { category: "Motivasyon Mesajları", total: 234, translated: 201, percentage: 86 },
  { category: "Hata Mesajları", total: 67, translated: 65, percentage: 97 }
]

export default function LanguageSettingsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("tr")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dil Ayarları</h2>
          <p className="text-muted-foreground">
            Uygulamanın çoklu dil desteğini yönetin
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Çeviri Dışa Aktar
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Dil Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Dil Ekle</DialogTitle>
                <DialogDescription>
                  Uygulamaya yeni bir dil desteği ekleyin
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Dil adı (örn: Italiano)" />
                <Input placeholder="Yerel ad (örn: Italiano)" />
                <Input placeholder="Dil kodu (örn: it-IT)" />
                <Button className="w-full" onClick={() => setIsAddDialogOpen(false)}>
                  Dil Ekle
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desteklenen Dil</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">3 aktif dil</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam String</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">Çevrilecek metin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Tamamlanma</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">70%</div>
            <p className="text-xs text-muted-foreground">Tüm diller</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Son Güncelleme</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 gün</div>
            <p className="text-xs text-muted-foreground">önce</p>
          </CardContent>
        </Card>
      </div>

      {/* Dil Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Desteklenen Diller</CardTitle>
          <CardDescription>
            Uygulamada mevcut olan tüm dil seçenekleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dil</TableHead>
                <TableHead>Kod</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tamamlanma</TableHead>
                <TableHead>Çeviri Durumu</TableHead>
                <TableHead>Son Güncelleme</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {languages.map((language) => (
                <TableRow key={language.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-4 bg-gray-200 rounded-sm flex items-center justify-center text-xs font-bold">
                        {language.code.split('-')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{language.name}</div>
                        <div className="text-sm text-muted-foreground">{language.nativeName}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{language.code}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch checked={language.isActive} />
                      {language.isDefault && (
                        <Badge className="bg-blue-500">Varsayılan</Badge>
                      )}
                      {language.isActive && !language.isDefault && (
                        <Badge className="bg-green-500">Aktif</Badge>
                      )}
                      {!language.isActive && (
                        <Badge variant="secondary">Pasif</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{language.completionRate}%</span>
                        <span className="text-xs text-muted-foreground">
                          {language.translatedStrings}/{language.totalStrings}
                        </span>
                      </div>
                      <Progress value={language.completionRate} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        language.completionRate === 100 ? "default" :
                          language.completionRate >= 80 ? "secondary" : "destructive"
                      }
                      className={
                        language.completionRate === 100 ? "bg-green-500" :
                          language.completionRate >= 80 ? "bg-yellow-500" : ""
                      }
                    >
                      {language.completionRate === 100 ? "Tamamlandı" :
                        language.completionRate >= 80 ? "Devam Ediyor" : "Başlangıç"}
                    </Badge>
                  </TableCell>
                  <TableCell>{language.lastUpdated}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button variant="ghost" size="sm" title="Düzenle">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Çeviri Yükle">
                        <Upload className="h-4 w-4" />
                      </Button>
                      {!language.isDefault && (
                        <Button variant="ghost" size="sm" title="Sil" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Çeviri Kategorileri */}
      <Card>
        <CardHeader>
          <CardTitle>Çeviri Kategorileri</CardTitle>
          <CardDescription>
            Kategori bazında çeviri tamamlanma durumu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {translationStats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{stat.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {stat.translated}/{stat.total}
                    </span>
                    <Badge variant="outline">{stat.percentage}%</Badge>
                  </div>
                </div>
                <Progress value={stat.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Çeviri Araçları */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Çeviri Araçları</CardTitle>
            <CardDescription>
              Çeviri sürecini hızlandıracak araçlar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              CSV Dosyası Yükle
            </Button>
            <Button className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Eksik Çevirileri İndir
            </Button>
            <Button className="w-full" variant="outline">
              <Globe className="mr-2 h-4 w-4" />
              Otomatik Çeviri (Google Translate)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Çeviri Önerileri</CardTitle>
            <CardDescription>
              Çeviri kalitesini artırmak için öneriler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Fransızca Eksik</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Fransızca çeviriler %45 tamamlanmış. Öncelik verilmeli.
                </p>
              </div>
              <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Motivasyon Mesajları</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Motivasyon mesajlarının çevirisi kültürel uyum açısından önemli.
                </p>
              </div>
              <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <h4 className="font-medium text-green-800 dark:text-green-200">İngilizce Neredeyse Tamam</h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  İngilizce çeviriler %98 tamamlanmış. Son kontroller yapılabilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
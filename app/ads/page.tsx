"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Eye, MousePointer, TrendingUp, Plus, Edit, Trash2 } from "lucide-react"

const adCampaigns = [
  {
    id: "1",
    name: "Banner Ana Sayfa",
    type: "banner",
    position: "header",
    status: "active",
    impressions: 45231,
    clicks: 892,
    ctr: 1.97,
    revenue: 234.56,
    advertiser: "Health & Wellness Co."
  },
  {
    id: "2",
    name: "Video Reklam",
    type: "video",
    position: "feed",
    status: "active",
    impressions: 23456,
    clicks: 1234,
    ctr: 5.26,
    revenue: 456.78,
    advertiser: "Fitness App"
  },
  {
    id: "3",
    name: "Sidebar Reklam",
    type: "display",
    position: "sidebar",
    status: "paused",
    impressions: 12345,
    clicks: 234,
    ctr: 1.89,
    revenue: 123.45,
    advertiser: "Mental Health Platform"
  }
]

const adPositions = [
  { value: "header", label: "Üst Banner" },
  { value: "sidebar", label: "Yan Panel" },
  { value: "feed", label: "İçerik Arası" },
  { value: "footer", label: "Alt Banner" },
  { value: "popup", label: "Pop-up" }
]

export default function AdsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAd, setNewAd] = useState({
    name: "",
    type: "banner",
    position: "header",
    advertiser: "",
    content: ""
  })

  const totalRevenue = adCampaigns.reduce((sum, ad) => sum + ad.revenue, 0)
  const totalImpressions = adCampaigns.reduce((sum, ad) => sum + ad.impressions, 0)
  const totalClicks = adCampaigns.reduce((sum, ad) => sum + ad.clicks, 0)
  const averageCTR = totalClicks / totalImpressions * 100

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reklam Yönetimi</h2>
          <p className="text-muted-foreground">
            Reklam kampanyalarını yönetin ve gelir takibi yapın
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Reklam
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Reklam Kampanyası</DialogTitle>
              <DialogDescription>
                Yeni bir reklam kampanyası oluşturun
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Kampanya adı"
                value={newAd.name}
                onChange={(e) => setNewAd({ ...newAd, name: e.target.value })}
              />
              <Select value={newAd.type} onValueChange={(value) => setNewAd({ ...newAd, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Reklam türü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="display">Display</SelectItem>
                  <SelectItem value="native">Native</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newAd.position} onValueChange={(value) => setNewAd({ ...newAd, position: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Konum" />
                </SelectTrigger>
                <SelectContent>
                  {adPositions.map((position) => (
                    <SelectItem key={position.value} value={position.value}>
                      {position.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Reklamveren"
                value={newAd.advertiser}
                onChange={(e) => setNewAd({ ...newAd, advertiser: e.target.value })}
              />
              <Textarea
                placeholder="Reklam içeriği/URL"
                value={newAd.content}
                onChange={(e) => setNewAd({ ...newAd, content: e.target.value })}
              />
              <Button className="w-full" onClick={() => setIsCreateDialogOpen(false)}>
                Kampanya Oluştur
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reklam İstatistikleri */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Bu ay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gösterim</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% geçen aydan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% artış</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCTR.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Tıklama oranı</p>
          </CardContent>
        </Card>
      </div>

      {/* Aktif Kampanyalar */}
      <Card>
        <CardHeader>
          <CardTitle>Reklam Kampanyaları</CardTitle>
          <CardDescription>
            Tüm reklam kampanyalarını yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kampanya</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Konum</TableHead>
                <TableHead>Reklamveren</TableHead>
                <TableHead>Gösterim</TableHead>
                <TableHead>Tıklama</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead>Gelir</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {campaign.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {adPositions.find(p => p.value === campaign.position)?.label}
                  </TableCell>
                  <TableCell>{campaign.advertiser}</TableCell>
                  <TableCell>{campaign.impressions.toLocaleString()}</TableCell>
                  <TableCell>{campaign.clicks.toLocaleString()}</TableCell>
                  <TableCell>{campaign.ctr.toFixed(2)}%</TableCell>
                  <TableCell>${campaign.revenue.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch checked={campaign.status === "active"} />
                      <Badge
                        variant={campaign.status === "active" ? "default" : "secondary"}
                        className={campaign.status === "active" ? "bg-green-500" : ""}
                      >
                        {campaign.status === "active" ? "Aktif" : "Duraklatıldı"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
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

      {/* Performans Analizi */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>En İyi Performans</CardTitle>
            <CardDescription>
              En yüksek CTR'ye sahip kampanyalar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adCampaigns
                .sort((a, b) => b.ctr - a.ctr)
                .slice(0, 3)
                .map((campaign, index) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-muted-foreground">{campaign.advertiser}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{campaign.ctr.toFixed(2)}% CTR</div>
                      <div className="text-sm text-muted-foreground">
                        ${campaign.revenue.toFixed(2)} gelir
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimizasyon Önerileri</CardTitle>
            <CardDescription>
              Gelir artırma önerileri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <h4 className="font-medium text-green-800 dark:text-green-200">Video Reklamları</h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Video reklamlar en yüksek CTR'ye sahip. Daha fazla video reklam alanı açılabilir.
                </p>
              </div>
              <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Konum Optimizasyonu</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  İçerik arası reklamlar daha iyi performans gösteriyor. Sidebar reklamları gözden geçirin.
                </p>
              </div>
              <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">A/B Test</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Farklı reklam formatları için A/B test yapılması önerilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
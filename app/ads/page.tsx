/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Eye, MousePointer, TrendingUp, Plus, Edit, Trash2, RefreshCw, Loader2 } from "lucide-react"
import { useAds, useAdAnalytics, useAdSuggestions, useCreateAd, useUpdateAd, useDeleteAd } from "@/hooks/use-api"
import { toast } from "sonner"

interface Ad {
  id: string
  title: string
  description: string
  imageUrl?: string
  targetUrl: string
  type: 'banner' | 'video' | 'display' | 'native'
  status: 'active' | 'paused' | 'completed' | 'rejected'
  placement: string
  targeting?: any
  budget?: number
  spent: number
  impressions: number
  clicks: number
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

interface AdAnalytics {
  overview?: {
    totalAds: number
    activeAds: number
    totalImpressions: number
    totalClicks: number
    totalSpent: number
    totalBudget: number
    averageCTR: number
    revenue: number
  }
  performance?: {
    topPerformingAds: Array<Ad & { ctr: number }>
    totalCampaigns: number
  }
  breakdown?: {
    byType: Array<{
      type: string
      count: number
      impressions: number
      clicks: number
      spent: number
      ctr: number
    }>
    byPlacement: Array<{
      placement: string
      count: number
      impressions: number
      clicks: number
      spent: number
      ctr: number
    }>
  }
}

interface AdSuggestions {
  suggestions?: Array<{
    type: string
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    expectedImpact: string
  }>
  performanceInsights?: {
    bestPerformingType: string
    averageCTR: number
    budgetUtilization: number
  }
}

const adPositions = [
  { value: "header", label: "Üst Banner" },
  { value: "sidebar", label: "Yan Panel" },
  { value: "feed", label: "İçerik Arası" },
  { value: "footer", label: "Alt Banner" },
  { value: "popup", label: "Pop-up" }
]

export default function AdsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [newAd, setNewAd] = useState({
    title: "",
    description: "",
    targetUrl: "",
    type: "banner" as const,
    placement: "header",
    budget: 0
  })

  // API hooks
  const { data: adsData, isLoading: adsLoading, error: adsError } = useAds()
  const { data: analyticsData, isLoading: analyticsLoading } = useAdAnalytics()
  const { data: suggestionsData, isLoading: suggestionsLoading } = useAdSuggestions()
  const createAdMutation = useCreateAd()
  const updateAdMutation = useUpdateAd()
  const deleteAdMutation = useDeleteAd()

  const ads = adsData?.data?.ads || []
  const analytics = analyticsData?.data?.overview || {}
  const suggestions = suggestionsData?.data?.suggestions || []

  const handleCreateAd = async () => {
    if (!newAd.title || !newAd.targetUrl) {
      toast.error("Lütfen gerekli alanları doldurun")
      return
    }

    try {
      await createAdMutation.mutateAsync({
        ...newAd,
        startDate: new Date().toISOString(),
      })
      toast.success("Reklam kampanyası başarıyla oluşturuldu")
      setIsCreateDialogOpen(false)
      setNewAd({
        title: "",
        description: "",
        targetUrl: "",
        type: "banner",
        placement: "header",
        budget: 0
      })
    } catch (error) {
      toast.error("Reklam kampanyası oluşturulurken hata oluştu")
    }
  }

  const handleToggleAdStatus = async (ad: Ad) => {
    try {
      const newStatus = ad.status === 'active' ? 'paused' : 'active'
      await updateAdMutation.mutateAsync({
        id: ad.id,
        data: { status: newStatus }
      })
      toast.success(`Reklam ${newStatus === 'active' ? 'aktif edildi' : 'duraklatıldı'}`)
    } catch (error) {
      toast.error("Reklam durumu güncellenirken hata oluştu")
    }
  }

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Bu reklamı silmek istediğinizden emin misiniz?")) return

    try {
      await deleteAdMutation.mutateAsync(id)
      toast.success("Reklam başarıyla silindi")
    } catch (error) {
      toast.error("Reklam silinirken hata oluştu")
    }
  }

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
                placeholder="Kampanya başlığı"
                value={newAd.title}
                onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
              />
              <Textarea
                placeholder="Kampanya açıklaması"
                value={newAd.description}
                onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
              />
              <Input
                placeholder="Hedef URL"
                value={newAd.targetUrl}
                onChange={(e) => setNewAd({ ...newAd, targetUrl: e.target.value })}
              />
              <Select value={newAd.type} onValueChange={(value: any) => setNewAd({ ...newAd, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Reklam türü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="popup">Pop-up</SelectItem>
                  <SelectItem value="native">Native</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newAd.placement} onValueChange={(value) => setNewAd({ ...newAd, placement: value })}>
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
                type="number"
                placeholder="Bütçe ($)"
                value={newAd.budget}
                onChange={(e) => setNewAd({ ...newAd, budget: parseFloat(e.target.value) || 0 })}
              />
              <Button
                className="w-full"
                onClick={handleCreateAd}
                disabled={createAdMutation.isPending}
              >
                {createAdMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            <div className="text-2xl font-bold">
              {analyticsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                `$${(analytics.revenue || 0).toFixed(2)}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">Bu ay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gösterim</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                (analytics.totalImpressions || 0).toLocaleString()
              )}
            </div>
            <p className="text-xs text-muted-foreground">Toplam gösterim</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                (analytics.totalClicks || 0).toLocaleString()
              )}
            </div>
            <p className="text-xs text-muted-foreground">Toplam tıklama</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                `${(analytics.averageCTR || 0).toFixed(2)}%`
              )}
            </div>
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
          {adsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : adsError ? (
            <div className="text-center p-8 text-red-600">
              Reklamlar yüklenirken hata oluştu
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kampanya</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Konum</TableHead>
                  <TableHead>Gösterim</TableHead>
                  <TableHead>Tıklama</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Harcanan</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center p-8 text-muted-foreground">
                      Henüz reklam kampanyası bulunmuyor
                    </TableCell>
                  </TableRow>
                ) : (
                  ads.map((ad: Ad) => {
                    const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0
                    return (
                      <TableRow key={ad.id}>
                        <TableCell className="font-medium">{ad.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {ad.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {adPositions.find(p => p.value === ad.placement)?.label || ad.placement}
                        </TableCell>
                        <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                        <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                        <TableCell>{ctr.toFixed(2)}%</TableCell>
                        <TableCell>${ad.spent.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={ad.status === "active"}
                              onCheckedChange={() => handleToggleAdStatus(ad)}
                              disabled={updateAdMutation.isPending}
                            />
                            <Badge
                              variant={ad.status === "active" ? "default" : "secondary"}
                              className={ad.status === "active" ? "bg-green-500" : ""}
                            >
                              {ad.status === "active" ? "Aktif" :
                                ad.status === "paused" ? "Duraklatıldı" :
                                  ad.status === "completed" ? "Tamamlandı" : "Reddedildi"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingAd(ad)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDeleteAd(ad.id)}
                              disabled={deleteAdMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Performans Analizi */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>En İyi Performans</CardTitle>
            <CardDescription>
              En yüksek CTR`ye sahip kampanyalar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {adsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {ads.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4">
                    Henüz reklam kampanyası bulunmuyor
                  </p>
                ) : (
                  ads
                    .map((ad: Ad) => ({
                      ...ad,
                      ctr: ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0
                    }))
                    .sort((a: any, b: any) => b.ctr - a.ctr)
                    .slice(0, 3)
                    .map((ad: any) => (
                      <div key={ad.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{ad.title}</div>
                          <div className="text-sm text-muted-foreground">{ad.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{ad.ctr.toFixed(2)}% CTR</div>
                          <div className="text-sm text-muted-foreground">
                            ${ad.spent.toFixed(2)} harcandı
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
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
            {suggestionsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4">
                    Henüz öneri bulunmuyor
                  </p>
                ) : (
                  suggestions.map((suggestion: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg ${suggestion.priority === 'high' ? 'bg-red-50 dark:bg-red-950/20' :
                        suggestion.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-950/20' :
                          'bg-green-50 dark:bg-green-950/20'
                        }`}
                    >
                      <h4 className={`font-medium ${suggestion.priority === 'high' ? 'text-red-800 dark:text-red-200' :
                        suggestion.priority === 'medium' ? 'text-yellow-800 dark:text-yellow-200' :
                          'text-green-800 dark:text-green-200'
                        }`}>
                        {suggestion.title}
                      </h4>
                      <p className={`text-sm mt-1 ${suggestion.priority === 'high' ? 'text-red-700 dark:text-red-300' :
                        suggestion.priority === 'medium' ? 'text-yellow-700 dark:text-yellow-300' :
                          'text-green-700 dark:text-green-300'
                        }`}>
                        {suggestion.description}
                      </p>
                      {suggestion.expectedImpact && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Beklenen etki: {suggestion.expectedImpact}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
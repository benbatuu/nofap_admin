"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, TrendingDown, Eye, MousePointer, Calendar, Download, BarChart3 } from "lucide-react"

// Mock data
const revenueData = {
  today: {
    total: 156.78,
    admob: 89.45,
    facebook: 0,
    unity: 67.33,
    impressions: 12450,
    clicks: 298,
    ctr: 2.39
  },
  yesterday: {
    total: 142.33,
    admob: 78.90,
    facebook: 0,
    unity: 63.43,
    impressions: 11890,
    clicks: 267,
    ctr: 2.25
  },
  thisMonth: {
    total: 3456.78,
    admob: 1987.45,
    facebook: 0,
    unity: 1469.33,
    impressions: 289450,
    clicks: 6890,
    ctr: 2.38
  },
  lastMonth: {
    total: 3123.45,
    admob: 1789.23,
    facebook: 0,
    unity: 1334.22,
    impressions: 267890,
    clicks: 6234,
    ctr: 2.33
  }
}

const dailyRevenue = [
  { date: "2024-01-01", admob: 89.45, unity: 67.33, facebook: 0, total: 156.78 },
  { date: "2024-01-02", admob: 78.90, unity: 63.43, facebook: 0, total: 142.33 },
  { date: "2024-01-03", admob: 95.20, unity: 71.80, facebook: 0, total: 167.00 },
  { date: "2024-01-04", admob: 82.15, unity: 59.25, facebook: 0, total: 141.40 },
  { date: "2024-01-05", admob: 91.30, unity: 68.90, facebook: 0, total: 160.20 },
  { date: "2024-01-06", admob: 87.65, unity: 64.75, facebook: 0, total: 152.40 },
  { date: "2024-01-07", admob: 93.80, unity: 72.15, facebook: 0, total: 165.95 }
]

const topPerformingAds = [
  {
    id: "banner_001",
    type: "Banner",
    network: "AdMob",
    placement: "Ana Sayfa Alt",
    impressions: 45230,
    clicks: 1089,
    ctr: 2.41,
    revenue: 89.45,
    ecpm: 1.98
  },
  {
    id: "interstitial_001",
    type: "Interstitial",
    network: "Unity",
    placement: "Sayfa Geçişi",
    impressions: 12450,
    clicks: 298,
    ctr: 2.39,
    revenue: 67.33,
    ecpm: 5.41
  },
  {
    id: "rewarded_001",
    type: "Rewarded",
    network: "AdMob",
    placement: "Streak Boost",
    impressions: 8920,
    clicks: 267,
    ctr: 2.99,
    revenue: 45.67,
    ecpm: 5.12
  }
]

export default function AdsIncomePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("today")
  const [selectedNetwork, setSelectedNetwork] = useState("all")

  const getCurrentData = () => {
    switch (selectedPeriod) {
      case "today": return revenueData.today
      case "yesterday": return revenueData.yesterday
      case "thisMonth": return revenueData.thisMonth
      case "lastMonth": return revenueData.lastMonth
      default: return revenueData.today
    }
  }

  const getComparisonData = () => {
    switch (selectedPeriod) {
      case "today": return revenueData.yesterday
      case "yesterday": return revenueData.today
      case "thisMonth": return revenueData.lastMonth
      case "lastMonth": return revenueData.thisMonth
      default: return revenueData.yesterday
    }
  }

  const currentData = getCurrentData()
  const comparisonData = getComparisonData()
  const changePercent = ((currentData.total - comparisonData.total) / comparisonData.total * 100).toFixed(1)
  const isPositive = parseFloat(changePercent) > 0

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reklam Gelirleri</h2>
          <p className="text-muted-foreground">
            Reklam ağlarından elde edilen gelir raporları
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Bugün</SelectItem>
              <SelectItem value="yesterday">Dün</SelectItem>
              <SelectItem value="thisMonth">Bu Ay</SelectItem>
              <SelectItem value="lastMonth">Geçen Ay</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Ana İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentData.total.toFixed(2)}</div>
            <p className={`text-xs flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(parseFloat(changePercent))}% {selectedPeriod === "today" ? "dünden" : "önceki dönemden"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gösterim</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.impressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Reklam gösterimleri
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.clicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Kullanıcı tıklamaları
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR Oranı</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.ctr.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Tıklama oranı
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="networks">Ağ Bazında</TabsTrigger>
          <TabsTrigger value="performance">Performans</TabsTrigger>
          <TabsTrigger value="trends">Trendler</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Ağ Bazında Gelir */}
          <Card>
            <CardHeader>
              <CardTitle>Reklam Ağı Dağılımı</CardTitle>
              <CardDescription>
                Her reklam ağından elde edilen gelir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Google AdMob</div>
                      <div className="text-sm text-muted-foreground">Banner + Interstitial</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${currentData.admob.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((currentData.admob / currentData.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-black rounded-full"></div>
                    <div>
                      <div className="font-medium">Unity Ads</div>
                      <div className="text-sm text-muted-foreground">Rewarded + Video</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${currentData.unity.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((currentData.unity / currentData.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div>
                      <div className="font-medium">Facebook Audience Network</div>
                      <div className="text-sm text-muted-foreground">Pasif</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">$0.00</div>
                    <div className="text-sm text-muted-foreground">0%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Günlük Gelir Trendi */}
          <Card>
            <CardHeader>
              <CardTitle>Son 7 Günlük Gelir</CardTitle>
              <CardDescription>
                Günlük gelir değişimi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dailyRevenue.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{day.date}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-xs text-muted-foreground">
                        AdMob: ${day.admob.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Unity: ${day.unity.toFixed(2)}
                      </div>
                      <div className="font-medium">
                        ${day.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="networks" className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Reklam ağı seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Ağlar</SelectItem>
                <SelectItem value="admob">Google AdMob</SelectItem>
                <SelectItem value="unity">Unity Ads</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  Google AdMob
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Gelir:</span>
                    <span className="font-medium">${currentData.admob.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Gösterim:</span>
                    <span className="font-medium">28,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">CTR:</span>
                    <span className="font-medium">2.41%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">eCPM:</span>
                    <span className="font-medium">$3.14</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-black rounded"></div>
                  Unity Ads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Gelir:</span>
                    <span className="font-medium">${currentData.unity.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Gösterim:</span>
                    <span className="font-medium">12,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">CTR:</span>
                    <span className="font-medium">2.39%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">eCPM:</span>
                    <span className="font-medium">$5.41</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  Facebook
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Gelir:</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Durum:</span>
                    <Badge variant="secondary">Pasif</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>En İyi Performans Gösteren Reklamlar</CardTitle>
              <CardDescription>
                Gelir ve CTR bazında en başarılı reklamlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reklam ID</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>Ağ</TableHead>
                    <TableHead>Yerleşim</TableHead>
                    <TableHead>Gösterim</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>eCPM</TableHead>
                    <TableHead>Gelir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformingAds.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-mono text-sm">{ad.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ad.type}</Badge>
                      </TableCell>
                      <TableCell>{ad.network}</TableCell>
                      <TableCell>{ad.placement}</TableCell>
                      <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                      <TableCell>{ad.ctr.toFixed(2)}%</TableCell>
                      <TableCell>${ad.ecpm.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">${ad.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Gelir Trendi</CardTitle>
                <CardDescription>
                  Son 30 günlük gelir değişimi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-200">Artış Trendi</div>
                      <div className="text-sm text-green-600 dark:text-green-300">Son 7 günde %12 artış</div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>En iyi gün:</span>
                      <span className="font-medium">$167.00 (3 Ocak)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>En düşük gün:</span>
                      <span className="font-medium">$141.40 (4 Ocak)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Ortalama:</span>
                      <span className="font-medium">$155.15</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performans Öngörüleri</CardTitle>
                <CardDescription>
                  Gelir optimizasyonu için öneriler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Unity Ads Performansı</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                      Unity Ads eCPM değeri yüksek. Rewarded ad sıklığı artırılabilir.
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Facebook Ağı</h4>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                      Facebook Audience Network pasif. Aktifleştirme düşünülebilir.
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-medium text-green-800 dark:text-green-200">CTR Optimizasyonu</h4>
                    <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                      Mevcut CTR oranı sektör ortalamasının üzerinde.
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
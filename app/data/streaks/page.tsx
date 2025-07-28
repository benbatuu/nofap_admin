"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, TrendingUp, Award, Calendar, RefreshCw } from "lucide-react"
import { useStreakAnalytics } from "@/hooks/use-api"
import { useState } from "react"

export default function StreaksPage() {
  const [timeFilter, setTimeFilter] = useState<string>("all")
  const [limit, setLimit] = useState<number>(10)

  // API Hook
  const { 
    data: streakData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useStreakAnalytics({ 
    timeFilter: timeFilter !== 'all' ? timeFilter : undefined, 
    limit 
  })

  const handleRefresh = () => {
    refetch()
  }
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Streak Takibi</h2>
          <p className="text-muted-foreground">
            Kullanıcıların streak durumlarını ve başarılarını takip edin
          </p>
        </div>
        <div className="flex items-center space-x-2">
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error?.message || 'Veri yüklenirken hata oluştu'}
        </div>
      )}

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Streak</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : streakData?.activeStreaks?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{streakData?.weeklyGrowth || 0} bu hafta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : `${streakData?.averageStreak || 0} gün`}
            </div>
            <p className="text-xs text-muted-foreground">Aktif streakler</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Uzun Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : `${streakData?.longestStreak || 0} gün`}
            </div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Ay Reset</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : streakData?.monthlyResets?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Sıfırlanan streakler</p>
          </CardContent>
        </Card>
      </div>

      {/* Milestone İstatistikleri */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone Başarıları</CardTitle>
          <CardDescription>
            Kullanıcıların ulaştığı önemli streak hedefleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-4">
                Yükleniyor...
              </div>
            ) : streakData?.milestoneStats && streakData.milestoneStats.length > 0 ? (
              streakData.milestoneStats.map((stat, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-20 text-sm font-medium">{stat.milestone}</div>
                  <div className="flex-1">
                    <Progress value={Math.min(stat.percentage * 2, 100)} className="h-2" />
                  </div>
                  <div className="w-16 text-sm text-muted-foreground">{stat.count.toLocaleString()}</div>
                  <div className="w-12 text-sm text-muted-foreground">{stat.percentage}%</div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Henüz milestone verisi bulunmuyor
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Streak Detayları */}
      <Card>
        <CardHeader>
          <CardTitle>Aktif Streak Listesi</CardTitle>
          <CardDescription>
            En yüksek streak&apos;e sahip kullanıcılar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Mevcut Streak</TableHead>
                <TableHead>En Uzun Streak</TableHead>
                <TableHead>Başlangıç</TableHead>
                <TableHead>Son Güncelleme</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Başarılar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : streakData?.topStreaks && streakData.topStreaks.length > 0 ? (
                streakData.topStreaks.map((streak) => (
                  <TableRow key={streak.id}>
                    <TableCell className="font-medium">{streak.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={streak.currentStreak > 90 ? "default" : "secondary"}
                          className={streak.currentStreak > 90 ? "bg-green-500 dark:bg-green-600" : ""}
                        >
                          {streak.currentStreak} gün
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{streak.longestStreak} gün</Badge>
                    </TableCell>
                    <TableCell>{streak.startDate}</TableCell>
                    <TableCell>{streak.lastUpdate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={streak.status === "active" ? "default" : "destructive"}
                        className={streak.status === "active" ? "bg-green-500 dark:bg-green-600" : ""}
                      >
                        {streak.status === "active" ? "Aktif" : "Reset"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {streak.milestones.map((milestone, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {milestone}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Henüz streak verisi bulunmuyor
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
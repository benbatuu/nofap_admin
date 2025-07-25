"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, Award, Calendar } from "lucide-react"

const streakData = [
  {
    id: "1",
    username: "streak_master",
    currentStreak: 127,
    longestStreak: 180,
    startDate: "2023-08-15",
    lastUpdate: "2024-01-25",
    status: "active",
    milestones: ["7 days", "30 days", "90 days"]
  },
  {
    id: "2",
    username: "clean_warrior",
    currentStreak: 45,
    longestStreak: 67,
    startDate: "2023-12-10",
    lastUpdate: "2024-01-25",
    status: "active",
    milestones: ["7 days", "30 days"]
  },
  {
    id: "3",
    username: "new_beginning",
    currentStreak: 0,
    longestStreak: 23,
    startDate: "2024-01-25",
    lastUpdate: "2024-01-25",
    status: "reset",
    milestones: ["7 days"]
  }
]

const milestoneStats = [
  { milestone: "7 gün", count: 8234, percentage: 18.2 },
  { milestone: "30 gün", count: 3456, percentage: 7.6 },
  { milestone: "90 gün", count: 1234, percentage: 2.7 },
  { milestone: "365 gün", count: 234, percentage: 0.5 }
]

export default function StreaksPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Streak Takibi</h2>
          <p className="text-muted-foreground">
            Kullanıcıların streak durumlarını ve başarılarını takip edin
          </p>
        </div>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Streak</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,234</div>
            <p className="text-xs text-muted-foreground">+5.2% bu hafta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23 gün</div>
            <p className="text-xs text-muted-foreground">+2 gün artış</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Uzun Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">547 gün</div>
            <p className="text-xs text-muted-foreground">streak_legend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Ay Reset</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,456</div>
            <p className="text-xs text-muted-foreground">-8% geçen aydan</p>
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
            {milestoneStats.map((stat, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-20 text-sm font-medium">{stat.milestone}</div>
                <div className="flex-1">
                  <Progress value={stat.percentage * 5} className="h-2" />
                </div>
                <div className="w-16 text-sm text-muted-foreground">{stat.count}</div>
                <div className="w-12 text-sm text-muted-foreground">{stat.percentage}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Streak Detayları */}
      <Card>
        <CardHeader>
          <CardTitle>Aktif Streak Listesi</CardTitle>
          <CardDescription>
            En yüksek streak`e sahip kullanıcılar
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
              {streakData.map((streak) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
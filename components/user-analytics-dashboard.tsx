'use client'

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Calendar, 
  Target,
  Award,
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw
} from "lucide-react"

interface UserAnalyticsDashboardProps {
  className?: string
}

// Mock data - in real implementation, this would come from API
const mockAnalyticsData = {
  overview: {
    totalUsers: 15420,
    activeUsers: 8934,
    premiumUsers: 2156,
    averageStreak: 12.5,
    totalStreaks: 45678,
    longestStreak: 365,
    relapseRate: 23.4,
    retentionRate: 76.8
  },
  userGrowth: [
    { month: 'Jan', users: 1200, active: 800, premium: 150 },
    { month: 'Feb', users: 1350, active: 920, premium: 180 },
    { month: 'Mar', users: 1500, active: 1100, premium: 220 },
    { month: 'Apr', users: 1680, active: 1250, premium: 280 },
    { month: 'May', users: 1820, active: 1400, premium: 320 },
    { month: 'Jun', users: 2100, active: 1650, premium: 380 }
  ],
  streakDistribution: [
    { range: '1-7 days', count: 3420, percentage: 35.2 },
    { range: '8-30 days', count: 2890, percentage: 29.7 },
    { range: '31-90 days', count: 1980, percentage: 20.4 },
    { range: '91-180 days', count: 890, percentage: 9.2 },
    { range: '181-365 days', count: 420, percentage: 4.3 },
    { range: '365+ days', count: 120, percentage: 1.2 }
  ],
  topUsers: [
    { id: '1', name: 'John Doe', email: 'john@example.com', streak: 365, isPremium: true, totalTasks: 1250 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', streak: 298, isPremium: true, totalTasks: 980 },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', streak: 245, isPremium: false, totalTasks: 756 },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', streak: 189, isPremium: true, totalTasks: 623 },
    { id: '5', name: 'David Brown', email: 'david@example.com', streak: 156, isPremium: false, totalTasks: 534 }
  ],
  recentActivity: [
    { id: '1', user: 'John Doe', action: 'Completed daily task', timestamp: '2 minutes ago', type: 'success' },
    { id: '2', user: 'Jane Smith', action: 'Reached 300-day streak', timestamp: '15 minutes ago', type: 'achievement' },
    { id: '3', user: 'Mike Johnson', action: 'Reported relapse', timestamp: '1 hour ago', type: 'warning' },
    { id: '4', user: 'Sarah Wilson', action: 'Upgraded to premium', timestamp: '2 hours ago', type: 'info' },
    { id: '5', user: 'David Brown', action: 'Joined community', timestamp: '3 hours ago', type: 'success' }
  ],
  engagementMetrics: {
    dailyActiveUsers: 5420,
    weeklyActiveUsers: 8934,
    monthlyActiveUsers: 12456,
    averageSessionTime: '24 minutes',
    taskCompletionRate: 78.5,
    messageResponseRate: 65.2
  }
}

export function UserAnalyticsDashboard({ className }: UserAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleExport = () => {
    // Export functionality
    const csvData = mockAnalyticsData.topUsers.map(user => [
      user.name,
      user.email,
      user.streak,
      user.isPremium ? 'Premium' : 'Free',
      user.totalTasks
    ])
    
    const headers = ['Name', 'Email', 'Streak', 'Plan', 'Total Tasks']
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'user_analytics.csv'
    a.click()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case 'achievement':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      case 'warning':
        return <div className="w-2 h-2 bg-orange-500 rounded-full" />
      case 'info':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into user behavior and engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalyticsData.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalyticsData.overview.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.2% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Streak</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalyticsData.overview.averageStreak} days</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2.1 days from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalyticsData.overview.retentionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" />
                -1.2% from last month
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="streaks">Streak Analysis</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  User Growth Trend
                </CardTitle>
                <CardDescription>Monthly user acquisition and retention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Chart visualization would go here</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Showing growth from {mockAnalyticsData.userGrowth[0].users} to {mockAnalyticsData.userGrowth[mockAnalyticsData.userGrowth.length - 1].users} users
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest user actions and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalyticsData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.user}</p>
                        <p className="text-xs text-muted-foreground">{activity.action}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>Key performance indicators for user engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{mockAnalyticsData.engagementMetrics.dailyActiveUsers.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Daily Active Users</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{mockAnalyticsData.engagementMetrics.taskCompletionRate}%</div>
                  <p className="text-sm text-muted-foreground">Task Completion Rate</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{mockAnalyticsData.engagementMetrics.averageSessionTime}</div>
                  <p className="text-sm text-muted-foreground">Avg Session Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streaks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Streak Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Streak Distribution
                </CardTitle>
                <CardDescription>How users are distributed across streak ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalyticsData.streakDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-blue-${500 + index * 100}`} />
                        <span className="text-sm">{item.range}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.count.toLocaleString()}</span>
                        <Badge variant="secondary">{item.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Streak Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Streak Statistics</CardTitle>
                <CardDescription>Key metrics about user streaks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Total Streaks</p>
                      <p className="text-xs text-muted-foreground">All active streaks</p>
                    </div>
                    <div className="text-2xl font-bold">{mockAnalyticsData.overview.totalStreaks.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Longest Streak</p>
                      <p className="text-xs text-muted-foreground">Record achievement</p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{mockAnalyticsData.overview.longestStreak} days</div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Relapse Rate</p>
                      <p className="text-xs text-muted-foreground">Monthly average</p>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{mockAnalyticsData.overview.relapseRate}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{mockAnalyticsData.engagementMetrics.dailyActiveUsers.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Users active today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{mockAnalyticsData.engagementMetrics.weeklyActiveUsers.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Users active this week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{mockAnalyticsData.engagementMetrics.monthlyActiveUsers.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Users active this month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performers
              </CardTitle>
              <CardDescription>Users with the highest streaks and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Streak</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Total Tasks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAnalyticsData.topUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {index + 1}
                          {index === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                          {index === 1 && <Award className="h-4 w-4 text-gray-400" />}
                          {index === 2 && <Award className="h-4 w-4 text-amber-600" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {user.streak} days
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isPremium ? (
                          <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.totalTasks.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
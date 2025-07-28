'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Calendar as CalendarIcon,
  AlertTriangle,
  Award,
  Activity,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  RefreshCw,
  Clock,
  Flame,
  CheckCircle,
  XCircle
} from "lucide-react"
import { format } from "date-fns"

interface StreakRelapseTrackerProps {
  userId?: string
  className?: string
}

// Mock data - in real implementation, this would come from API
const mockStreakData = {
  currentStreak: 45,
  longestStreak: 127,
  totalStreaks: 8,
  averageStreak: 23.5,
  streakHistory: [
    { id: '1', startDate: '2024-01-01', endDate: '2024-01-15', duration: 15, reason: 'Completed' },
    { id: '2', startDate: '2024-01-20', endDate: '2024-02-10', duration: 21, reason: 'Relapse' },
    { id: '3', startDate: '2024-02-15', endDate: '2024-04-01', duration: 45, reason: 'Relapse' },
    { id: '4', startDate: '2024-04-05', endDate: null, duration: 45, reason: 'Active' }
  ]
}

const mockRelapseData = {
  totalRelapses: 12,
  relapseRate: 23.4,
  averageTimeBetweenRelapses: 18.5,
  relapseHistory: [
    { 
      id: '1', 
      date: '2024-02-10', 
      trigger: 'Stress', 
      severity: 'moderate', 
      notes: 'Work deadline pressure',
      recoveryTime: 5,
      streakBroken: 21
    },
    { 
      id: '2', 
      date: '2024-04-01', 
      trigger: 'Social', 
      severity: 'mild', 
      notes: 'Party with friends',
      recoveryTime: 2,
      streakBroken: 45
    },
    { 
      id: '3', 
      date: '2024-03-15', 
      trigger: 'Boredom', 
      severity: 'severe', 
      notes: 'Weekend with nothing to do',
      recoveryTime: 10,
      streakBroken: 32
    }
  ],
  commonTriggers: [
    { trigger: 'Stress', count: 5, percentage: 41.7 },
    { trigger: 'Boredom', count: 3, percentage: 25.0 },
    { trigger: 'Social', count: 2, percentage: 16.7 },
    { trigger: 'Loneliness', count: 1, percentage: 8.3 },
    { trigger: 'Other', count: 1, percentage: 8.3 }
  ]
}

export function StreakRelapseTracker({ userId, className }: StreakRelapseTrackerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isAddingRelapse, setIsAddingRelapse] = useState(false)
  const [relapseForm, setRelapseForm] = useState({
    date: new Date(),
    trigger: '',
    severity: 'mild',
    notes: '',
    streakBroken: 0
  })

  const handleAddRelapse = () => {
    // In real implementation, this would call an API
    console.log('Adding relapse:', relapseForm)
    setIsAddingRelapse(false)
    setRelapseForm({
      date: new Date(),
      trigger: '',
      severity: 'mild',
      notes: '',
      streakBroken: 0
    })
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'mild':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Mild</Badge>
      case 'moderate':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Moderate</Badge>
      case 'severe':
        return <Badge variant="destructive">Severe</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStreakStatusBadge = (reason: string) => {
    switch (reason) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'Completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case 'Relapse':
        return <Badge variant="destructive">Relapse</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Streak & Relapse Tracking</h2>
          <p className="text-muted-foreground">
            Monitor progress and identify patterns in recovery journey
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Dialog open={isAddingRelapse} onOpenChange={setIsAddingRelapse}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Report Relapse
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Relapse</DialogTitle>
                <DialogDescription>
                  Record a relapse incident to track patterns and improve recovery
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="relapse-date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {relapseForm.date ? format(relapseForm.date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={relapseForm.date}
                        onSelect={(date) => date && setRelapseForm({...relapseForm, date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="trigger">Trigger</Label>
                  <Select value={relapseForm.trigger} onValueChange={(value) => setRelapseForm({...relapseForm, trigger: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stress">Stress</SelectItem>
                      <SelectItem value="boredom">Boredom</SelectItem>
                      <SelectItem value="social">Social Pressure</SelectItem>
                      <SelectItem value="loneliness">Loneliness</SelectItem>
                      <SelectItem value="anxiety">Anxiety</SelectItem>
                      <SelectItem value="depression">Depression</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={relapseForm.severity} onValueChange={(value) => setRelapseForm({...relapseForm, severity: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="streak-broken">Streak Broken (days)</Label>
                  <Input
                    id="streak-broken"
                    type="number"
                    value={relapseForm.streakBroken}
                    onChange={(e) => setRelapseForm({...relapseForm, streakBroken: parseInt(e.target.value) || 0})}
                    placeholder="Enter streak length"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={relapseForm.notes}
                    onChange={(e) => setRelapseForm({...relapseForm, notes: e.target.value})}
                    placeholder="Additional details about the incident..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingRelapse(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRelapse}>
                    Report Relapse
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{mockStreakData.currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3 days this week
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mockStreakData.longestStreak} days</div>
            <p className="text-xs text-muted-foreground">Personal best record</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Relapses</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockRelapseData.totalRelapses}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" />
                -2 from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Streak</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mockStreakData.averageStreak} days</div>
            <p className="text-xs text-muted-foreground">Across all attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="streaks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="streaks">Streak History</TabsTrigger>
          <TabsTrigger value="relapses">Relapse Analysis</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="streaks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Streak History
              </CardTitle>
              <CardDescription>Your journey of recovery streaks over time</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStreakData.streakHistory.map((streak) => (
                    <TableRow key={streak.id}>
                      <TableCell>{format(new Date(streak.startDate), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        {streak.endDate ? format(new Date(streak.endDate), "MMM dd, yyyy") : "Ongoing"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {streak.duration} days
                        </Badge>
                      </TableCell>
                      <TableCell>{getStreakStatusBadge(streak.reason)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {streak.reason !== 'Active' && (
                            <Button variant="ghost" size="sm" className="text-red-600">
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
        </TabsContent>

        <TabsContent value="relapses" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Relapse History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Relapses
                </CardTitle>
                <CardDescription>Latest relapse incidents and details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRelapseData.relapseHistory.map((relapse) => (
                    <div key={relapse.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{format(new Date(relapse.date), "MMM dd, yyyy")}</span>
                          {getSeverityBadge(relapse.severity)}
                        </div>
                        <Badge variant="outline">{relapse.streakBroken} day streak</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <strong>Trigger:</strong> {relapse.trigger}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <strong>Recovery Time:</strong> {relapse.recoveryTime} days
                      </div>
                      {relapse.notes && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Notes:</strong> {relapse.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Common Triggers */}
            <Card>
              <CardHeader>
                <CardTitle>Common Triggers</CardTitle>
                <CardDescription>Most frequent relapse triggers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockRelapseData.commonTriggers.map((trigger, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-red-${400 + index * 100}`} />
                        <span className="text-sm font-medium">{trigger.trigger}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{trigger.count} times</span>
                        <Badge variant="secondary">{trigger.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Relapse Patterns</CardTitle>
                <CardDescription>Identify trends and patterns in relapses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Pattern analysis chart would go here</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Showing relapse frequency by day of week, time of day, etc.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recovery Insights</CardTitle>
                <CardDescription>Key insights from your recovery data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">Positive Trend</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your average streak length has increased by 40% over the last 3 months
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800 dark:text-blue-200">Pattern Detected</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Most relapses occur on weekends - consider planning more activities
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-950">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-800 dark:text-orange-200">Watch Out</span>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Stress is your most common trigger - consider stress management techniques
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>Track your overall recovery progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{mockStreakData.totalStreaks}</div>
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{mockRelapseData.averageTimeBetweenRelapses}</div>
                  <p className="text-sm text-muted-foreground">Avg Days Between Relapses</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{(100 - mockRelapseData.relapseRate).toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
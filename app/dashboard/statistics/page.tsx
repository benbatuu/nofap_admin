'use client'

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, ShoppingCart, Eye, Clock, Target, Zap, ArrowUpRight, ArrowDownRight, CheckCircle, UserCheck, Crown, User } from 'lucide-react';
import { useStatistics } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart, Line, AreaChart, Area, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart
} from 'recharts';

// Icon mapping for dynamic data
const iconMap = {
  DollarSign,
  Users,
  ShoppingCart,
  Eye,
  TrendingUp,
  Clock,
  Target,
  Zap,
  CheckCircle,
  UserCheck
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Category colors for pie chart
const categoryColors = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', 
  '#ef4444', '#ec4899', '#8b5cf6', '#6366f1'
];

export default function Page() {
  const { data: statisticsData, isLoading, error } = useStatistics();

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Veri Yüklenemedi</h3>
            <p className="text-muted-foreground">İstatistik verileri yüklenirken bir hata oluştu.</p>
          </div>
        </div>
      </div>
    )
  }

  const keyMetrics = statisticsData?.keyMetrics || [];
  const revenueData = statisticsData?.revenueData || [];
  const categoryData = statisticsData?.popularCategories?.map((cat, index) => ({
    name: cat.name,
    value: cat.count,
    color: categoryColors[index % categoryColors.length]
  })) || [];
  const userGrowthData = statisticsData?.userGrowthData || [];
  const taskCompletionData = statisticsData?.taskCompletionData || [];
  const topUsers = statisticsData?.topUsers || [];

  // Generate hourly data for demo (since it's not in the API response)
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    users: Math.floor(Math.random() * 100) + 20
  }));

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Real-time insights and performance metrics
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 grid-cols-2">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-28" />
              </CardContent>
            </Card>
          ))
        ) : (
          keyMetrics.map((metric: any, i: number) => {
            const Icon = iconMap[metric.icon as keyof typeof iconMap] || DollarSign;
            const TrendIcon = metric.trend === 'up' ? ArrowUpRight : ArrowDownRight;
            return (
              <Card key={i} className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{metric.value}</div>
                  <div className="flex items-center gap-1">
                    <TrendIcon className={`h-4 w-4 ${metric.color}`} />
                    <span className={`text-sm font-medium ${metric.color}`}>{metric.change}</span>
                    <span className="text-xs text-muted-foreground ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue & User Growth Trend */}
        <Card className="lg:col-span-2 border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">Revenue & User Growth</h3>
                <p className="text-sm text-muted-foreground">Monthly performance overview</p>
              </div>
              <div className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                2024-2025
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fill="url(#revenueGradient)"
                    name="Revenue (TRY)"
                  />
                  <Bar dataKey="transactions" fill="#10b981" name="Transactions" opacity={0.7} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Task Completion Rate */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <h3 className="text-xl font-semibold">Task Completion</h3>
            <p className="text-sm text-muted-foreground">Daily completion rates</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={taskCompletionData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Completed Tasks"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    name="Total Tasks"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Category Breakdown - Pie Chart */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold">Popular Categories</h3>
            <p className="text-sm text-muted-foreground">Task category distribution</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* User Growth - Line Chart */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold">User Growth</h3>
            <p className="text-sm text-muted-foreground">Monthly user acquisition</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fill="url(#userGrowthGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Hourly Traffic - Simulated Data */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold">Hourly Activity</h3>
            <p className="text-sm text-muted-foreground">User activity by hour</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#trafficGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Users Table */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Top Active Users</h3>
              <p className="text-sm text-muted-foreground">Most engaged users this month</p>
            </div>
            <div className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
              Live Data
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {topUsers.slice(0, 8).map((user, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      {user.isPremium && (
                        <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium">{user.name}</span>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{user.streak}</div>
                      <div className="text-xs text-muted-foreground">Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{user._count.tasks}</div>
                      <div className="text-xs text-muted-foreground">Tasks</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {user.isPremium ? (
                        <span className="text-xs bg-yellow-500/20 text-yellow-700 px-2 py-1 rounded-full">Premium</span>
                      ) : (
                        <span className="text-xs bg-gray-500/20 text-gray-700 px-2 py-1 rounded-full">Free</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
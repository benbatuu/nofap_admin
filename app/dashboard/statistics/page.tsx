'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, ShoppingCart, Eye, Clock, Target, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar, ComposedChart
} from 'recharts';

const Skeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md ${className}`} />
  );
};

// Enhanced data with more variety
const keyMetrics = [
  { title: "Total Revenue", value: "$54,239", change: "+12.5%", icon: DollarSign, trend: "up", color: "text-green-500" },
  { title: "Active Users", value: "8,432", change: "+18.2%", icon: Users, trend: "up", color: "text-blue-500" },
  { title: "Orders", value: "1,247", change: "-2.3%", icon: ShoppingCart, trend: "down", color: "text-red-500" },
  { title: "Page Views", value: "32,156", change: "+24.1%", icon: Eye, trend: "up", color: "text-purple-500" }
];

const revenueData = [
  { month: "Jan", revenue: 4000, profit: 2800, users: 240 },
  { month: "Feb", revenue: 3000, profit: 1800, users: 220 },
  { month: "Mar", revenue: 5000, profit: 3500, users: 290 },
  { month: "Apr", revenue: 4500, profit: 3200, users: 270 },
  { month: "May", revenue: 6000, profit: 4200, users: 320 },
  { month: "Jun", revenue: 5500, profit: 3900, users: 310 },
  { month: "Jul", revenue: 7000, profit: 5000, users: 380 },
  { month: "Aug", revenue: 6500, profit: 4600, users: 360 },
  { month: "Sep", revenue: 8000, profit: 5800, users: 420 },
  { month: "Oct", revenue: 7500, profit: 5400, users: 400 },
  { month: "Nov", revenue: 9000, profit: 6500, users: 480 },
  { month: "Dec", revenue: 8500, profit: 6200, users: 460 }
];

const categoryData = [
  { name: "Electronics", value: 4500, color: "#8b5cf6", percentage: 35 },
  { name: "Clothing", value: 3200, color: "#06b6d4", percentage: 25 },
  { name: "Books", value: 2100, color: "#10b981", percentage: 16 },
  { name: "Home & Garden", value: 1800, color: "#f59e0b", percentage: 14 },
  { name: "Sports", value: 1300, color: "#ef4444", percentage: 10 }
];

const trafficData = [
  { name: "Desktop", value: 45, color: "#8b5cf6" },
  { name: "Mobile", value: 35, color: "#06b6d4" },
  { name: "Tablet", value: 15, color: "#10b981" },
  { name: "Other", value: 5, color: "#f59e0b" }
];

const performanceData = [
  { name: "Conversion Rate", value: 68, target: 75, color: "#8b5cf6" },
  { name: "Bounce Rate", value: 32, target: 25, color: "#06b6d4" },
  { name: "User Retention", value: 84, target: 80, color: "#10b981" },
  { name: "Goal Completion", value: 76, target: 85, color: "#f59e0b" }
];

const hourlyData = [
  { hour: "00", users: 120 }, { hour: "01", users: 95 }, { hour: "02", users: 80 },
  { hour: "03", users: 75 }, { hour: "04", users: 85 }, { hour: "05", users: 110 },
  { hour: "06", users: 180 }, { hour: "07", users: 280 }, { hour: "08", users: 420 },
  { hour: "09", users: 520 }, { hour: "10", users: 580 }, { hour: "11", users: 650 },
  { hour: "12", users: 720 }, { hour: "13", users: 680 }, { hour: "14", users: 620 },
  { hour: "15", users: 580 }, { hour: "16", users: 540 }, { hour: "17", users: 480 },
  { hour: "18", users: 420 }, { hour: "19", users: 380 }, { hour: "20", users: 320 },
  { hour: "21", users: 280 }, { hour: "22", users: 220 }, { hour: "23", users: 160 }
];

const topProducts = [
  { product: "iPhone 14 Pro", sales: 1234, revenue: "$123,400", growth: "+12%", trend: "up" },
  { product: "MacBook Air", sales: 867, revenue: "$86,700", growth: "+8%", trend: "up" },
  { product: "iPad Pro", sales: 543, revenue: "$54,300", growth: "+15%", trend: "up" },
  { product: "AirPods Pro", sales: 2156, revenue: "$43,120", growth: "+22%", trend: "up" },
  { product: "Apple Watch", sales: 876, revenue: "$35,040", growth: "-5%", trend: "down" },
  { product: "Mac Studio", sales: 234, revenue: "$46,800", growth: "+18%", trend: "up" }
];

const CustomTooltip = ({ active, payload, label }:any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry:any, index:number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

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
          keyMetrics.map((metric, i) => {
            const Icon = metric.icon;
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
        {/* Revenue Trend - Area Chart */}
        <Card className="lg:col-span-2 border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">Revenue & Profit Trend</h3>
                <p className="text-sm text-muted-foreground">Monthly performance overview</p>
              </div>
              <div className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                2024
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
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
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
                    name="Revenue ($)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    fill="url(#profitGradient)" 
                    name="Profit ($)"
                  />
                  <Bar dataKey="users" fill="#10b981" name="Users" opacity={0.7} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Performance Radial Chart */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <h3 className="text-xl font-semibold">Performance Metrics</h3>
            <p className="text-sm text-muted-foreground">Current vs target</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={performanceData}>
                  <RadialBar 
                    // Removed unsupported minAngle property
                    label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }} 
                    background 
                    dataKey="value"
                    fill="#8b5cf6"
                  />
                  <Legend 
                    iconSize={10} 
                    wrapperStyle={{ fontSize: '12px' }} 
                    verticalAlign="bottom" 
                    align="center"
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
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
            <h3 className="text-lg font-semibold">Sales by Category</h3>
            <p className="text-sm text-muted-foreground">Revenue distribution</p>
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

        {/* Hourly Traffic - Line Chart */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold">Hourly Traffic</h3>
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
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
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

        {/* Traffic Sources - Donut Chart */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold">Traffic Sources</h3>
            <p className="text-sm text-muted-foreground">Device breakdown</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={trafficData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {trafficData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {trafficData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Top Performing Products</h3>
              <p className="text-sm text-muted-foreground">Best sellers this month</p>
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
              {topProducts.map((product, i) => {
                const TrendIcon = product.trend === 'up' ? ArrowUpRight : ArrowDownRight;
                const trendColor = product.trend === 'up' ? 'text-green-500' : 'text-red-500';
                return (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="flex-1">
                      <span className="font-medium">{product.product}</span>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                      <span className="w-20 text-right">{product.sales.toLocaleString()} sold</span>
                      <span className="w-24 text-right font-medium">{product.revenue}</span>
                      <div className="flex items-center gap-1 w-16 justify-end">
                        <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                        <span className={`font-medium ${trendColor}`}>{product.growth}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
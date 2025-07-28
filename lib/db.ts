// Database connection and models
// Updated to use Prisma for real database operations

import { prisma } from './prisma'
import type { 
  User, 
  Message, 
  Task, 
  Notification, 
  BillingLog, 
  Product, 
  Role, 
  Permission,
  UserStatus,
  MessageType,
  MessageStatus,
  TaskStatus,
  NotificationType,
  NotificationStatus,
  NotificationFrequency,
  BillingStatus,
  ProductType
} from './generated/prisma'

// Type definitions for API responses
export interface UserResponse {
  id: string
  username: string
  email: string
  streak: number
  joinDate: string
  status: UserStatus
  isPremium: boolean
  lastActive: string
}

export interface UserNotification {
  id: string
  name: string
  email: string
  avatar: string
  globalEnabled: boolean
  notifications: any
  lastActivity: string
}

// Utility function for relative time
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Şimdi'
  if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} saat önce`

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} gün önce`
}

// User functions
export async function getUsers(params: { page?: number; limit?: number; search?: string; status?: UserStatus; isPremium?: boolean } = {}) {
  const { page = 1, limit = 10, search = '', status, isPremium } = params

  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (status) {
    where.status = status
  }

  if (isPremium !== undefined) {
    where.isPremium = isPremium
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            tasks: true,
            messages: true,
            activities: true,
            billingLogs: true
          }
        }
      }
    }),
    prisma.user.count({ where })
  ])

  // Transform users for the frontend
  const transformedUsers: UserResponse[] = users.map(user => ({
    id: user.id,
    username: user.name,
    email: user.email,
    streak: user.streak,
    joinDate: user.createdAt.toISOString(),
    status: user.status,
    isPremium: user.isPremium,
    lastActive: getRelativeTime(user.lastActivity)
  }))

  return {
    users: transformedUsers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: { createdDate: 'desc' },
        take: 5
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      activities: {
        orderBy: { timestamp: 'desc' },
        take: 10
      },
      billingLogs: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      _count: {
        select: {
          tasks: true,
          messages: true,
          activities: true,
          billingLogs: true
        }
      }
    }
  })
}

export async function updateUser(id: string, updates: {
  name?: string
  email?: string
  avatar?: string
  globalEnabled?: boolean
  notifications?: any
  isPremium?: boolean
  status?: UserStatus
  streak?: number
}) {
  return prisma.user.update({
    where: { id },
    data: {
      ...updates,
      ...(updates.status && { lastActivity: new Date() })
    }
  })
}

// Message functions
export async function getMessages(page = 1, limit = 10, type?: MessageType, status?: MessageStatus) {
  const where: any = {}

  if (type && type !== 'system') {
    where.type = type
  }

  if (status && status !== 'pending') {
    where.status = status
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    }),
    prisma.message.count({ where })
  ])

  return {
    messages,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

// Task functions
export async function getTasks(page = 1, limit = 10, status?: TaskStatus, userId?: string) {
  const where: any = {}

  if (status && status !== 'active') {
    where.status = status
  }

  if (userId && userId !== 'all') {
    where.userId = userId
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdDate: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    }),
    prisma.task.count({ where })
  ])

  return {
    tasks,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

// Dashboard functions
export async function getDashboardStats() {
  const [
    totalUsers,
    activeUsers,
    premiumUsers,
    bannedUsers,
    totalMessages,
    pendingMessages,
    totalTasks,
    activeTasks,
    completedTasks
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'active' } }),
    prisma.user.count({ where: { isPremium: true } }),
    prisma.user.count({ where: { status: 'banned' } }),
    prisma.message.count(),
    prisma.message.count({ where: { status: 'pending' } }),
    prisma.task.count(),
    prisma.task.count({ where: { status: 'active' } }),
    prisma.task.count({ where: { status: 'completed' } })
  ])

  return {
    totalUsers,
    activeUsers,
    premiumUsers,
    bannedUsers,
    totalMessages,
    pendingMessages,
    totalTasks,
    activeTasks,
    completedTasks
  }
}

export async function getRecentActivities(limit = 10) {
  return prisma.activity.findMany({
    take: limit,
    orderBy: { timestamp: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })
}

export async function getSystemStatus() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Get actual system metrics from database or monitoring table
    const systemMetrics = await prisma.systemMetric.findMany({
      where: {
        metricType: { in: ['api_uptime', 'database_uptime', 'notifications_uptime'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    const getUptimePercentage = (metricType: string) => {
      const metric = systemMetrics.find(m => m.metricType === metricType)
      return metric?.value ? `${metric.value}%` : '99.9%'
    }

    const getStatus = (metricType: string) => {
      const metric = systemMetrics.find(m => m.metricType === metricType)
      return metric?.status || 'online'
    }
    
    return {
      api: { 
        status: getStatus('api_uptime'), 
        uptime: getUptimePercentage('api_uptime') 
      },
      database: { 
        status: getStatus('database_uptime'), 
        uptime: getUptimePercentage('database_uptime') 
      },
      notifications: { 
        status: getStatus('notifications_uptime'), 
        uptime: getUptimePercentage('notifications_uptime') 
      }
    }
  } catch (error) {
    return {
      api: { status: 'offline', uptime: '0%' },
      database: { status: 'offline', uptime: '0%' },
      notifications: { status: 'offline', uptime: '0%' }
    }
  }
}

export async function getMonthlyStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const [
    newRegistrations,
    monthlyRevenue,
    completedTasks,
    totalMessages,
    premiumUsers,
    totalUsers,
    averageStreak,
    adRevenue
  ] = await Promise.all([
    prisma.user.count({
      where: {
        createdAt: { gte: startOfMonth }
      }
    }),
    prisma.billingLog.aggregate({
      where: {
        status: 'success',
        createdAt: { gte: startOfMonth }
      },
      _sum: { amount: true }
    }),
    prisma.task.count({
      where: {
        status: 'completed',
        createdDate: { gte: startOfMonth }
      }
    }),
    prisma.message.count({
      where: {
        createdAt: { gte: startOfMonth }
      }
    }),
    prisma.user.count({
      where: { isPremium: true }
    }),
    prisma.user.count(),
    prisma.user.aggregate({
      _avg: { streak: true }
    }),
    // Get ad revenue from ads table or billing logs with ad-related descriptions
    prisma.billingLog.aggregate({
      where: {
        status: 'success',
        createdAt: { gte: startOfMonth },
        description: { contains: 'ad', mode: 'insensitive' }
      },
      _sum: { amount: true }
    })
  ])

  const premiumConversion = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0
  const totalMonthlyRevenue = monthlyRevenue._sum.amount || 0
  const adRevenueAmount = adRevenue._sum.amount || 0
  const premiumRevenueAmount = totalMonthlyRevenue - adRevenueAmount

  return {
    newRegistrations,
    premiumConversion: Math.round(premiumConversion * 10) / 10,
    averageStreak: Math.round((averageStreak._avg.streak || 0) * 10) / 10,
    totalRevenue: totalMonthlyRevenue,
    adRevenue: adRevenueAmount,
    premiumRevenue: premiumRevenueAmount,
    completedTasks,
    totalMessages
  }
}

// Statistics functions
export async function getStatisticsData() {
  const [
    totalRevenue,
    activeUsers,
    totalOrders,
    totalViews,
    monthlyData,
    categoryData,
    trafficData,
    previousMonthRevenue,
    previousMonthUsers,
    previousMonthOrders,
    previousMonthViews
  ] = await Promise.all([
    prisma.billingLog.aggregate({
      where: { status: 'success' },
      _sum: { amount: true }
    }),
    prisma.user.count({ where: { status: 'active' } }),
    prisma.billingLog.count({ where: { status: 'success' } }),
    prisma.activity.count(),
    getMonthlyRevenueData(),
    getCategoryData(),
    getTrafficData(),
    getPreviousMonthRevenue(),
    getPreviousMonthUsers(),
    getPreviousMonthOrders(),
    getPreviousMonthViews()
  ])

  // Calculate percentage changes
  const revenueChange = calculatePercentageChange(totalRevenue._sum.amount || 0, previousMonthRevenue)
  const usersChange = calculatePercentageChange(activeUsers, previousMonthUsers)
  const ordersChange = calculatePercentageChange(totalOrders, previousMonthOrders)
  const viewsChange = calculatePercentageChange(totalViews, previousMonthViews)

  return {
    keyMetrics: [
      {
        title: "Total Revenue",
        value: `$${(totalRevenue._sum.amount || 0).toLocaleString()}`,
        change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
        icon: "DollarSign",
        trend: revenueChange >= 0 ? "up" : "down",
        color: revenueChange >= 0 ? "text-green-500" : "text-red-500"
      },
      {
        title: "Active Users",
        value: activeUsers.toLocaleString(),
        change: `${usersChange >= 0 ? '+' : ''}${usersChange.toFixed(1)}%`,
        icon: "Users",
        trend: usersChange >= 0 ? "up" : "down",
        color: usersChange >= 0 ? "text-blue-500" : "text-red-500"
      },
      {
        title: "Orders",
        value: totalOrders.toLocaleString(),
        change: `${ordersChange >= 0 ? '+' : ''}${ordersChange.toFixed(1)}%`,
        icon: "ShoppingCart",
        trend: ordersChange >= 0 ? "up" : "down",
        color: ordersChange >= 0 ? "text-green-500" : "text-red-500"
      },
      {
        title: "Page Views",
        value: totalViews.toLocaleString(),
        change: `${viewsChange >= 0 ? '+' : ''}${viewsChange.toFixed(1)}%`,
        icon: "Eye",
        trend: viewsChange >= 0 ? "up" : "down",
        color: viewsChange >= 0 ? "text-purple-500" : "text-red-500"
      }
    ],
    revenueData: monthlyData,
    categoryData,
    trafficData
  }
}

async function getMonthlyRevenueData() {
  const data = []
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    const [revenue, userCount] = await Promise.all([
      prisma.billingLog.aggregate({
        where: {
          status: 'success',
          createdAt: {
            gte: date,
            lt: nextDate
          }
        },
        _sum: { amount: true }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      })
    ])

    data.push({
      month: date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
      revenue: revenue._sum.amount || 0,
      profit: Math.round((revenue._sum.amount || 0) * 0.7), // Assuming 70% profit margin
      users: userCount
    })
  }

  return data
}

// Role functions
export async function getRoles(params: { search?: string } = {}) {
  const { search = '' } = params

  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
  }

  return prisma.role.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  })
}

export async function getRoleById(id: string) {
  return prisma.role.findUnique({
    where: { id }
  })
}

export async function createRole(data: { name: string; description: string; permissions: string[] }) {
  return prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
      permissions: data.permissions,
      userCount: 0
    }
  })
}

export async function updateRole(id: string, data: { name?: string; description?: string; permissions?: string[] }) {
  return prisma.role.update({
    where: { id },
    data
  })
}

export async function deleteRole(id: string) {
  await prisma.role.delete({
    where: { id }
  })
  return true
}

// Permission functions
export async function getPermissions(params: { search?: string } = {}) {
  const { search = '' } = params

  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } }
    ]
  }

  return prisma.permission.findMany({
    where,
    orderBy: { name: 'asc' }
  })
}

export async function getPermissionById(id: string) {
  return prisma.permission.findUnique({
    where: { id }
  })
}

export async function createPermission(data: { name: string; description: string; category: string }) {
  return prisma.permission.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      rolesCount: 0
    }
  })
}

export async function updatePermission(id: string, data: { name?: string; description?: string; category?: string }) {
  return prisma.permission.update({
    where: { id },
    data
  })
}

export async function deletePermission(id: string) {
  await prisma.permission.delete({
    where: { id }
  })
  return true
}

// User notifications functions
export async function getUserNotifications(): Promise<UserNotification[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      globalEnabled: true,
      notifications: true,
      lastActivity: true
    },
    orderBy: { name: 'asc' }
  })

  return users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || user.name.substring(0, 2).toUpperCase(),
    globalEnabled: user.globalEnabled,
    notifications: user.notifications,
    lastActivity: user.lastActivity.toISOString().split('T')[0]
  }))
}

export async function getUserNotificationById(id: string): Promise<UserNotification | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      globalEnabled: true,
      notifications: true,
      lastActivity: true
    }
  })

  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || user.name.substring(0, 2).toUpperCase(),
    globalEnabled: user.globalEnabled,
    notifications: user.notifications,
    lastActivity: user.lastActivity.toISOString().split('T')[0]
  }
}

export async function updateUserNotifications(id: string, updates: { globalEnabled?: boolean; notifications?: any }) {
  const user = await prisma.user.update({
    where: { id },
    data: updates,
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      globalEnabled: true,
      notifications: true,
      lastActivity: true
    }
  })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || user.name.substring(0, 2).toUpperCase(),
    globalEnabled: user.globalEnabled,
    notifications: user.notifications,
    lastActivity: user.lastActivity.toISOString().split('T')[0]
  }
}

export async function bulkUpdateUserNotifications(userIds: string[], updates: { globalEnabled?: boolean; notifications?: any }) {
  await prisma.user.updateMany({
    where: { id: { in: userIds } },
    data: updates
  })

  // Return updated users
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      globalEnabled: true,
      notifications: true,
      lastActivity: true
    }
  })

  return users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || user.name.substring(0, 2).toUpperCase(),
    globalEnabled: user.globalEnabled,
    notifications: user.notifications,
    lastActivity: user.lastActivity.toISOString().split('T')[0]
  }))
}

// Blocked users functions
export async function getBlockedUsers(params: { page?: number; limit?: number; search?: string } = {}) {
  const { page = 1, limit = 10, search = '' } = params

  const where: any = {}

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { reason: { contains: search, mode: 'insensitive' } }
    ]
  }

  const [blockedUsers, total] = await Promise.all([
    prisma.blockedUser.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { blockedDate: 'desc' }
    }),
    prisma.blockedUser.count({ where })
  ])

  return {
    blockedUsers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export async function getBlockedUserById(id: string) {
  return prisma.blockedUser.findUnique({
    where: { id }
  })
}

export async function createBlockedUser(data: {
  username: string
  email: string
  reason: string
  blockedBy: string
  status: 'active' | 'temporary' | 'permanent'
  blockedUntil?: Date
}) {
  return prisma.blockedUser.create({
    data: {
      ...data,
      blockedDate: new Date()
    }
  })
}

export async function updateBlockedUser(id: string, data: {
  reason?: string
  status?: 'active' | 'temporary' | 'permanent'
  blockedUntil?: Date
}) {
  return prisma.blockedUser.update({
    where: { id },
    data
  })
}

export async function deleteBlockedUser(id: string) {
  await prisma.blockedUser.delete({
    where: { id }
  })
  return true
}

// Helper functions for dynamic statistics
async function getCategoryData() {
  const [premiumRevenue, adRevenue, totalRevenue] = await Promise.all([
    prisma.billingLog.aggregate({
      where: {
        status: 'success',
        OR: [
          { description: { contains: 'premium', mode: 'insensitive' } },
          { description: { contains: 'subscription', mode: 'insensitive' } }
        ]
      },
      _sum: { amount: true }
    }),
    prisma.billingLog.aggregate({
      where: {
        status: 'success',
        OR: [
          { description: { contains: 'ad', mode: 'insensitive' } },
          { description: { contains: 'advertisement', mode: 'insensitive' } }
        ]
      },
      _sum: { amount: true }
    }),
    prisma.billingLog.aggregate({
      where: { status: 'success' },
      _sum: { amount: true }
    })
  ])

  const premium = premiumRevenue._sum.amount || 0
  const ads = adRevenue._sum.amount || 0
  const total = totalRevenue._sum.amount || 0
  const other = Math.max(0, total - premium - ads)

  const totalForPercentage = premium + ads + other || 1 // Avoid division by zero

  return [
    {
      name: "Premium Subscriptions",
      value: premium,
      color: "#8b5cf6",
      percentage: Math.round((premium / totalForPercentage) * 100)
    },
    {
      name: "Ad Revenue",
      value: ads,
      color: "#06b6d4",
      percentage: Math.round((ads / totalForPercentage) * 100)
    },
    {
      name: "Other",
      value: other,
      color: "#10b981",
      percentage: Math.round((other / totalForPercentage) * 100)
    }
  ]
}

async function getTrafficData() {
  // Get device data from user sessions or activity logs
  const deviceStats = await prisma.userSession.groupBy({
    by: ['deviceType'],
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    }
  })

  const totalSessions = deviceStats.reduce((sum, stat) => sum + stat._count.id, 0) || 1

  // Create a map for easy lookup
  const deviceMap = deviceStats.reduce((acc, stat) => {
    acc[stat.deviceType.toLowerCase()] = stat._count.id
    return acc
  }, {} as Record<string, number>)

  return [
    {
      name: "Mobile",
      value: Math.round(((deviceMap.mobile || 0) / totalSessions) * 100),
      color: "#8b5cf6"
    },
    {
      name: "Desktop",
      value: Math.round(((deviceMap.desktop || 0) / totalSessions) * 100),
      color: "#06b6d4"
    },
    {
      name: "Tablet",
      value: Math.round(((deviceMap.tablet || 0) / totalSessions) * 100),
      color: "#10b981"
    }
  ]
}

async function getPreviousMonthRevenue() {
  const now = new Date()
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const result = await prisma.billingLog.aggregate({
    where: {
      status: 'success',
      createdAt: {
        gte: startOfPreviousMonth,
        lt: endOfPreviousMonth
      }
    },
    _sum: { amount: true }
  })

  return result._sum.amount || 0
}

async function getPreviousMonthUsers() {
  const now = new Date()
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return prisma.user.count({
    where: {
      status: 'active',
      createdAt: {
        lt: endOfPreviousMonth
      }
    }
  })
}

async function getPreviousMonthOrders() {
  const now = new Date()
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return prisma.billingLog.count({
    where: {
      status: 'success',
      createdAt: {
        gte: startOfPreviousMonth,
        lt: endOfPreviousMonth
      }
    }
  })
}

async function getPreviousMonthViews() {
  const now = new Date()
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return prisma.activity.count({
    where: {
      timestamp: {
        gte: startOfPreviousMonth,
        lt: endOfPreviousMonth
      }
    }
  })
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}
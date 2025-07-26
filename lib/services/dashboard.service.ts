import { prisma } from '../prisma'
import { UserService } from './user.service'
import { MessageService } from './message.service'
import { TaskService } from './task.service'
import { BillingService } from './billing.service'
import { ActivityService } from './activity.service'

export class DashboardService {
  static async getDashboardStats() {
    const [
      userStats,
      messageStats,
      taskStats,
      billingStats
    ] = await Promise.all([
      UserService.getUserStats(),
      MessageService.getMessageStats(),
      TaskService.getTaskStats(),
      BillingService.getBillingStats()
    ])

    return {
      users: userStats,
      messages: messageStats,
      tasks: taskStats,
      billing: billingStats
    }
  }

  static async getRecentActivities(limit = 10) {
    return ActivityService.getRecentActivities(limit)
  }

  static async getSystemStatus() {
    // Mock system status - in real app, this would check actual services
    return {
      api: { status: 'online', uptime: '99.9%' },
      database: { status: 'online', uptime: '99.8%' },
      notifications: { status: 'online', uptime: '99.7%' }
    }
  }

  static async getMonthlyStats() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const [
      newUsers,
      monthlyRevenue,
      completedTasks,
      totalMessages
    ] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),
      BillingService.getRevenueByPeriod('month'),
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
      })
    ])

    const premiumUsers = await prisma.user.count({
      where: { isPremium: true }
    })

    const totalUsers = await prisma.user.count()
    const premiumConversion = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0

    const averageStreak = await prisma.user.aggregate({
      _avg: { streak: true }
    })

    return {
      newRegistrations: newUsers,
      premiumConversion: Math.round(premiumConversion * 10) / 10,
      averageStreak: Math.round((averageStreak._avg.streak || 0) * 10) / 10,
      totalRevenue: monthlyRevenue.revenue,
      completedTasks,
      totalMessages
    }
  }

  static async getUserGrowthData(months = 12) {
    const data = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const userCount = await prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      data.push({
        month: date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
        users: userCount
      })
    }

    return data
  }

  static async getRevenueData(months = 12) {
    const data = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const revenue = await prisma.billingLog.aggregate({
        where: {
          status: 'success',
          createdAt: {
            gte: date,
            lt: nextDate
          }
        },
        _sum: { amount: true },
        _count: true
      })

      data.push({
        month: date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
        revenue: revenue._sum.amount || 0,
        transactions: revenue._count
      })
    }

    return data
  }

  static async getTaskCompletionData(days = 30) {
    const data = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const [completed, total] = await Promise.all([
        prisma.task.count({
          where: {
            status: 'completed',
            createdDate: {
              gte: date,
              lt: nextDate
            }
          }
        }),
        prisma.task.count({
          where: {
            createdDate: {
              gte: date,
              lt: nextDate
            }
          }
        })
      ])

      data.push({
        date: date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
        completed,
        total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      })
    }

    return data
  }

  static async getTopUsers(limit = 10) {
    return prisma.user.findMany({
      orderBy: { streak: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        streak: true,
        isPremium: true,
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })
  }

  static async getPopularCategories(limit = 10) {
    const categories = await prisma.task.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      },
      take: limit
    })

    return categories.map(cat => ({
      name: cat.category,
      count: cat._count.category
    }))
  }
}
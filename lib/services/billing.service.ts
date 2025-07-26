import { prisma } from '../prisma'
import { BillingStatus } from '../generated/prisma'

export interface CreateBillingLogData {
  userId: string
  userName: string
  amount: number
  currency: string
  paymentMethod: string
  description: string
}

export interface UpdateBillingLogData {
  status?: BillingStatus
  amount?: number
  paymentMethod?: string
  description?: string
}

export interface BillingFilters {
  page?: number
  limit?: number
  status?: BillingStatus
  userId?: string
  paymentMethod?: string
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

export class BillingService {
  static async getBillingLogs(filters: BillingFilters = {}) {
    const { page = 1, limit = 10, status, userId, paymentMethod, search, dateFrom, dateTo } = filters

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (userId) {
      where.userId = userId
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod
    }

    if (search) {
      where.OR = [
        { userName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { paymentMethod: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = dateFrom
      if (dateTo) where.createdAt.lte = dateTo
    }

    const [billingLogs, total] = await Promise.all([
      prisma.billingLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isPremium: true
            }
          }
        }
      }),
      prisma.billingLog.count({ where })
    ])

    return {
      billingLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getBillingLogById(id: string) {
    return prisma.billingLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPremium: true
          }
        }
      }
    })
  }

  static async createBillingLog(data: CreateBillingLogData) {
    return prisma.billingLog.create({
      data: {
        ...data,
        status: 'pending'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPremium: true
          }
        }
      }
    })
  }

  static async updateBillingLog(id: string, data: UpdateBillingLogData) {
    return prisma.billingLog.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPremium: true
          }
        }
      }
    })
  }

  static async deleteBillingLog(id: string) {
    return prisma.billingLog.delete({
      where: { id }
    })
  }

  static async getBillingStats() {
    const [total, success, pending, failed] = await Promise.all([
      prisma.billingLog.count(),
      prisma.billingLog.count({ where: { status: 'success' } }),
      prisma.billingLog.count({ where: { status: 'pending' } }),
      prisma.billingLog.count({ where: { status: 'failed' } })
    ])

    const totalRevenue = await prisma.billingLog.aggregate({
      where: { status: 'success' },
      _sum: { amount: true }
    })

    return { 
      total, 
      success, 
      pending, 
      failed,
      totalRevenue: totalRevenue._sum.amount || 0
    }
  }

  static async getRevenueByPeriod(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    const revenue = await prisma.billingLog.aggregate({
      where: {
        status: 'success',
        createdAt: { gte: startDate }
      },
      _sum: { amount: true },
      _count: true
    })

    return {
      revenue: revenue._sum.amount || 0,
      transactions: revenue._count,
      period
    }
  }

  static async getUserBillingHistory(userId: string, limit = 10) {
    return prisma.billingLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })
  }

  static async markAsSuccess(id: string) {
    const billingLog = await this.updateBillingLog(id, { status: 'success' })
    
    // Update user premium status if payment is successful
    if (billingLog?.userId) {
      await prisma.user.update({
        where: { id: billingLog.userId },
        data: { isPremium: true }
      })
    }

    return billingLog
  }

  static async markAsFailed(id: string) {
    return this.updateBillingLog(id, { status: 'failed' })
  }

  // Advanced analytics and reporting
  static async getRevenueAnalytics(days = 30) {
    const data = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const [revenue, transactions, failed] = await Promise.all([
        prisma.billingLog.aggregate({
          where: {
            createdAt: { gte: date, lt: nextDate },
            status: 'success'
          },
          _sum: { amount: true },
          _count: true
        }),
        prisma.billingLog.count({
          where: {
            createdAt: { gte: date, lt: nextDate }
          }
        }),
        prisma.billingLog.count({
          where: {
            createdAt: { gte: date, lt: nextDate },
            status: 'failed'
          }
        })
      ])

      const successRate = transactions > 0 ? ((transactions - failed) / transactions) * 100 : 0

      data.push({
        date: date.toISOString().split('T')[0],
        revenue: revenue._sum.amount || 0,
        transactions,
        failed,
        successRate: Math.round(successRate * 10) / 10
      })
    }

    return data
  }

  static async getPaymentMethodStats() {
    const methods = await prisma.billingLog.groupBy({
      by: ['paymentMethod'],
      _count: {
        paymentMethod: true
      },
      _sum: {
        amount: true
      },
      where: {
        status: 'success'
      },
      orderBy: {
        _count: {
          paymentMethod: 'desc'
        }
      }
    })

    return methods.map(method => ({
      method: method.paymentMethod,
      transactions: method._count.paymentMethod,
      revenue: method._sum.amount || 0
    }))
  }

  static async getTopPayingUsers(limit = 10) {
    const users = await prisma.billingLog.groupBy({
      by: ['userId'],
      _sum: {
        amount: true
      },
      _count: {
        userId: true
      },
      where: {
        status: 'success'
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: limit
    })

    const userDetails = await Promise.all(
      users.map(async (user) => {
        const userInfo = await prisma.user.findUnique({
          where: { id: user.userId },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPremium: true
          }
        })

        return {
          user: userInfo,
          totalSpent: user._sum.amount || 0,
          transactionCount: user._count.userId
        }
      })
    )

    return userDetails
  }

  // Refund processing
  static async processRefund(id: string, refundAmount?: number) {
    const billingLog = await this.getBillingLogById(id)
    
    if (!billingLog) {
      throw new Error('Billing log not found')
    }

    if (billingLog.status !== 'success') {
      throw new Error('Can only refund successful payments')
    }

    const refundAmountFinal = refundAmount || billingLog.amount

    // Create refund record
    const refund = await this.createBillingLog({
      userId: billingLog.userId,
      userName: billingLog.userName,
      amount: -refundAmountFinal,
      currency: billingLog.currency,
      paymentMethod: billingLog.paymentMethod,
      description: `Refund for: ${billingLog.description}`
    })

    // Update original transaction status if full refund
    if (refundAmountFinal === billingLog.amount) {
      await this.updateBillingLog(id, { 
        description: `${billingLog.description} (REFUNDED)` 
      })
    }

    return refund
  }

  // Subscription management
  static async getSubscriptionMetrics() {
    const [totalSubscribers, newSubscribers, churnedSubscribers] = await Promise.all([
      prisma.user.count({ where: { isPremium: true } }),
      prisma.user.count({
        where: {
          isPremium: true,
          createdAt: {
            gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      // This would require additional tracking for churned users
      0 // Mock data
    ])

    const churnRate = totalSubscribers > 0 ? (churnedSubscribers / totalSubscribers) * 100 : 0

    return {
      totalSubscribers,
      newSubscribers,
      churnedSubscribers,
      churnRate: Math.round(churnRate * 10) / 10
    }
  }

  // Bulk operations
  static async bulkUpdateBillingStatus(billingIds: string[], status: BillingStatus) {
    return prisma.billingLog.updateMany({
      where: { id: { in: billingIds } },
      data: { status }
    })
  }

  static async bulkProcessRefunds(billingIds: string[]) {
    const results = await Promise.all(
      billingIds.map(id => this.processRefund(id))
    )
    return results
  }

  // Advanced filtering and search
  static async searchBillingLogs(query: string, limit = 10) {
    return prisma.billingLog.findMany({
      where: {
        OR: [
          { userName: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { paymentMethod: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPremium: true
          }
        }
      }
    })
  }

  static async getBillingLogsByAmountRange(minAmount: number, maxAmount: number) {
    return prisma.billingLog.findMany({
      where: {
        amount: {
          gte: minAmount,
          lte: maxAmount
        }
      },
      orderBy: { amount: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPremium: true
          }
        }
      }
    })
  }

  // Financial reporting
  static async getMonthlyRevenueReport(year: number) {
    const monthlyData = []

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 1)

      const revenue = await prisma.billingLog.aggregate({
        where: {
          status: 'success',
          createdAt: {
            gte: startDate,
            lt: endDate
          }
        },
        _sum: { amount: true },
        _count: true
      })

      monthlyData.push({
        month: startDate.toLocaleDateString('en-US', { month: 'long' }),
        revenue: revenue._sum.amount || 0,
        transactions: revenue._count
      })
    }

    return monthlyData
  }

  // Validation
  static validateBillingData(data: CreateBillingLogData | UpdateBillingLogData) {
    const errors: string[] = []

    if ('amount' in data && data.amount !== undefined) {
      if (data.amount <= 0) {
        errors.push('Amount must be greater than 0')
      }
      if (data.amount > 10000) {
        errors.push('Amount cannot exceed 10,000')
      }
    }

    if ('description' in data && data.description) {
      if (data.description.length < 3) {
        errors.push('Description must be at least 3 characters long')
      }
      if (data.description.length > 500) {
        errors.push('Description must be less than 500 characters')
      }
    }

    return errors
  }
}
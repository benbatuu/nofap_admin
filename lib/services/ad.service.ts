import { prisma } from '../prisma'
import { AdType, AdStatus } from '../generated/prisma'

export interface CreateAdData {
  title: string
  description: string
  imageUrl?: string
  targetUrl: string
  type: AdType
  placement: string
  targeting: any
  budget?: number
  startDate: Date
  endDate?: Date
}

export interface UpdateAdData {
  title?: string
  description?: string
  imageUrl?: string
  targetUrl?: string
  type?: AdType
  status?: AdStatus
  placement?: string
  targeting?: any
  budget?: number
  spent?: number
  impressions?: number
  clicks?: number
  startDate?: Date
  endDate?: Date
}

export interface AdFilters {
  page?: number
  limit?: number
  type?: AdType
  status?: AdStatus
  placement?: string
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

export class AdService {
  static async getAds(filters: AdFilters = {}) {
    const { page = 1, limit = 10, type, status, placement, search, dateFrom, dateTo } = filters

    const where: any = {}

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    if (placement) {
      where.placement = placement
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { placement: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (dateFrom || dateTo) {
      where.startDate = {}
      if (dateFrom) where.startDate.gte = dateFrom
      if (dateTo) where.startDate.lte = dateTo
    }

    const [ads, total] = await Promise.all([
      prisma.ad.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.ad.count({ where })
    ])

    return {
      ads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getAdById(id: string) {
    return prisma.ad.findUnique({
      where: { id }
    })
  }

  static async createAd(data: CreateAdData) {
    return prisma.ad.create({
      data: {
        ...data,
        status: 'active',
        spent: 0,
        impressions: 0,
        clicks: 0
      }
    })
  }

  static async updateAd(id: string, data: UpdateAdData) {
    return prisma.ad.update({
      where: { id },
      data
    })
  }

  static async deleteAd(id: string) {
    return prisma.ad.delete({
      where: { id }
    })
  }

  static async getAdStats() {
    const [total, active, paused, completed] = await Promise.all([
      prisma.ad.count(),
      prisma.ad.count({ where: { status: 'active' } }),
      prisma.ad.count({ where: { status: 'paused' } }),
      prisma.ad.count({ where: { status: 'completed' } })
    ])

    const [totalSpent, totalImpressions, totalClicks] = await Promise.all([
      prisma.ad.aggregate({
        _sum: { spent: true }
      }),
      prisma.ad.aggregate({
        _sum: { impressions: true }
      }),
      prisma.ad.aggregate({
        _sum: { clicks: true }
      })
    ])

    const ctr = totalImpressions._sum.impressions && totalImpressions._sum.impressions > 0 
      ? (totalClicks._sum.clicks || 0) / totalImpressions._sum.impressions * 100 
      : 0

    return {
      total,
      active,
      paused,
      completed,
      totalSpent: totalSpent._sum.spent || 0,
      totalImpressions: totalImpressions._sum.impressions || 0,
      totalClicks: totalClicks._sum.clicks || 0,
      ctr: Math.round(ctr * 100) / 100
    }
  }

  // Ad performance tracking
  static async recordImpression(id: string) {
    return prisma.ad.update({
      where: { id },
      data: {
        impressions: { increment: 1 }
      }
    })
  }

  static async recordClick(id: string) {
    return prisma.ad.update({
      where: { id },
      data: {
        clicks: { increment: 1 }
      }
    })
  }

  static async updateSpent(id: string, amount: number) {
    return prisma.ad.update({
      where: { id },
      data: {
        spent: { increment: amount }
      }
    })
  }

  // Ad analytics
  static async getAdPerformanceAnalytics(days = 30) {
    const ads = await prisma.ad.findMany({
      where: {
        status: { in: ['active', 'completed'] }
      },
      select: {
        id: true,
        title: true,
        type: true,
        impressions: true,
        clicks: true,
        spent: true,
        budget: true
      }
    })

    return ads.map(ad => {
      const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0
      const cpc = ad.clicks > 0 ? ad.spent / ad.clicks : 0
      const budgetUsed = ad.budget ? (ad.spent / ad.budget) * 100 : 0

      return {
        ...ad,
        ctr: Math.round(ctr * 100) / 100,
        cpc: Math.round(cpc * 100) / 100,
        budgetUsed: Math.round(budgetUsed * 10) / 10
      }
    })
  }

  static async getAdsByType(type: AdType) {
    return prisma.ad.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async getTopPerformingAds(limit = 10) {
    return prisma.ad.findMany({
      where: {
        status: { in: ['active', 'completed'] },
        impressions: { gt: 0 }
      },
      orderBy: [
        { clicks: 'desc' },
        { impressions: 'desc' }
      ],
      take: limit
    })
  }

  // Ad targeting and optimization
  static async getAdsByPlacement(placement: string) {
    return prisma.ad.findMany({
      where: { placement },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async pauseAd(id: string) {
    return this.updateAd(id, { status: 'paused' })
  }

  static async resumeAd(id: string) {
    return this.updateAd(id, { status: 'active' })
  }

  static async completeAd(id: string) {
    return this.updateAd(id, { status: 'completed' })
  }

  // Bulk operations
  static async bulkUpdateAdStatus(adIds: string[], status: AdStatus) {
    return prisma.ad.updateMany({
      where: { id: { in: adIds } },
      data: { status }
    })
  }

  static async bulkDeleteAds(adIds: string[]) {
    return prisma.ad.deleteMany({
      where: { id: { in: adIds } }
    })
  }

  // Revenue optimization
  static async getRevenueReport(dateFrom?: Date, dateTo?: Date) {
    const where: any = {}

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = dateFrom
      if (dateTo) where.createdAt.lte = dateTo
    }

    const revenue = await prisma.ad.aggregate({
      where,
      _sum: {
        spent: true,
        impressions: true,
        clicks: true
      },
      _count: true
    })

    const avgCpc = revenue._sum.clicks && revenue._sum.clicks > 0 
      ? (revenue._sum.spent || 0) / revenue._sum.clicks 
      : 0

    const avgCtr = revenue._sum.impressions && revenue._sum.impressions > 0 
      ? (revenue._sum.clicks || 0) / revenue._sum.impressions * 100 
      : 0

    return {
      totalRevenue: revenue._sum.spent || 0,
      totalImpressions: revenue._sum.impressions || 0,
      totalClicks: revenue._sum.clicks || 0,
      totalAds: revenue._count,
      avgCpc: Math.round(avgCpc * 100) / 100,
      avgCtr: Math.round(avgCtr * 100) / 100
    }
  }

  // Validation
  static validateAdData(data: CreateAdData | UpdateAdData) {
    const errors: string[] = []

    if ('title' in data && data.title) {
      if (data.title.length < 3) {
        errors.push('Title must be at least 3 characters long')
      }
      if (data.title.length > 100) {
        errors.push('Title must be less than 100 characters')
      }
    }

    if ('description' in data && data.description) {
      if (data.description.length < 10) {
        errors.push('Description must be at least 10 characters long')
      }
      if (data.description.length > 500) {
        errors.push('Description must be less than 500 characters')
      }
    }

    if ('targetUrl' in data && data.targetUrl) {
      try {
        new URL(data.targetUrl)
      } catch {
        errors.push('Target URL must be a valid URL')
      }
    }

    if ('budget' in data && data.budget !== undefined) {
      if (data.budget < 0) {
        errors.push('Budget cannot be negative')
      }
    }

    if ('startDate' in data && data.startDate) {
      const now = new Date()
      if (data.startDate < now) {
        errors.push('Start date cannot be in the past')
      }
    }

    return errors
  }
}
import { prisma } from '../prisma'
import { AdType, AdStatus } from '../generated/prisma'

export interface CreateAdData {
  title: string
  description: string
  imageUrl?: string
  targetUrl: string
  type: AdType
  placement: string
  targeting?: any
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
  startDate?: Date
  endDate?: Date
}

export interface AdFilters {
  page?: number
  limit?: number
  status?: AdStatus
  type?: AdType
  placement?: string
  search?: string
}

export class AdService {
  static async getAds(filters: AdFilters = {}) {
    const { page = 1, limit = 10, status, type, placement, search } = filters

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (placement) {
      where.placement = placement
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
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
        impressions: 0,
        clicks: 0,
        spent: 0
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

  static async getAdAnalytics() {
    const [totalAds, activeAds, totalImpressions, totalClicks, totalSpent, totalBudget] = await Promise.all([
      prisma.ad.count(),
      prisma.ad.count({ where: { status: 'active' } }),
      prisma.ad.aggregate({
        _sum: { impressions: true }
      }),
      prisma.ad.aggregate({
        _sum: { clicks: true }
      }),
      prisma.ad.aggregate({
        _sum: { spent: true }
      }),
      prisma.ad.aggregate({
        _sum: { budget: true }
      })
    ])

    const impressionsSum = totalImpressions._sum.impressions || 0
    const clicksSum = totalClicks._sum.clicks || 0
    const ctr = impressionsSum > 0 ? (clicksSum / impressionsSum) * 100 : 0

    return {
      totalAds,
      activeAds,
      totalImpressions: impressionsSum,
      totalClicks: clicksSum,
      totalSpent: totalSpent._sum.spent || 0,
      totalBudget: totalBudget._sum.budget || 0,
      averageCTR: ctr,
      revenue: totalSpent._sum.spent || 0 // Simplified: spent = revenue for now
    }
  }

  static async getAdPerformance() {
    // Get top performing ads by CTR
    const ads = await prisma.ad.findMany({
      where: {
        status: 'active',
        impressions: { gt: 0 }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate CTR for each ad and sort
    const adsWithCTR = ads.map(ad => ({
      ...ad,
      ctr: ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0
    })).sort((a, b) => b.ctr - a.ctr)

    return {
      topPerformingAds: adsWithCTR.slice(0, 5),
      totalCampaigns: ads.length
    }
  }

  static async getAdSuggestions() {
    const analytics = await this.getAdAnalytics()
    const performance = await this.getAdPerformance()

    const suggestions = []

    // Analyze performance and generate suggestions
    if (analytics.averageCTR < 2) {
      suggestions.push({
        type: 'optimization',
        title: 'CTR Optimizasyonu',
        description: 'Ortalama tıklama oranınız düşük. Reklam içeriklerini ve hedeflemeyi gözden geçirin.',
        priority: 'high',
        expectedImpact: 'CTR\'de %50-100 artış beklenir'
      })
    }

    if (performance.topPerformingAds.length > 0) {
      const bestAd = performance.topPerformingAds[0]
      if (bestAd.type === 'video') {
        suggestions.push({
          type: 'expansion',
          title: 'Video Reklamları Artırın',
          description: 'Video reklamlarınız en iyi performansı gösteriyor. Daha fazla video reklam alanı açın.',
          priority: 'medium',
          expectedImpact: 'Gelirde %25-40 artış'
        })
      }
    }

    if (analytics.totalSpent < analytics.totalBudget * 0.7) {
      suggestions.push({
        type: 'budget',
        title: 'Bütçe Optimizasyonu',
        description: 'Bütçenizin sadece %' + Math.round((analytics.totalSpent / analytics.totalBudget) * 100) + '\'ini kullanıyorsunuz. Daha agresif kampanyalar düşünün.',
        priority: 'low',
        expectedImpact: 'Erişimde artış'
      })
    }

    // Add A/B test suggestion
    suggestions.push({
      type: 'testing',
      title: 'A/B Test Önerisi',
      description: 'Farklı reklam formatları ve konumları için A/B test yapılması önerilir.',
      priority: 'medium',
      expectedImpact: 'Performansta %15-25 iyileşme'
    })

    return {
      suggestions,
      performanceInsights: {
        bestPerformingType: performance.topPerformingAds[0]?.type || 'banner',
        averageCTR: analytics.averageCTR,
        budgetUtilization: analytics.totalBudget > 0 ? (analytics.totalSpent / analytics.totalBudget) * 100 : 0
      }
    }
  }

  static async updateAdStats(id: string, impressions: number, clicks: number, spent: number) {
    return prisma.ad.update({
      where: { id },
      data: {
        impressions: { increment: impressions },
        clicks: { increment: clicks },
        spent: { increment: spent }
      }
    })
  }

  static async getAdsByType() {
    return prisma.ad.groupBy({
      by: ['type'],
      _count: {
        type: true
      },
      _sum: {
        impressions: true,
        clicks: true,
        spent: true
      }
    })
  }

  static async getAdsByPlacement() {
    return prisma.ad.groupBy({
      by: ['placement'],
      _count: {
        placement: true
      },
      _sum: {
        impressions: true,
        clicks: true,
        spent: true
      }
    })
  }

  static async pauseAd(id: string) {
    return this.updateAd(id, { status: 'paused' })
  }

  static async activateAd(id: string) {
    return this.updateAd(id, { status: 'active' })
  }

  static async getExpiredAds() {
    return prisma.ad.findMany({
      where: {
        endDate: {
          lt: new Date()
        },
        status: 'active'
      }
    })
  }

  static async markExpiredAds() {
    const expiredAds = await this.getExpiredAds()

    if (expiredAds.length > 0) {
      await prisma.ad.updateMany({
        where: {
          id: {
            in: expiredAds.map(ad => ad.id)
          }
        },
        data: {
          status: 'completed'
        }
      })
    }

    return expiredAds.length
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

    if ('budget' in data && data.budget !== undefined) {
      if (data.budget < 0) {
        errors.push('Budget cannot be negative')
      }
      if (data.budget > 100000) {
        errors.push('Budget cannot exceed $100,000')
      }
    }

    if ('targetUrl' in data && data.targetUrl) {
      try {
        new URL(data.targetUrl)
      } catch {
        errors.push('Target URL must be a valid URL')
      }
    }

    return errors
  }
}
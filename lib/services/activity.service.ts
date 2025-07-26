import { prisma } from '../prisma'

export interface CreateActivityData {
  type: string
  message: string
  details: string
  color: string
  userId?: string
}

export interface UpdateActivityData {
  type?: string
  message?: string
  details?: string
  color?: string
}

export interface ActivityFilters {
  page?: number
  limit?: number
  type?: string
  userId?: string
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

export class ActivityService {
  static async getActivities(filters: ActivityFilters = {}) {
    const { page = 1, limit = 10, type, userId, search, dateFrom, dateTo } = filters

    const where: any = {}

    if (type) {
      where.type = type
    }

    if (userId) {
      where.userId = userId
    }

    if (search) {
      where.OR = [
        { type: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (dateFrom || dateTo) {
      where.timestamp = {}
      if (dateFrom) where.timestamp.gte = dateFrom
      if (dateTo) where.timestamp.lte = dateTo
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'desc' },
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
      }),
      prisma.activity.count({ where })
    ])

    return {
      activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getActivityById(id: string) {
    return prisma.activity.findUnique({
      where: { id },
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

  static async createActivity(data: CreateActivityData) {
    return prisma.activity.create({
      data,
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

  static async updateActivity(id: string, data: UpdateActivityData) {
    return prisma.activity.update({
      where: { id },
      data,
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

  static async deleteActivity(id: string) {
    return prisma.activity.delete({
      where: { id }
    })
  }

  static async getRecentActivities(limit = 10) {
    return prisma.activity.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
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

  static async getUserActivities(userId: string, limit = 10) {
    return prisma.activity.findMany({
      where: { userId },
      take: limit,
      orderBy: { timestamp: 'desc' },
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

  static async getActivityStats() {
    const total = await prisma.activity.count()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayCount = await prisma.activity.count({
      where: {
        timestamp: { gte: today }
      }
    })

    const activityTypes = await prisma.activity.groupBy({
      by: ['type'],
      _count: {
        type: true
      },
      orderBy: {
        _count: {
          type: 'desc'
        }
      }
    })

    return { 
      total,
      today: todayCount,
      types: activityTypes.map(type => ({
        name: type.type,
        count: type._count.type
      }))
    }
  }

  static async logUserActivity(userId: string, type: string, message: string, details: string, color = 'blue') {
    return this.createActivity({
      userId,
      type,
      message,
      details,
      color
    })
  }

  static async logSystemActivity(type: string, message: string, details: string, color = 'gray') {
    return this.createActivity({
      type,
      message,
      details,
      color
    })
  }

  static async cleanOldActivities(daysToKeep = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    return prisma.activity.deleteMany({
      where: {
        timestamp: { lt: cutoffDate }
      }
    })
  }
}
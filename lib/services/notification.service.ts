import { prisma } from '../prisma'
import { NotificationType, NotificationStatus, NotificationFrequency } from '../generated/prisma'

export interface CreateNotificationData {
  title: string
  message: string
  type: NotificationType
  targetGroup: string
  scheduledAt: Date
  frequency: NotificationFrequency
}

export interface UpdateNotificationData {
  title?: string
  message?: string
  type?: NotificationType
  targetGroup?: string
  scheduledAt?: Date
  status?: NotificationStatus
  frequency?: NotificationFrequency
}

export interface NotificationFilters {
  page?: number
  limit?: number
  type?: NotificationType
  status?: NotificationStatus
  targetGroup?: string
  search?: string
}

export class NotificationService {
  static async getNotifications(filters: NotificationFilters = {}) {
    const { page = 1, limit = 10, type, status, targetGroup, search } = filters

    const where: any = {}

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    if (targetGroup) {
      where.targetGroup = targetGroup
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { targetGroup: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where })
    ])

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getNotificationById(id: string) {
    return prisma.notification.findUnique({
      where: { id }
    })
  }

  static async createNotification(data: CreateNotificationData) {
    return prisma.notification.create({
      data: {
        ...data,
        status: 'active'
      }
    })
  }

  static async updateNotification(id: string, data: UpdateNotificationData) {
    return prisma.notification.update({
      where: { id },
      data
    })
  }

  static async deleteNotification(id: string) {
    return prisma.notification.delete({
      where: { id }
    })
  }

  static async getNotificationStats() {
    const [total, active, paused, completed, cancelled] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { status: 'active' } }),
      prisma.notification.count({ where: { status: 'paused' } }),
      prisma.notification.count({ where: { status: 'completed' } }),
      prisma.notification.count({ where: { status: 'cancelled' } })
    ])

    return { total, active, paused, completed, cancelled }
  }

  static async pauseNotification(id: string) {
    return this.updateNotification(id, { status: 'paused' })
  }

  static async resumeNotification(id: string) {
    return this.updateNotification(id, { status: 'active' })
  }

  static async completeNotification(id: string) {
    return this.updateNotification(id, { status: 'completed' })
  }

  static async getScheduledNotifications() {
    const now = new Date()
    
    return prisma.notification.findMany({
      where: {
        status: 'active',
        scheduledAt: { lte: now }
      },
      orderBy: { scheduledAt: 'asc' }
    })
  }

  static async getNotificationsByType(type: NotificationType) {
    return prisma.notification.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Advanced analytics and tracking
  static async getNotificationAnalytics(days = 30) {
    const data = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const [sent, delivered, read, clicked] = await Promise.all([
        prisma.notificationLog.count({
          where: {
            sentAt: { gte: date, lt: nextDate }
          }
        }),
        prisma.notificationLog.count({
          where: {
            sentAt: { gte: date, lt: nextDate },
            status: 'delivered'
          }
        }),
        prisma.notificationLog.count({
          where: {
            sentAt: { gte: date, lt: nextDate },
            status: 'read'
          }
        }),
        prisma.notificationLog.count({
          where: {
            sentAt: { gte: date, lt: nextDate },
            status: 'clicked'
          }
        })
      ])

      const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0
      const readRate = delivered > 0 ? (read / delivered) * 100 : 0
      const clickRate = read > 0 ? (clicked / read) * 100 : 0

      data.push({
        date: date.toISOString().split('T')[0],
        sent,
        delivered,
        read,
        clicked,
        deliveryRate: Math.round(deliveryRate * 10) / 10,
        readRate: Math.round(readRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10
      })
    }

    return data
  }

  static async getNotificationPerformanceByType() {
    const types = await prisma.notificationLog.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    })

    const performance = await Promise.all(
      types.map(async (type) => {
        const [sent, delivered, read, clicked] = await Promise.all([
          prisma.notificationLog.count({
            where: { type: type.type }
          }),
          prisma.notificationLog.count({
            where: { type: type.type, status: 'delivered' }
          }),
          prisma.notificationLog.count({
            where: { type: type.type, status: 'read' }
          }),
          prisma.notificationLog.count({
            where: { type: type.type, status: 'clicked' }
          })
        ])

        const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0
        const readRate = delivered > 0 ? (read / delivered) * 100 : 0
        const clickRate = read > 0 ? (clicked / read) * 100 : 0

        return {
          type: type.type,
          sent,
          delivered,
          read,
          clicked,
          deliveryRate: Math.round(deliveryRate * 10) / 10,
          readRate: Math.round(readRate * 10) / 10,
          clickRate: Math.round(clickRate * 10) / 10
        }
      })
    )

    return performance
  }

  // Notification targeting and personalization
  static async getTargetGroups() {
    const groups = await prisma.notification.groupBy({
      by: ['targetGroup'],
      _count: {
        targetGroup: true
      },
      orderBy: {
        _count: {
          targetGroup: 'desc'
        }
      }
    })

    return groups.map(group => ({
      name: group.targetGroup,
      count: group._count.targetGroup
    }))
  }

  static async createTargetedNotification(data: CreateNotificationData, userIds?: string[]) {
    const notification = await this.createNotification(data)

    // If specific users are targeted, create notification logs
    if (userIds && userIds.length > 0) {
      const notificationLogs = userIds.map(userId => ({
        notificationId: notification.id,
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        status: 'sent' as const
      }))

      await prisma.notificationLog.createMany({
        data: notificationLogs
      })
    }

    return notification
  }

  // Bulk operations
  static async bulkUpdateNotificationStatus(notificationIds: string[], status: NotificationStatus) {
    return prisma.notification.updateMany({
      where: { id: { in: notificationIds } },
      data: { status }
    })
  }

  static async bulkDeleteNotifications(notificationIds: string[]) {
    return prisma.notification.deleteMany({
      where: { id: { in: notificationIds } }
    })
  }

  // Scheduling and frequency management
  static async getRecurringNotifications() {
    return prisma.notification.findMany({
      where: {
        frequency: { not: 'once' },
        status: 'active'
      },
      orderBy: { scheduledAt: 'asc' }
    })
  }

  static async processScheduledNotifications() {
    const now = new Date()
    
    const scheduledNotifications = await prisma.notification.findMany({
      where: {
        status: 'active',
        scheduledAt: { lte: now }
      }
    })

    // Process each notification (this would integrate with actual notification service)
    const processed = await Promise.all(
      scheduledNotifications.map(async (notification) => {
        // Mark as completed if it's a one-time notification
        if (notification.frequency === 'once') {
          await this.updateNotification(notification.id, { status: 'completed' })
        } else {
          // Schedule next occurrence for recurring notifications
          let nextSchedule = new Date(notification.scheduledAt)
          
          switch (notification.frequency) {
            case 'daily':
              nextSchedule.setDate(nextSchedule.getDate() + 1)
              break
            case 'weekly':
              nextSchedule.setDate(nextSchedule.getDate() + 7)
              break
            case 'monthly':
              nextSchedule.setMonth(nextSchedule.getMonth() + 1)
              break
          }

          await this.updateNotification(notification.id, { scheduledAt: nextSchedule })
        }

        return notification
      })
    )

    return processed
  }

  // Search and filtering
  static async searchNotifications(query: string, limit = 10) {
    return prisma.notification.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { message: { contains: query, mode: 'insensitive' } },
          { targetGroup: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  }

  // Validation
  static validateNotificationData(data: CreateNotificationData | UpdateNotificationData) {
    const errors: string[] = []

    if ('title' in data && data.title) {
      if (data.title.length < 3) {
        errors.push('Title must be at least 3 characters long')
      }
      if (data.title.length > 100) {
        errors.push('Title must be less than 100 characters')
      }
    }

    if ('message' in data && data.message) {
      if (data.message.length < 10) {
        errors.push('Message must be at least 10 characters long')
      }
      if (data.message.length > 1000) {
        errors.push('Message must be less than 1000 characters')
      }
    }

    if ('scheduledAt' in data && data.scheduledAt) {
      const now = new Date()
      if (data.scheduledAt < now) {
        errors.push('Scheduled time cannot be in the past')
      }
    }

    return errors
  }
}
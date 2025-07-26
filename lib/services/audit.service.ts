import { prisma } from '../prisma'

export interface CreateAuditLogData {
  action: string
  resource: string
  resourceId?: string
  userId: string
  userName: string
  details?: any
  ipAddress: string
  userAgent?: string
}

export interface UpdateAuditLogData {
  details?: any
}

export interface AuditLogFilters {
  page?: number
  limit?: number
  action?: string
  resource?: string
  userId?: string
  ipAddress?: string
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

export class AuditService {
  static async getAuditLogs(filters: AuditLogFilters = {}) {
    const { page = 1, limit = 10, action, resource, userId, ipAddress, search, dateFrom, dateTo } = filters

    const where: any = {}

    if (action) {
      where.action = action
    }

    if (resource) {
      where.resource = resource
    }

    if (userId) {
      where.userId = userId
    }

    if (ipAddress) {
      where.ipAddress = ipAddress
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { resource: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (dateFrom || dateTo) {
      where.timestamp = {}
      if (dateFrom) where.timestamp.gte = dateFrom
      if (dateTo) where.timestamp.lte = dateTo
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'desc' }
      }),
      prisma.auditLog.count({ where })
    ])

    return {
      auditLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getAuditLogById(id: string) {
    return prisma.auditLog.findUnique({
      where: { id }
    })
  }

  static async createAuditLog(data: CreateAuditLogData) {
    return prisma.auditLog.create({
      data
    })
  }

  static async updateAuditLog(id: string, data: UpdateAuditLogData) {
    return prisma.auditLog.update({
      where: { id },
      data
    })
  }

  static async deleteAuditLog(id: string) {
    return prisma.auditLog.delete({
      where: { id }
    })
  }

  // Audit logging helpers
  static async logAction(
    action: string,
    resource: string,
    userId: string,
    userName: string,
    ipAddress: string,
    resourceId?: string,
    details?: any,
    userAgent?: string
  ) {
    return this.createAuditLog({
      action,
      resource,
      resourceId,
      userId,
      userName,
      details,
      ipAddress,
      userAgent
    })
  }

  // Common audit actions
  static async logUserAction(
    action: string,
    userId: string,
    userName: string,
    ipAddress: string,
    targetUserId?: string,
    details?: any,
    userAgent?: string
  ) {
    return this.logAction(
      action,
      'user',
      userId,
      userName,
      ipAddress,
      targetUserId,
      details,
      userAgent
    )
  }

  static async logSystemAction(
    action: string,
    userId: string,
    userName: string,
    ipAddress: string,
    details?: any,
    userAgent?: string
  ) {
    return this.logAction(
      action,
      'system',
      userId,
      userName,
      ipAddress,
      undefined,
      details,
      userAgent
    )
  }

  static async logDataAction(
    action: string,
    resource: string,
    resourceId: string,
    userId: string,
    userName: string,
    ipAddress: string,
    details?: any,
    userAgent?: string
  ) {
    return this.logAction(
      action,
      resource,
      userId,
      userName,
      ipAddress,
      resourceId,
      details,
      userAgent
    )
  }

  // Audit analytics
  static async getAuditStats() {
    const [total, uniqueUsers, uniqueActions, uniqueResources] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.groupBy({
        by: ['userId'],
        _count: { userId: true }
      }).then(result => result.length),
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: { action: true }
      }).then(result => result.length),
      prisma.auditLog.groupBy({
        by: ['resource'],
        _count: { resource: true }
      }).then(result => result.length)
    ])

    return {
      total,
      uniqueUsers,
      uniqueActions,
      uniqueResources
    }
  }

  static async getActionDistribution() {
    const actions = await prisma.auditLog.groupBy({
      by: ['action'],
      _count: {
        action: true
      },
      orderBy: {
        _count: {
          action: 'desc'
        }
      }
    })

    return actions.map(action => ({
      action: action.action,
      count: action._count.action
    }))
  }

  static async getResourceDistribution() {
    const resources = await prisma.auditLog.groupBy({
      by: ['resource'],
      _count: {
        resource: true
      },
      orderBy: {
        _count: {
          resource: 'desc'
        }
      }
    })

    return resources.map(resource => ({
      resource: resource.resource,
      count: resource._count.resource
    }))
  }

  static async getUserActivityStats(userId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const [totalActions, actionsByDay] = await Promise.all([
      prisma.auditLog.count({
        where: {
          userId,
          timestamp: { gte: since }
        }
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where: {
          userId,
          timestamp: { gte: since }
        },
        _count: {
          action: true
        },
        orderBy: {
          _count: {
            action: 'desc'
          }
        }
      })
    ])

    return {
      totalActions,
      actionBreakdown: actionsByDay.map(action => ({
        action: action.action,
        count: action._count.action
      }))
    }
  }

  // Audit analytics by time period
  static async getAuditAnalytics(days = 30) {
    const data = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const [total, uniqueUsers, topActions] = await Promise.all([
        prisma.auditLog.count({
          where: {
            timestamp: { gte: date, lt: nextDate }
          }
        }),
        prisma.auditLog.groupBy({
          by: ['userId'],
          where: {
            timestamp: { gte: date, lt: nextDate }
          },
          _count: { userId: true }
        }).then(result => result.length),
        prisma.auditLog.groupBy({
          by: ['action'],
          where: {
            timestamp: { gte: date, lt: nextDate }
          },
          _count: { action: true },
          orderBy: {
            _count: { action: 'desc' }
          },
          take: 3
        })
      ])

      data.push({
        date: date.toISOString().split('T')[0],
        total,
        uniqueUsers,
        topActions: topActions.map(action => ({
          action: action.action,
          count: action._count.action
        }))
      })
    }

    return data
  }

  // Audit trail for specific resources
  static async getResourceAuditTrail(resource: string, resourceId: string) {
    return prisma.auditLog.findMany({
      where: {
        resource,
        resourceId
      },
      orderBy: { timestamp: 'desc' }
    })
  }

  static async getUserAuditTrail(userId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit
    })
  }

  // Security-focused audit queries
  static async getSuspiciousActivity(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    // Look for unusual patterns
    const suspiciousActions = [
      'user.delete',
      'user.ban',
      'system.settings.change',
      'admin.login',
      'bulk.operation'
    ]

    return prisma.auditLog.findMany({
      where: {
        action: { in: suspiciousActions },
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'desc' }
    })
  }

  static async getFailedActions(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    return prisma.auditLog.findMany({
      where: {
        timestamp: { gte: since },
        details: {
          path: ['success'],
          equals: false
        }
      },
      orderBy: { timestamp: 'desc' }
    })
  }

  static async getAdminActions(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    return prisma.auditLog.findMany({
      where: {
        timestamp: { gte: since },
        action: { contains: 'admin' }
      },
      orderBy: { timestamp: 'desc' }
    })
  }

  // Bulk operations
  static async bulkDeleteAuditLogs(logIds: string[]) {
    return prisma.auditLog.deleteMany({
      where: { id: { in: logIds } }
    })
  }

  // Data retention and cleanup
  static async cleanOldAuditLogs(daysToKeep = 365) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    return prisma.auditLog.deleteMany({
      where: {
        timestamp: { lt: cutoffDate }
      }
    })
  }

  // Export functionality
  static async exportAuditLogs(filters: AuditLogFilters = {}) {
    const { action, resource, userId, ipAddress, dateFrom, dateTo } = filters

    const where: any = {}

    if (action) where.action = action
    if (resource) where.resource = resource
    if (userId) where.userId = userId
    if (ipAddress) where.ipAddress = ipAddress

    if (dateFrom || dateTo) {
      where.timestamp = {}
      if (dateFrom) where.timestamp.gte = dateFrom
      if (dateTo) where.timestamp.lte = dateTo
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' }
    })

    return {
      exportDate: new Date().toISOString(),
      filters,
      totalRecords: logs.length,
      logs
    }
  }

  // Search functionality
  static async searchAuditLogs(query: string, limit = 10) {
    return prisma.auditLog.findMany({
      where: {
        OR: [
          { action: { contains: query, mode: 'insensitive' } },
          { resource: { contains: query, mode: 'insensitive' } },
          { userName: { contains: query, mode: 'insensitive' } },
          { ipAddress: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      orderBy: { timestamp: 'desc' }
    })
  }

  // Compliance and reporting
  static async generateComplianceReport(startDate: Date, endDate: Date) {
    const logs = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'asc' }
    })

    const summary = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      totalActions: logs.length,
      uniqueUsers: new Set(logs.map(log => log.userId)).size,
      actionBreakdown: {} as Record<string, number>,
      resourceBreakdown: {} as Record<string, number>,
      dailyActivity: {} as Record<string, number>
    }

    logs.forEach(log => {
      // Action breakdown
      summary.actionBreakdown[log.action] = (summary.actionBreakdown[log.action] || 0) + 1
      
      // Resource breakdown
      summary.resourceBreakdown[log.resource] = (summary.resourceBreakdown[log.resource] || 0) + 1
      
      // Daily activity
      const day = log.timestamp.toISOString().split('T')[0]
      summary.dailyActivity[day] = (summary.dailyActivity[day] || 0) + 1
    })

    return {
      summary,
      logs
    }
  }

  // Validation
  static validateAuditLogData(data: CreateAuditLogData | UpdateAuditLogData) {
    const errors: string[] = []

    if ('action' in data && data.action) {
      if (data.action.length < 3) {
        errors.push('Action must be at least 3 characters long')
      }
      if (data.action.length > 100) {
        errors.push('Action must be less than 100 characters')
      }
    }

    if ('resource' in data && data.resource) {
      if (data.resource.length < 2) {
        errors.push('Resource must be at least 2 characters long')
      }
      if (data.resource.length > 50) {
        errors.push('Resource must be less than 50 characters')
      }
    }

    if ('ipAddress' in data && data.ipAddress) {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      if (!ipRegex.test(data.ipAddress)) {
        errors.push('Invalid IP address format')
      }
    }

    return errors
  }
}
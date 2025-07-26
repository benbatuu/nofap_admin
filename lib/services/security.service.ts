import { prisma } from '../prisma'
import { SecurityEventType, SecuritySeverity } from '../generated/prisma'

export interface CreateSecurityLogData {
  eventType: SecurityEventType
  description: string
  ipAddress: string
  userAgent?: string
  userId?: string
  severity: SecuritySeverity
  details?: any
}

export interface UpdateSecurityLogData {
  description?: string
  severity?: SecuritySeverity
  details?: any
  resolved?: boolean
  resolvedBy?: string
  resolvedAt?: Date
}

export interface SecurityLogFilters {
  page?: number
  limit?: number
  eventType?: SecurityEventType
  severity?: SecuritySeverity
  userId?: string
  ipAddress?: string
  resolved?: boolean
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

export class SecurityService {
  static async getSecurityLogs(filters: SecurityLogFilters = {}) {
    const { page = 1, limit = 10, eventType, severity, userId, ipAddress, resolved, search, dateFrom, dateTo } = filters

    const where: any = {}

    if (eventType) {
      where.eventType = eventType
    }

    if (severity) {
      where.severity = severity
    }

    if (userId) {
      where.userId = userId
    }

    if (ipAddress) {
      where.ipAddress = ipAddress
    }

    if (resolved !== undefined) {
      where.resolved = resolved
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { userAgent: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (dateFrom || dateTo) {
      where.timestamp = {}
      if (dateFrom) where.timestamp.gte = dateFrom
      if (dateTo) where.timestamp.lte = dateTo
    }

    const [securityLogs, total] = await Promise.all([
      prisma.securityLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'desc' }
      }),
      prisma.securityLog.count({ where })
    ])

    return {
      securityLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getSecurityLogById(id: string) {
    return prisma.securityLog.findUnique({
      where: { id }
    })
  }

  static async createSecurityLog(data: CreateSecurityLogData) {
    return prisma.securityLog.create({
      data: {
        ...data,
        resolved: false
      }
    })
  }

  static async updateSecurityLog(id: string, data: UpdateSecurityLogData) {
    return prisma.securityLog.update({
      where: { id },
      data
    })
  }

  static async deleteSecurityLog(id: string) {
    return prisma.securityLog.delete({
      where: { id }
    })
  }

  static async getSecurityStats() {
    const [total, unresolved, critical, high, medium, low] = await Promise.all([
      prisma.securityLog.count(),
      prisma.securityLog.count({ where: { resolved: false } }),
      prisma.securityLog.count({ where: { severity: 'critical' } }),
      prisma.securityLog.count({ where: { severity: 'high' } }),
      prisma.securityLog.count({ where: { severity: 'medium' } }),
      prisma.securityLog.count({ where: { severity: 'low' } })
    ])

    return {
      total,
      unresolved,
      bySeverity: {
        critical,
        high,
        medium,
        low
      }
    }
  }

  // Threat detection and monitoring
  static async logSecurityEvent(
    eventType: SecurityEventType,
    description: string,
    ipAddress: string,
    severity: SecuritySeverity = 'medium',
    userId?: string,
    userAgent?: string,
    details?: any
  ) {
    return this.createSecurityLog({
      eventType,
      description,
      ipAddress,
      userAgent,
      userId,
      severity,
      details
    })
  }

  static async getFailedLoginAttempts(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    return prisma.securityLog.findMany({
      where: {
        eventType: 'failed_login',
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'desc' }
    })
  }

  static async getSuspiciousActivity(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    return prisma.securityLog.findMany({
      where: {
        eventType: 'suspicious_activity',
        timestamp: { gte: since },
        severity: { in: ['high', 'critical'] }
      },
      orderBy: { timestamp: 'desc' }
    })
  }

  static async getSecurityEventsByType(eventType: SecurityEventType, limit = 10) {
    return prisma.securityLog.findMany({
      where: { eventType },
      orderBy: { timestamp: 'desc' },
      take: limit
    })
  }

  // IP-based security analysis
  static async getSecurityEventsByIP(ipAddress: string) {
    return prisma.securityLog.findMany({
      where: { ipAddress },
      orderBy: { timestamp: 'desc' }
    })
  }

  static async getTopThreatIPs(limit = 10) {
    const ips = await prisma.securityLog.groupBy({
      by: ['ipAddress'],
      _count: {
        ipAddress: true
      },
      where: {
        severity: { in: ['high', 'critical'] }
      },
      orderBy: {
        _count: {
          ipAddress: 'desc'
        }
      },
      take: limit
    })

    return ips.map(ip => ({
      ipAddress: ip.ipAddress,
      threatCount: ip._count.ipAddress
    }))
  }

  // Security analytics
  static async getSecurityAnalytics(days = 30) {
    const data = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const [total, critical, high, failed_logins, suspicious] = await Promise.all([
        prisma.securityLog.count({
          where: {
            timestamp: { gte: date, lt: nextDate }
          }
        }),
        prisma.securityLog.count({
          where: {
            timestamp: { gte: date, lt: nextDate },
            severity: 'critical'
          }
        }),
        prisma.securityLog.count({
          where: {
            timestamp: { gte: date, lt: nextDate },
            severity: 'high'
          }
        }),
        prisma.securityLog.count({
          where: {
            timestamp: { gte: date, lt: nextDate },
            eventType: 'failed_login'
          }
        }),
        prisma.securityLog.count({
          where: {
            timestamp: { gte: date, lt: nextDate },
            eventType: 'suspicious_activity'
          }
        })
      ])

      data.push({
        date: date.toISOString().split('T')[0],
        total,
        critical,
        high,
        failed_logins,
        suspicious
      })
    }

    return data
  }

  static async getEventTypeDistribution() {
    const events = await prisma.securityLog.groupBy({
      by: ['eventType'],
      _count: {
        eventType: true
      },
      orderBy: {
        _count: {
          eventType: 'desc'
        }
      }
    })

    return events.map(event => ({
      eventType: event.eventType,
      count: event._count.eventType
    }))
  }

  // Incident management
  static async resolveSecurityIncident(id: string, resolvedBy: string, notes?: string) {
    return this.updateSecurityLog(id, {
      resolved: true,
      resolvedBy,
      resolvedAt: new Date(),
      details: notes ? { resolution: notes } : undefined
    })
  }

  static async getUnresolvedIncidents() {
    return prisma.securityLog.findMany({
      where: { resolved: false },
      orderBy: [
        { severity: 'desc' },
        { timestamp: 'desc' }
      ]
    })
  }

  static async getCriticalIncidents() {
    return prisma.securityLog.findMany({
      where: {
        severity: 'critical',
        resolved: false
      },
      orderBy: { timestamp: 'desc' }
    })
  }

  // Bulk operations
  static async bulkResolveIncidents(logIds: string[], resolvedBy: string) {
    return prisma.securityLog.updateMany({
      where: { id: { in: logIds } },
      data: {
        resolved: true,
        resolvedBy,
        resolvedAt: new Date()
      }
    })
  }

  static async bulkDeleteSecurityLogs(logIds: string[]) {
    return prisma.securityLog.deleteMany({
      where: { id: { in: logIds } }
    })
  }

  // Automated threat detection
  static async detectBruteForceAttack(ipAddress: string, timeWindowMinutes = 15, threshold = 5) {
    const since = new Date(Date.now() - timeWindowMinutes * 60 * 1000)

    const failedAttempts = await prisma.securityLog.count({
      where: {
        ipAddress,
        eventType: 'failed_login',
        timestamp: { gte: since }
      }
    })

    if (failedAttempts >= threshold) {
      await this.logSecurityEvent(
        'suspicious_activity',
        `Potential brute force attack detected from IP ${ipAddress}. ${failedAttempts} failed login attempts in ${timeWindowMinutes} minutes.`,
        ipAddress,
        'high',
        undefined,
        undefined,
        { failedAttempts, timeWindow: timeWindowMinutes }
      )

      return true
    }

    return false
  }

  static async cleanOldSecurityLogs(daysToKeep = 90) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    return prisma.securityLog.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
        resolved: true,
        severity: { not: 'critical' }
      }
    })
  }

  // Validation
  static validateSecurityLogData(data: CreateSecurityLogData | UpdateSecurityLogData) {
    const errors: string[] = []

    if ('description' in data && data.description) {
      if (data.description.length < 10) {
        errors.push('Description must be at least 10 characters long')
      }
      if (data.description.length > 1000) {
        errors.push('Description must be less than 1000 characters')
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
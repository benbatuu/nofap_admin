import { prisma } from '../prisma'
import { BlockStatus } from '../generated/prisma'

export interface CreateBlockedIPData {
  ip: string
  reason: string
  blockedBy: string
  attempts: number
  location: string
  status: BlockStatus
}

export interface UpdateBlockedIPData {
  reason?: string
  blockedBy?: string
  attempts?: number
  location?: string
  status?: BlockStatus
}

export interface BlockedIPFilters {
  page?: number
  limit?: number
  status?: BlockStatus
  blockedBy?: string
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

export class BlockedIPService {
  static async getBlockedIPs(filters: BlockedIPFilters = {}) {
    const { page = 1, limit = 10, status, blockedBy, search, dateFrom, dateTo } = filters

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (blockedBy) {
      where.blockedBy = blockedBy
    }

    if (search) {
      where.OR = [
        { ip: { contains: search, mode: 'insensitive' } },
        { reason: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (dateFrom || dateTo) {
      where.blockedAt = {}
      if (dateFrom) where.blockedAt.gte = dateFrom
      if (dateTo) where.blockedAt.lte = dateTo
    }

    const [blockedIPs, total] = await Promise.all([
      prisma.blockedIP.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { blockedAt: 'desc' }
      }),
      prisma.blockedIP.count({ where })
    ])

    return {
      blockedIPs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getBlockedIPById(id: string) {
    return prisma.blockedIP.findUnique({
      where: { id }
    })
  }

  static async createBlockedIP(data: CreateBlockedIPData) {
    return prisma.blockedIP.create({
      data: {
        ...data,
        blockedAt: new Date()
      }
    })
  }

  static async updateBlockedIP(id: string, data: UpdateBlockedIPData) {
    return prisma.blockedIP.update({
      where: { id },
      data
    })
  }

  static async deleteBlockedIP(id: string) {
    return prisma.blockedIP.delete({
      where: { id }
    })
  }

  static async getBlockedIPStats() {
    const [total, active, temporary, permanent] = await Promise.all([
      prisma.blockedIP.count(),
      prisma.blockedIP.count({ where: { status: 'active' } }),
      prisma.blockedIP.count({ where: { status: 'temporary' } }),
      prisma.blockedIP.count({ where: { status: 'permanent' } })
    ])

    return { total, active, temporary, permanent }
  }

  static async getBlockedIPByAddress(ip: string) {
    return prisma.blockedIP.findFirst({
      where: { ip }
    })
  }

  static async isIPBlocked(ip: string) {
    const blockedIP = await prisma.blockedIP.findFirst({
      where: {
        ip,
        status: { in: ['active', 'permanent', 'temporary'] }
      }
    })

    return !!blockedIP
  }

  static async blockIP(ip: string, reason: string, blockedBy: string, attempts = 1, location = 'Unknown') {
    const existingBlock = await this.getBlockedIPByAddress(ip)
    
    if (existingBlock) {
      return this.updateBlockedIP(existingBlock.id, {
        attempts: existingBlock.attempts + attempts,
        reason,
        blockedBy
      })
    }

    return this.createBlockedIP({
      ip,
      reason,
      blockedBy,
      attempts,
      location,
      status: 'active'
    })
  }

  static async unblockIP(id: string) {
    return this.deleteBlockedIP(id)
  }

  static async incrementAttempts(ip: string) {
    const blockedIP = await this.getBlockedIPByAddress(ip)
    
    if (blockedIP) {
      return this.updateBlockedIP(blockedIP.id, {
        attempts: blockedIP.attempts + 1
      })
    }

    return null
  }

  static async getTopBlockedIPs(limit = 10) {
    return prisma.blockedIP.findMany({
      orderBy: { attempts: 'desc' },
      take: limit
    })
  }

  static async getBlockedIPsByLocation(location: string) {
    return prisma.blockedIP.findMany({
      where: { location },
      orderBy: { blockedAt: 'desc' }
    })
  }

  static async autoBlockIP(ip: string, attempts: number, threshold = 10) {
    if (attempts >= threshold) {
      return this.blockIP(
        ip,
        `Auto-blocked after ${attempts} failed attempts`,
        'system',
        attempts
      )
    }
    return null
  }
}
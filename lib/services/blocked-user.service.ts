import { prisma } from '../prisma'
import { BlockStatus } from '../generated/prisma'

export interface CreateBlockedUserData {
  username: string
  email: string
  reason: string
  blockedBy: string
  status: BlockStatus
  blockedUntil?: Date
}

export interface UpdateBlockedUserData {
  username?: string
  email?: string
  reason?: string
  blockedBy?: string
  status?: BlockStatus
  blockedUntil?: Date
}

export interface BlockedUserFilters {
  page?: number
  limit?: number
  status?: BlockStatus
  blockedBy?: string
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

export class BlockedUserService {
  static async getBlockedUsers(filters: BlockedUserFilters = {}) {
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
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { reason: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (dateFrom || dateTo) {
      where.blockedDate = {}
      if (dateFrom) where.blockedDate.gte = dateFrom
      if (dateTo) where.blockedDate.lte = dateTo
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

  static async getBlockedUserById(id: string) {
    return prisma.blockedUser.findUnique({
      where: { id }
    })
  }

  static async createBlockedUser(data: CreateBlockedUserData) {
    return prisma.blockedUser.create({
      data: {
        ...data,
        blockedDate: new Date()
      }
    })
  }

  static async updateBlockedUser(id: string, data: UpdateBlockedUserData) {
    return prisma.blockedUser.update({
      where: { id },
      data
    })
  }

  static async deleteBlockedUser(id: string) {
    return prisma.blockedUser.delete({
      where: { id }
    })
  }

  static async getBlockedUserStats() {
    const [total, active, temporary, permanent] = await Promise.all([
      prisma.blockedUser.count(),
      prisma.blockedUser.count({ where: { status: 'active' } }),
      prisma.blockedUser.count({ where: { status: 'temporary' } }),
      prisma.blockedUser.count({ where: { status: 'permanent' } })
    ])

    return { total, active, temporary, permanent }
  }

  static async getBlockedUserByEmail(email: string) {
    return prisma.blockedUser.findFirst({
      where: { email }
    })
  }

  static async getBlockedUserByUsername(username: string) {
    return prisma.blockedUser.findFirst({
      where: { username }
    })
  }

  static async isUserBlocked(email: string, username?: string) {
    const where: any = {
      OR: [{ email }]
    }

    if (username) {
      where.OR.push({ username })
    }

    const blockedUser = await prisma.blockedUser.findFirst({
      where: {
        ...where,
        status: { in: ['active', 'permanent'] }
      }
    })

    if (!blockedUser) return false

    // Check if temporary block has expired
    if (blockedUser.status === 'temporary' && blockedUser.blockedUntil) {
      if (new Date() > blockedUser.blockedUntil) {
        // Automatically unblock expired temporary blocks
        await this.updateBlockedUser(blockedUser.id, { status: 'active' })
        return false
      }
    }

    return true
  }

  static async unblockUser(id: string) {
    return this.updateBlockedUser(id, { status: 'active' })
  }

  static async blockUserPermanently(id: string, reason: string, blockedBy: string) {
    return this.updateBlockedUser(id, { 
      status: 'permanent',
      reason,
      blockedBy,
      blockedUntil: null
    })
  }

  static async blockUserTemporarily(id: string, reason: string, blockedBy: string, blockedUntil: Date) {
    return this.updateBlockedUser(id, { 
      status: 'temporary',
      reason,
      blockedBy,
      blockedUntil
    })
  }

  static async getExpiredTemporaryBlocks() {
    const now = new Date()
    
    return prisma.blockedUser.findMany({
      where: {
        status: 'temporary',
        blockedUntil: { lt: now }
      }
    })
  }

  static async cleanupExpiredBlocks() {
    const expiredBlocks = await this.getExpiredTemporaryBlocks()
    
    const updatePromises = expiredBlocks.map(block => 
      this.updateBlockedUser(block.id, { status: 'active' })
    )

    return Promise.all(updatePromises)
  }
}
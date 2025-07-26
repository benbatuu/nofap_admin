import { prisma } from '../prisma'

export interface CreateRoleData {
  name: string
  description: string
  permissions: string[]
}

export interface UpdateRoleData {
  name?: string
  description?: string
  permissions?: string[]
  userCount?: number
}

export interface RoleFilters {
  page?: number
  limit?: number
  search?: string
}

export class RoleService {
  static async getRoles(filters: RoleFilters = {}) {
    const { page = 1, limit = 10, search } = filters

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.role.count({ where })
    ])

    return {
      roles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getRoleById(id: string) {
    return prisma.role.findUnique({
      where: { id }
    })
  }

  static async createRole(data: CreateRoleData) {
    return prisma.role.create({
      data: {
        ...data,
        userCount: 0
      }
    })
  }

  static async updateRole(id: string, data: UpdateRoleData) {
    return prisma.role.update({
      where: { id },
      data
    })
  }

  static async deleteRole(id: string) {
    return prisma.role.delete({
      where: { id }
    })
  }

  static async getRoleStats() {
    const total = await prisma.role.count()
    const totalUsers = await prisma.role.aggregate({
      _sum: { userCount: true }
    })

    return { 
      total,
      totalUsers: totalUsers._sum.userCount || 0
    }
  }

  static async getAllRoles() {
    return prisma.role.findMany({
      orderBy: { name: 'asc' }
    })
  }

  static async getRoleByName(name: string) {
    return prisma.role.findFirst({
      where: { name }
    })
  }

  static async incrementUserCount(id: string) {
    return prisma.role.update({
      where: { id },
      data: {
        userCount: { increment: 1 }
      }
    })
  }

  static async decrementUserCount(id: string) {
    return prisma.role.update({
      where: { id },
      data: {
        userCount: { decrement: 1 }
      }
    })
  }
}
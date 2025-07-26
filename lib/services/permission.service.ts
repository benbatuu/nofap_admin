import { prisma } from '../prisma'

export interface CreatePermissionData {
  name: string
  description: string
  category: string
}

export interface UpdatePermissionData {
  name?: string
  description?: string
  category?: string
  rolesCount?: number
}

export interface PermissionFilters {
  page?: number
  limit?: number
  category?: string
  search?: string
}

export class PermissionService {
  static async getPermissions(filters: PermissionFilters = {}) {
    const { page = 1, limit = 10, category, search } = filters

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { category: 'asc' }
      }),
      prisma.permission.count({ where })
    ])

    return {
      permissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getPermissionById(id: string) {
    return prisma.permission.findUnique({
      where: { id }
    })
  }

  static async createPermission(data: CreatePermissionData) {
    return prisma.permission.create({
      data: {
        ...data,
        rolesCount: 0
      }
    })
  }

  static async updatePermission(id: string, data: UpdatePermissionData) {
    return prisma.permission.update({
      where: { id },
      data
    })
  }

  static async deletePermission(id: string) {
    return prisma.permission.delete({
      where: { id }
    })
  }

  static async getPermissionStats() {
    const total = await prisma.permission.count()
    const categories = await prisma.permission.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    })

    return { 
      total,
      categories: categories.map(cat => ({
        name: cat.category,
        count: cat._count.category
      }))
    }
  }

  static async getAllPermissions() {
    return prisma.permission.findMany({
      orderBy: { name: 'asc' }
    })
  }

  static async getPermissionsByCategory(category: string) {
    return prisma.permission.findMany({
      where: { category },
      orderBy: { name: 'asc' }
    })
  }

  static async getPermissionByName(name: string) {
    return prisma.permission.findFirst({
      where: { name }
    })
  }

  static async incrementRolesCount(id: string) {
    return prisma.permission.update({
      where: { id },
      data: {
        rolesCount: { increment: 1 }
      }
    })
  }

  static async decrementRolesCount(id: string) {
    return prisma.permission.update({
      where: { id },
      data: {
        rolesCount: { decrement: 1 }
      }
    })
  }

  static async getCategories() {
    const categories = await prisma.permission.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        category: 'asc'
      }
    })

    return categories.map(cat => ({
      name: cat.category,
      count: cat._count.category
    }))
  }
}
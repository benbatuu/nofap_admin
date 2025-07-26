import { prisma } from '../prisma'
import { ProductType } from '../generated/prisma'

export interface CreateProductData {
  name: string
  description: string
  price: number
  currency: string
  type: ProductType
  duration?: string
  isActive?: boolean
}

export interface UpdateProductData {
  name?: string
  description?: string
  price?: number
  currency?: string
  type?: ProductType
  duration?: string
  subscribers?: number
  isActive?: boolean
}

export interface ProductFilters {
  page?: number
  limit?: number
  type?: ProductType
  isActive?: boolean
  search?: string
  priceMin?: number
  priceMax?: number
}

export class ProductService {
  static async getProducts(filters: ProductFilters = {}) {
    const { page = 1, limit = 10, type, isActive, search, priceMin, priceMax } = filters

    const where: any = {}

    if (type) {
      where.type = type
    }

    if (isActive !== undefined) {
      where.isActive = isActive
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {}
      if (priceMin !== undefined) where.price.gte = priceMin
      if (priceMax !== undefined) where.price.lte = priceMax
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ])

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id }
    })
  }

  static async createProduct(data: CreateProductData) {
    return prisma.product.create({
      data: {
        ...data,
        subscribers: 0,
        isActive: data.isActive ?? true
      }
    })
  }

  static async updateProduct(id: string, data: UpdateProductData) {
    return prisma.product.update({
      where: { id },
      data
    })
  }

  static async deleteProduct(id: string) {
    return prisma.product.delete({
      where: { id }
    })
  }

  static async getProductStats() {
    const [total, active, subscription, oneTime] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { type: 'subscription' } }),
      prisma.product.count({ where: { type: 'one_time' } })
    ])

    const totalSubscribers = await prisma.product.aggregate({
      _sum: { subscribers: true }
    })

    return { 
      total, 
      active, 
      subscription, 
      oneTime,
      totalSubscribers: totalSubscribers._sum.subscribers || 0
    }
  }

  static async getActiveProducts() {
    return prisma.product.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    })
  }

  static async getPopularProducts(limit = 5) {
    return prisma.product.findMany({
      where: { isActive: true },
      orderBy: { subscribers: 'desc' },
      take: limit
    })
  }

  static async incrementSubscribers(id: string) {
    return prisma.product.update({
      where: { id },
      data: {
        subscribers: { increment: 1 }
      }
    })
  }

  static async decrementSubscribers(id: string) {
    return prisma.product.update({
      where: { id },
      data: {
        subscribers: { decrement: 1 }
      }
    })
  }

  static async toggleActiveStatus(id: string) {
    const product = await this.getProductById(id)
    if (!product) return null

    return this.updateProduct(id, { isActive: !product.isActive })
  }
}
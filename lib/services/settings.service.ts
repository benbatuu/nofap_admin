import { prisma } from '../prisma'
import { SystemSettingType } from '../generated/prisma'

export interface CreateSystemSettingData {
  key: string
  value: string
  type: SystemSettingType
  category: string
  description: string
  isPublic?: boolean
  updatedBy: string
}

export interface UpdateSystemSettingData {
  value?: string
  type?: SystemSettingType
  category?: string
  description?: string
  isPublic?: boolean
  updatedBy: string
}

export interface SystemSettingFilters {
  page?: number
  limit?: number
  category?: string
  type?: SystemSettingType
  isPublic?: boolean
  search?: string
}

export class SettingsService {
  static async getSystemSettings(filters: SystemSettingFilters = {}) {
    const { page = 1, limit = 10, category, type, isPublic, search } = filters

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (type) {
      where.type = type
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic
    }

    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [settings, total] = await Promise.all([
      prisma.systemSetting.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { category: 'asc' }
      }),
      prisma.systemSetting.count({ where })
    ])

    return {
      settings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getSystemSettingById(id: string) {
    return prisma.systemSetting.findUnique({
      where: { id }
    })
  }

  static async getSystemSettingByKey(key: string) {
    return prisma.systemSetting.findUnique({
      where: { key }
    })
  }

  static async createSystemSetting(data: CreateSystemSettingData) {
    return prisma.systemSetting.create({
      data: {
        ...data,
        isPublic: data.isPublic ?? false
      }
    })
  }

  static async updateSystemSetting(id: string, data: UpdateSystemSettingData) {
    return prisma.systemSetting.update({
      where: { id },
      data
    })
  }

  static async updateSystemSettingByKey(key: string, data: UpdateSystemSettingData) {
    return prisma.systemSetting.update({
      where: { key },
      data
    })
  }

  static async deleteSystemSetting(id: string) {
    return prisma.systemSetting.delete({
      where: { id }
    })
  }

  static async deleteSystemSettingByKey(key: string) {
    return prisma.systemSetting.delete({
      where: { key }
    })
  }

  // Settings management by category
  static async getSettingsByCategory(category: string) {
    return prisma.systemSetting.findMany({
      where: { category },
      orderBy: { key: 'asc' }
    })
  }

  static async getSettingsCategories() {
    const categories = await prisma.systemSetting.groupBy({
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

  // Public settings (for frontend consumption)
  static async getPublicSettings() {
    return prisma.systemSetting.findMany({
      where: { isPublic: true },
      select: {
        key: true,
        value: true,
        type: true,
        category: true
      },
      orderBy: { category: 'asc' }
    })
  }

  static async getPublicSettingsByCategory(category: string) {
    return prisma.systemSetting.findMany({
      where: {
        category,
        isPublic: true
      },
      select: {
        key: true,
        value: true,
        type: true
      },
      orderBy: { key: 'asc' }
    })
  }

  // Typed value getters
  static async getSettingValue(key: string): Promise<any> {
    const setting = await this.getSystemSettingByKey(key)
    if (!setting) return null

    switch (setting.type) {
      case 'boolean':
        return setting.value === 'true'
      case 'number':
        return parseFloat(setting.value)
      case 'json':
        try {
          return JSON.parse(setting.value)
        } catch {
          return null
        }
      default:
        return setting.value
    }
  }

  static async setSettingValue(key: string, value: any, updatedBy: string) {
    const setting = await this.getSystemSettingByKey(key)
    if (!setting) {
      throw new Error(`Setting with key '${key}' not found`)
    }

    let stringValue: string

    switch (setting.type) {
      case 'boolean':
        stringValue = Boolean(value).toString()
        break
      case 'number':
        stringValue = Number(value).toString()
        break
      case 'json':
        stringValue = JSON.stringify(value)
        break
      default:
        stringValue = String(value)
    }

    return this.updateSystemSettingByKey(key, {
      value: stringValue,
      updatedBy
    })
  }

  // Bulk operations
  static async bulkUpdateSettings(updates: Array<{ key: string; value: any }>, updatedBy: string) {
    const results = await Promise.all(
      updates.map(update => 
        this.setSettingValue(update.key, update.value, updatedBy)
      )
    )
    return results
  }

  static async bulkDeleteSettings(keys: string[]) {
    return prisma.systemSetting.deleteMany({
      where: { key: { in: keys } }
    })
  }

  // Settings backup and restore
  static async exportSettings(category?: string) {
    const where = category ? { category } : {}
    
    const settings = await prisma.systemSetting.findMany({
      where,
      select: {
        key: true,
        value: true,
        type: true,
        category: true,
        description: true,
        isPublic: true
      },
      orderBy: { category: 'asc' }
    })

    return {
      exportDate: new Date().toISOString(),
      category: category || 'all',
      settings
    }
  }

  static async importSettings(settingsData: any[], updatedBy: string, overwrite = false) {
    const results = []

    for (const settingData of settingsData) {
      try {
        const existing = await this.getSystemSettingByKey(settingData.key)

        if (existing && !overwrite) {
          results.push({
            key: settingData.key,
            status: 'skipped',
            message: 'Setting already exists'
          })
          continue
        }

        if (existing && overwrite) {
          await this.updateSystemSettingByKey(settingData.key, {
            value: settingData.value,
            type: settingData.type,
            category: settingData.category,
            description: settingData.description,
            isPublic: settingData.isPublic,
            updatedBy
          })
          results.push({
            key: settingData.key,
            status: 'updated',
            message: 'Setting updated successfully'
          })
        } else {
          await this.createSystemSetting({
            key: settingData.key,
            value: settingData.value,
            type: settingData.type,
            category: settingData.category,
            description: settingData.description,
            isPublic: settingData.isPublic,
            updatedBy
          })
          results.push({
            key: settingData.key,
            status: 'created',
            message: 'Setting created successfully'
          })
        }
      } catch (error) {
        results.push({
          key: settingData.key,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }

  // Settings validation and testing
  static async validateSettingValue(key: string, value: any) {
    const setting = await this.getSystemSettingByKey(key)
    if (!setting) {
      return { valid: false, error: 'Setting not found' }
    }

    try {
      switch (setting.type) {
        case 'boolean':
          if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
            return { valid: false, error: 'Value must be a boolean' }
          }
          break
        case 'number':
          if (isNaN(Number(value))) {
            return { valid: false, error: 'Value must be a number' }
          }
          break
        case 'json':
          if (typeof value === 'string') {
            JSON.parse(value)
          } else {
            JSON.stringify(value)
          }
          break
        case 'string':
          if (typeof value !== 'string') {
            return { valid: false, error: 'Value must be a string' }
          }
          break
      }

      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Invalid value format' 
      }
    }
  }

  // Common settings helpers
  static async getMaintenanceMode() {
    return this.getSettingValue('system.maintenance_mode')
  }

  static async setMaintenanceMode(enabled: boolean, updatedBy: string) {
    return this.setSettingValue('system.maintenance_mode', enabled, updatedBy)
  }

  static async getAppSettings() {
    return this.getSettingsByCategory('app')
  }

  static async getUISettings() {
    return this.getSettingsByCategory('ui')
  }

  static async getNotificationSettings() {
    return this.getSettingsByCategory('notifications')
  }

  static async getSecuritySettings() {
    return this.getSettingsByCategory('security')
  }

  // Search functionality
  static async searchSettings(query: string, limit = 10) {
    return prisma.systemSetting.findMany({
      where: {
        OR: [
          { key: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      orderBy: { category: 'asc' }
    })
  }

  // Validation
  static validateSystemSettingData(data: CreateSystemSettingData | UpdateSystemSettingData) {
    const errors: string[] = []

    if ('key' in data && data.key) {
      if (data.key.length < 3) {
        errors.push('Key must be at least 3 characters long')
      }
      if (data.key.length > 100) {
        errors.push('Key must be less than 100 characters')
      }
      if (!/^[a-zA-Z0-9._-]+$/.test(data.key)) {
        errors.push('Key can only contain letters, numbers, dots, underscores, and hyphens')
      }
    }

    if ('description' in data && data.description) {
      if (data.description.length < 10) {
        errors.push('Description must be at least 10 characters long')
      }
      if (data.description.length > 500) {
        errors.push('Description must be less than 500 characters')
      }
    }

    if ('category' in data && data.category) {
      if (data.category.length < 2) {
        errors.push('Category must be at least 2 characters long')
      }
      if (data.category.length > 50) {
        errors.push('Category must be less than 50 characters')
      }
    }

    return errors
  }
}
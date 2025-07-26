import { prisma } from '../prisma'

export interface CreateDeviceData {
  userId: string
  deviceId: string
  deviceName: string
  deviceType: string
  os: string
  browser?: string
  ipAddress: string
  location?: string
  isTrusted?: boolean
}

export interface UpdateDeviceData {
  deviceName?: string
  deviceType?: string
  os?: string
  browser?: string
  ipAddress?: string
  location?: string
  isActive?: boolean
  isTrusted?: boolean
}

export interface DeviceFilters {
  page?: number
  limit?: number
  userId?: string
  deviceType?: string
  os?: string
  isActive?: boolean
  isTrusted?: boolean
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

export class DeviceService {
  static async getDevices(filters: DeviceFilters = {}) {
    const { page = 1, limit = 10, userId, deviceType, os, isActive, isTrusted, search, dateFrom, dateTo } = filters

    const where: any = {}

    if (userId) {
      where.userId = userId
    }

    if (deviceType) {
      where.deviceType = deviceType
    }

    if (os) {
      where.os = os
    }

    if (isActive !== undefined) {
      where.isActive = isActive
    }

    if (isTrusted !== undefined) {
      where.isTrusted = isTrusted
    }

    if (search) {
      where.OR = [
        { deviceName: { contains: search, mode: 'insensitive' } },
        { deviceType: { contains: search, mode: 'insensitive' } },
        { os: { contains: search, mode: 'insensitive' } },
        { browser: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (dateFrom || dateTo) {
      where.lastSeen = {}
      if (dateFrom) where.lastSeen.gte = dateFrom
      if (dateTo) where.lastSeen.lte = dateTo
    }

    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { lastSeen: 'desc' },
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
      prisma.device.count({ where })
    ])

    return {
      devices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getDeviceById(id: string) {
    return prisma.device.findUnique({
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

  static async getDeviceByDeviceId(deviceId: string) {
    return prisma.device.findUnique({
      where: { deviceId },
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

  static async createDevice(data: CreateDeviceData) {
    return prisma.device.create({
      data: {
        ...data,
        isActive: true,
        isTrusted: data.isTrusted ?? false
      },
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

  static async updateDevice(id: string, data: UpdateDeviceData) {
    return prisma.device.update({
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

  static async deleteDevice(id: string) {
    return prisma.device.delete({
      where: { id }
    })
  }

  // Device tracking and management
  static async updateLastSeen(deviceId: string, ipAddress?: string, location?: string) {
    const updateData: any = {
      lastSeen: new Date()
    }

    if (ipAddress) updateData.ipAddress = ipAddress
    if (location) updateData.location = location

    return prisma.device.update({
      where: { deviceId },
      data: updateData
    })
  }

  static async getUserDevices(userId: string) {
    return prisma.device.findMany({
      where: { userId },
      orderBy: { lastSeen: 'desc' }
    })
  }

  static async getActiveDevices(userId?: string) {
    const where: any = { isActive: true }
    if (userId) where.userId = userId

    return prisma.device.findMany({
      where,
      orderBy: { lastSeen: 'desc' },
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

  static async getTrustedDevices(userId?: string) {
    const where: any = { isTrusted: true }
    if (userId) where.userId = userId

    return prisma.device.findMany({
      where,
      orderBy: { lastSeen: 'desc' },
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

  // Device analytics
  static async getDeviceStats() {
    const [total, active, trusted, untrusted] = await Promise.all([
      prisma.device.count(),
      prisma.device.count({ where: { isActive: true } }),
      prisma.device.count({ where: { isTrusted: true } }),
      prisma.device.count({ where: { isTrusted: false } })
    ])

    return {
      total,
      active,
      trusted,
      untrusted
    }
  }

  static async getDeviceTypeDistribution() {
    const types = await prisma.device.groupBy({
      by: ['deviceType'],
      _count: {
        deviceType: true
      },
      orderBy: {
        _count: {
          deviceType: 'desc'
        }
      }
    })

    return types.map(type => ({
      deviceType: type.deviceType,
      count: type._count.deviceType
    }))
  }

  static async getOSDistribution() {
    const oses = await prisma.device.groupBy({
      by: ['os'],
      _count: {
        os: true
      },
      orderBy: {
        _count: {
          os: 'desc'
        }
      }
    })

    return oses.map(os => ({
      os: os.os,
      count: os._count.os
    }))
  }

  static async getBrowserDistribution() {
    const browsers = await prisma.device.groupBy({
      by: ['browser'],
      _count: {
        browser: true
      },
      where: {
        browser: { not: null }
      },
      orderBy: {
        _count: {
          browser: 'desc'
        }
      }
    })

    return browsers.map(browser => ({
      browser: browser.browser,
      count: browser._count.browser
    }))
  }

  static async getLocationDistribution() {
    const locations = await prisma.device.groupBy({
      by: ['location'],
      _count: {
        location: true
      },
      where: {
        location: { not: null }
      },
      orderBy: {
        _count: {
          location: 'desc'
        }
      }
    })

    return locations.map(location => ({
      location: location.location,
      count: location._count.location
    }))
  }

  // Suspicious device detection
  static async detectSuspiciousDevices() {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    // Devices with multiple IP addresses in short time
    const suspiciousDevices = await prisma.device.findMany({
      where: {
        lastSeen: { gte: oneHourAgo },
        isTrusted: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Group by user and check for multiple devices
    const userDeviceMap = new Map()
    suspiciousDevices.forEach(device => {
      if (!userDeviceMap.has(device.userId)) {
        userDeviceMap.set(device.userId, [])
      }
      userDeviceMap.get(device.userId).push(device)
    })

    const suspicious = []
    for (const [userId, devices] of userDeviceMap) {
      if (devices.length > 3) { // More than 3 devices in 1 hour
        suspicious.push({
          userId,
          user: devices[0].user,
          deviceCount: devices.length,
          devices
        })
      }
    }

    return suspicious
  }

  static async getDevicesByIP(ipAddress: string) {
    return prisma.device.findMany({
      where: { ipAddress },
      orderBy: { lastSeen: 'desc' },
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

  // Device management actions
  static async trustDevice(id: string) {
    return this.updateDevice(id, { isTrusted: true })
  }

  static async untrustDevice(id: string) {
    return this.updateDevice(id, { isTrusted: false })
  }

  static async deactivateDevice(id: string) {
    return this.updateDevice(id, { isActive: false })
  }

  static async reactivateDevice(id: string) {
    return this.updateDevice(id, { isActive: true })
  }

  // Bulk operations
  static async bulkTrustDevices(deviceIds: string[]) {
    return prisma.device.updateMany({
      where: { id: { in: deviceIds } },
      data: { isTrusted: true }
    })
  }

  static async bulkUntrustDevices(deviceIds: string[]) {
    return prisma.device.updateMany({
      where: { id: { in: deviceIds } },
      data: { isTrusted: false }
    })
  }

  static async bulkDeactivateDevices(deviceIds: string[]) {
    return prisma.device.updateMany({
      where: { id: { in: deviceIds } },
      data: { isActive: false }
    })
  }

  static async bulkDeleteDevices(deviceIds: string[]) {
    return prisma.device.deleteMany({
      where: { id: { in: deviceIds } }
    })
  }

  // Device registration and authentication
  static async registerOrUpdateDevice(data: CreateDeviceData) {
    const existingDevice = await this.getDeviceByDeviceId(data.deviceId)

    if (existingDevice) {
      return this.updateDevice(existingDevice.id, {
        deviceName: data.deviceName,
        deviceType: data.deviceType,
        os: data.os,
        browser: data.browser,
        ipAddress: data.ipAddress,
        location: data.location
      })
    } else {
      return this.createDevice(data)
    }
  }

  // Cleanup old devices
  static async cleanupInactiveDevices(daysInactive = 90) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive)

    return prisma.device.deleteMany({
      where: {
        lastSeen: { lt: cutoffDate },
        isActive: false,
        isTrusted: false
      }
    })
  }

  // Validation
  static validateDeviceData(data: CreateDeviceData | UpdateDeviceData) {
    const errors: string[] = []

    if ('deviceName' in data && data.deviceName) {
      if (data.deviceName.length < 2) {
        errors.push('Device name must be at least 2 characters long')
      }
      if (data.deviceName.length > 100) {
        errors.push('Device name must be less than 100 characters')
      }
    }

    if ('deviceType' in data && data.deviceType) {
      if (data.deviceType.length < 2) {
        errors.push('Device type must be at least 2 characters long')
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
import { prisma } from '../prisma'
import { MessageType, MessageStatus } from '../generated/prisma'

export interface CreateMessageData {
  sender: string
  title: string
  type: MessageType
  message: string
  userId?: string
  tags?: string[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  scheduledAt?: Date
  isScheduled?: boolean
}

export interface UpdateMessageData {
  title?: string
  message?: string
  status?: MessageStatus
  type?: MessageType
  tags?: string[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  scheduledAt?: Date
  isScheduled?: boolean
  deliveredAt?: Date
  readAt?: Date
}

export interface MessageReplyData {
  messageId: string
  replyText: string
  adminId: string
  adminName: string
}

export interface MessageFilters {
  page?: number
  limit?: number
  type?: MessageType
  status?: MessageStatus
  userId?: string
  search?: string
  category?: string
  tags?: string[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  isScheduled?: boolean
  dateFrom?: Date
  dateTo?: Date
}

export class MessageService {
  static async getMessages(filters: MessageFilters = {}) {
    const { page = 1, limit = 10, type, status, userId, search } = filters

    const where: any = {}

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    if (userId) {
      where.userId = userId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { sender: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      prisma.message.count({ where })
    ])

    return {
      messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getMessageById(id: string) {
    return prisma.message.findUnique({
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

  static async createMessage(data: CreateMessageData) {
    return prisma.message.create({
      data: {
        ...data,
        status: 'pending'
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

  static async updateMessage(id: string, data: UpdateMessageData) {
    return prisma.message.update({
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

  static async deleteMessage(id: string) {
    return prisma.message.delete({
      where: { id }
    })
  }

  static async getMessageStats() {
    const [total, pending, read, replied] = await Promise.all([
      prisma.message.count(),
      prisma.message.count({ where: { status: 'pending' } }),
      prisma.message.count({ where: { status: 'read' } }),
      prisma.message.count({ where: { status: 'replied' } })
    ])

    return { total, pending, read, replied }
  }

  static async markAsRead(id: string) {
    return this.updateMessage(id, { status: 'read' })
  }

  static async markAsReplied(id: string) {
    return this.updateMessage(id, { status: 'replied' })
  }

  // Advanced filtering and analytics
  static async getMessagesByDateRange(startDate: Date, endDate: Date) {
    return prisma.message.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' },
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

  static async getMessageAnalytics(days = 30) {
    const data = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const [total, pending, read, replied] = await Promise.all([
        prisma.message.count({
          where: {
            createdAt: { gte: date, lt: nextDate }
          }
        }),
        prisma.message.count({
          where: {
            createdAt: { gte: date, lt: nextDate },
            status: 'pending'
          }
        }),
        prisma.message.count({
          where: {
            createdAt: { gte: date, lt: nextDate },
            status: 'read'
          }
        }),
        prisma.message.count({
          where: {
            createdAt: { gte: date, lt: nextDate },
            status: 'replied'
          }
        })
      ])

      data.push({
        date: date.toISOString().split('T')[0],
        total,
        pending,
        read,
        replied
      })
    }

    return data
  }

  static async getMessagesByType(type: MessageType, limit = 10) {
    return prisma.message.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' },
      take: limit,
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

  static async getResponseTimeStats() {
    // This would require additional fields to track response times
    // For now, return mock data structure
    const messages = await prisma.message.findMany({
      where: { status: 'replied' },
      select: {
        createdAt: true,
        status: true
      }
    })

    return {
      averageResponseTime: '2.5 hours', // Mock data
      totalReplied: messages.length
    }
  }

  // Bulk operations
  static async bulkUpdateMessageStatus(messageIds: string[], status: MessageStatus) {
    return prisma.message.updateMany({
      where: { id: { in: messageIds } },
      data: { status }
    })
  }

  static async bulkDeleteMessages(messageIds: string[]) {
    return prisma.message.deleteMany({
      where: { id: { in: messageIds } }
    })
  }

  // Message categorization and tagging
  static async getMessageCategories() {
    const types = await prisma.message.groupBy({
      by: ['type'],
      _count: {
        type: true
      },
      orderBy: {
        _count: {
          type: 'desc'
        }
      }
    })

    return types.map(type => ({
      name: type.type,
      count: type._count.type
    }))
  }

  static async searchMessages(query: string, limit = 10) {
    return prisma.message.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { message: { contains: query, mode: 'insensitive' } },
          { sender: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
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

  // Priority and urgency handling
  static async getUrgentMessages() {
    return prisma.message.findMany({
      where: {
        type: { in: ['bug', 'support'] },
        status: 'pending'
      },
      orderBy: { createdAt: 'asc' },
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

  static async getOldestPendingMessages(limit = 10) {
    return prisma.message.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: limit,
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

  // Message reply functionality
  static async createMessageReply(data: MessageReplyData) {
    // First, mark the original message as replied
    await this.markAsReplied(data.messageId)
    
    // Create a reply record (you might want to create a MessageReply model)
    // For now, we'll create a system message as a reply
    return prisma.message.create({
      data: {
        sender: data.adminName,
        title: `Re: ${(await this.getMessageById(data.messageId))?.title}`,
        type: 'system',
        message: data.replyText,
        status: 'read',
        userId: data.adminId
      }
    })
  }

  static async getMessageReplies(messageId: string) {
    const originalMessage = await this.getMessageById(messageId)
    if (!originalMessage) return []

    return prisma.message.findMany({
      where: {
        title: { startsWith: `Re: ${originalMessage.title}` },
        type: 'system'
      },
      orderBy: { createdAt: 'asc' },
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

  // Message tagging functionality
  static async addTagsToMessage(messageId: string, tags: string[]) {
    // This would require a MessageTag model or tags field in Message model
    // For now, we'll update the message with tags in a JSON field
    const message = await this.getMessageById(messageId)
    if (!message) throw new Error('Message not found')

    return this.updateMessage(messageId, { 
      // Assuming we add a tags field to the Message model
      tags: tags
    })
  }

  static async getMessagesByTag(tag: string) {
    return prisma.message.findMany({
      where: {
        // This would need proper implementation based on your tag storage method
        message: { contains: `#${tag}` }
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

  static async getAllTags() {
    // This would extract all unique tags from messages
    const messages = await prisma.message.findMany({
      select: { message: true }
    })

    const tags = new Set<string>()
    messages.forEach(msg => {
      const tagMatches = msg.message.match(/#\w+/g)
      if (tagMatches) {
        tagMatches.forEach(tag => tags.add(tag.substring(1)))
      }
    })

    return Array.from(tags)
  }

  // Enhanced analytics
  static async getDetailedMessageAnalytics(days = 30) {
    const analytics = await this.getMessageAnalytics(days)
    
    // Add response time analytics
    const responseTimeData = await prisma.$queryRaw`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_response_hours,
        COUNT(*) as total_replied
      FROM "Message" 
      WHERE status = 'replied' 
      AND created_at >= NOW() - INTERVAL '${days} days'
    ` as any[]

    // Add type distribution
    const typeDistribution = await prisma.message.groupBy({
      by: ['type'],
      _count: { type: true },
      where: {
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      }
    })

    return {
      dailyStats: analytics,
      responseTime: responseTimeData[0] || { avg_response_hours: 0, total_replied: 0 },
      typeDistribution: typeDistribution.map(t => ({
        type: t.type,
        count: t._count.type
      }))
    }
  }

  static async getMessageTrends(days = 30) {
    const trends = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        type,
        COUNT(*) as count
      FROM "Message"
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at), type
      ORDER BY date DESC
    ` as any[]

    return trends
  }

  // Priority handling
  static async getMessagesByPriority(priority: 'low' | 'medium' | 'high' | 'urgent') {
    // This would require adding priority field to Message model
    return prisma.message.findMany({
      where: {
        // For now, we'll use type as a proxy for priority
        type: priority === 'urgent' ? 'bug' : priority === 'high' ? 'support' : 'feedback'
      },
      orderBy: { createdAt: 'desc' },
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

  static async setPriority(messageId: string, priority: 'low' | 'medium' | 'high' | 'urgent') {
    // This would update the priority field
    return this.updateMessage(messageId, { 
      // For now, we'll map priority to type
      type: priority === 'urgent' ? 'bug' : priority === 'high' ? 'support' : 'feedback'
    })
  }

  // Advanced search with filters
  static async advancedSearch(filters: {
    query?: string
    type?: MessageType
    status?: MessageStatus
    priority?: string
    dateFrom?: Date
    dateTo?: Date
    tags?: string[]
    limit?: number
  }) {
    const { query, type, status, priority, dateFrom, dateTo, tags, limit = 50 } = filters

    const where: any = {}

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { message: { contains: query, mode: 'insensitive' } },
        { sender: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (type) where.type = type
    if (status) where.status = status

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = dateFrom
      if (dateTo) where.createdAt.lte = dateTo
    }

    if (tags && tags.length > 0) {
      // This would need proper tag implementation
      where.message = {
        contains: tags.map(tag => `#${tag}`).join('|')
      }
    }

    return prisma.message.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
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

  // Export functionality
  static async exportMessages(format: 'csv' | 'json' = 'csv', filters?: MessageFilters) {
    const { messages } = await this.getMessages({ ...filters, limit: 10000 })
    
    if (format === 'json') {
      return JSON.stringify(messages, null, 2)
    }

    // CSV format
    const headers = ['ID', 'Sender', 'Title', 'Type', 'Status', 'Message', 'Created At', 'User Email']
    const rows = messages.map(msg => [
      msg.id,
      msg.sender,
      msg.title,
      msg.type,
      msg.status,
      msg.message.replace(/"/g, '""'), // Escape quotes
      msg.createdAt.toISOString(),
      msg.user?.email || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }

  // Message categorization and tagging enhancements
  static async getMessageCategories() {
    const categories = await prisma.message.findMany({
      select: { type: true },
      distinct: ['type']
    })

    // Get custom categories if they exist in the message content
    const customCategories = await prisma.$queryRaw`
      SELECT DISTINCT 
        REGEXP_REPLACE(message, '.*#category:([^\\s]+).*', '\\1') as category
      FROM "Message" 
      WHERE message ~ '#category:[^\\s]+'
    ` as any[]

    const allCategories = [
      ...categories.map(c => ({ name: c.type, count: 0, type: 'system' })),
      ...customCategories.map(c => ({ name: c.category, count: 0, type: 'custom' }))
    ]

    // Get counts for each category
    for (const category of allCategories) {
      const count = await prisma.message.count({
        where: category.type === 'system' 
          ? { type: category.name as MessageType }
          : { message: { contains: `#category:${category.name}` } }
      })
      category.count = count
    }

    return allCategories
  }

  static async getMessagesByCategory(category: string, limit = 10) {
    // Check if it's a system category (MessageType) or custom category
    const isSystemCategory = ['feedback', 'support', 'bug', 'system'].includes(category)
    
    return prisma.message.findMany({
      where: isSystemCategory 
        ? { type: category as MessageType }
        : { message: { contains: `#category:${category}` } },
      orderBy: { createdAt: 'desc' },
      take: limit,
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

  // Enhanced tagging system
  static async addTagsToMessage(messageId: string, tags: string[]) {
    const message = await this.getMessageById(messageId)
    if (!message) throw new Error('Message not found')

    // Add tags to message content with proper formatting
    const tagString = tags.map(tag => `#${tag}`).join(' ')
    const updatedMessage = message.message + '\n\nTags: ' + tagString

    return this.updateMessage(messageId, { 
      message: updatedMessage
    })
  }

  static async removeTagsFromMessage(messageId: string, tags: string[]) {
    const message = await this.getMessageById(messageId)
    if (!message) throw new Error('Message not found')

    let updatedMessage = message.message
    tags.forEach(tag => {
      updatedMessage = updatedMessage.replace(new RegExp(`#${tag}\\s*`, 'g'), '')
    })

    return this.updateMessage(messageId, { 
      message: updatedMessage.trim()
    })
  }

  static async getMessageTags(messageId: string) {
    const message = await this.getMessageById(messageId)
    if (!message) return []

    const tagMatches = message.message.match(/#\w+/g)
    return tagMatches ? tagMatches.map(tag => tag.substring(1)) : []
  }

  // Message scheduling functionality
  static async scheduleMessage(data: CreateMessageData & { scheduledAt: Date }) {
    return prisma.message.create({
      data: {
        ...data,
        status: 'pending',
        isScheduled: true,
        scheduledAt: data.scheduledAt
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

  static async getScheduledMessages(limit = 50) {
    return prisma.message.findMany({
      where: { 
        isScheduled: true,
        status: 'pending',
        scheduledAt: { lte: new Date() }
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
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

  static async markMessageAsDelivered(messageId: string) {
    return this.updateMessage(messageId, { 
      deliveredAt: new Date(),
      status: 'read'
    })
  }

  static async getDeliveryStats(days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [scheduled, delivered, pending] = await Promise.all([
      prisma.message.count({
        where: {
          isScheduled: true,
          createdAt: { gte: startDate }
        }
      }),
      prisma.message.count({
        where: {
          deliveredAt: { not: null },
          createdAt: { gte: startDate }
        }
      }),
      prisma.message.count({
        where: {
          isScheduled: true,
          status: 'pending',
          scheduledAt: { lte: new Date() }
        }
      })
    ])

    return {
      scheduled,
      delivered,
      pending,
      deliveryRate: scheduled > 0 ? (delivered / scheduled) * 100 : 0
    }
  }

  // Enhanced filtering with new fields
  static async getMessages(filters: MessageFilters = {}) {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status, 
      userId, 
      search, 
      category,
      tags,
      priority,
      isScheduled,
      dateFrom,
      dateTo
    } = filters

    const where: any = {}

    if (type) where.type = type
    if (status) where.status = status
    if (userId) where.userId = userId
    if (isScheduled !== undefined) where.isScheduled = isScheduled

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = dateFrom
      if (dateTo) where.createdAt.lte = dateTo
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { sender: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      const isSystemCategory = ['feedback', 'support', 'bug', 'system'].includes(category)
      if (isSystemCategory) {
        where.type = category as MessageType
      } else {
        where.message = { contains: `#category:${category}` }
      }
    }

    if (tags && tags.length > 0) {
      where.message = {
        contains: tags.map(tag => `#${tag}`).join('|')
      }
    }

    if (priority) {
      // Map priority to type for now (this would need a proper priority field)
      const priorityTypeMap = {
        'urgent': 'bug',
        'high': 'support',
        'medium': 'feedback',
        'low': 'system'
      }
      where.type = priorityTypeMap[priority] as MessageType
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      prisma.message.count({ where })
    ])

    return {
      messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  // Performance tracking
  static async getMessagePerformanceMetrics(days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const metrics = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as total_messages,
        COUNT(CASE WHEN status = 'read' THEN 1 END) as read_messages,
        COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied_messages,
        COUNT(CASE WHEN "deliveredAt" IS NOT NULL THEN 1 END) as delivered_messages,
        AVG(CASE WHEN "deliveredAt" IS NOT NULL AND "createdAt" IS NOT NULL 
            THEN EXTRACT(EPOCH FROM ("deliveredAt" - "createdAt"))/3600 
            END) as avg_delivery_time_hours
      FROM "Message"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    ` as any[]

    return metrics
  }

  // Validation
  static validateMessageData(data: CreateMessageData | UpdateMessageData) {
    const errors: string[] = []

    if ('title' in data && data.title) {
      if (data.title.length < 3) {
        errors.push('Title must be at least 3 characters long')
      }
      if (data.title.length > 200) {
        errors.push('Title must be less than 200 characters')
      }
    }

    if ('message' in data && data.message) {
      if (data.message.length < 10) {
        errors.push('Message must be at least 10 characters long')
      }
      if (data.message.length > 5000) {
        errors.push('Message must be less than 5000 characters')
      }
    }

    if ('tags' in data && data.tags) {
      if (data.tags.length > 10) {
        errors.push('Maximum 10 tags allowed')
      }
      data.tags.forEach(tag => {
        if (tag.length > 50) {
          errors.push('Tag length must be less than 50 characters')
        }
      })
    }

    if ('scheduledAt' in data && data.scheduledAt) {
      if (data.scheduledAt < new Date()) {
        errors.push('Scheduled time must be in the future')
      }
    }

    if ('category' in data && data.category) {
      if (data.category.length > 50) {
        errors.push('Category name must be less than 50 characters')
      }
    }

    return errors
  }
}
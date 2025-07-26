import { prisma } from '../prisma'
import { TaskStatus } from '../generated/prisma'

export interface CreateTaskData {
  title: string
  description: string
  userId: string
  userName: string
  dueDate: Date
  category: string
  difficulty: string
  aiConfidence?: number
  slipId?: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: TaskStatus
  dueDate?: Date
  category?: string
  difficulty?: string
  aiConfidence?: number
  slipId?: string
}

export interface TaskFilters {
  page?: number
  limit?: number
  status?: TaskStatus
  userId?: string
  category?: string
  difficulty?: string
  search?: string
}

export class TaskService {
  static async getTasks(filters: TaskFilters = {}) {
    const { page = 1, limit = 10, status, userId, category, difficulty, search } = filters

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (userId) {
      where.userId = userId
    }

    if (category) {
      where.category = category
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdDate: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isPremium: true
            }
          }
        }
      }),
      prisma.task.count({ where })
    ])

    return {
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getTaskById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPremium: true,
            streak: true
          }
        }
      }
    })
  }

  static async createTask(data: CreateTaskData) {
    return prisma.task.create({
      data: {
        ...data,
        status: 'active',
        aiConfidence: data.aiConfidence ?? 85
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPremium: true
          }
        }
      }
    })
  }

  static async updateTask(id: string, data: UpdateTaskData) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPremium: true
          }
        }
      }
    })
  }

  static async deleteTask(id: string) {
    return prisma.task.delete({
      where: { id }
    })
  }

  static async getTaskStats() {
    const [total, active, completed, expired] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: 'active' } }),
      prisma.task.count({ where: { status: 'completed' } }),
      prisma.task.count({ where: { status: 'expired' } })
    ])

    return { total, active, completed, expired }
  }

  static async completeTask(id: string) {
    const task = await this.updateTask(id, { status: 'completed' })
    
    // Update user streak when task is completed
    if (task?.userId) {
      await prisma.user.update({
        where: { id: task.userId },
        data: {
          streak: { increment: 1 },
          lastActivity: new Date()
        }
      })
    }

    return task
  }

  static async expireOverdueTasks() {
    const now = new Date()
    
    return prisma.task.updateMany({
      where: {
        status: 'active',
        dueDate: { lt: now }
      },
      data: {
        status: 'expired'
      }
    })
  }

  static async getTasksByUser(userId: string, limit = 10) {
    return prisma.task.findMany({
      where: { userId },
      orderBy: { createdDate: 'desc' },
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

  static async getTaskCategories() {
    const categories = await prisma.task.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    })

    return categories.map(cat => ({
      name: cat.category,
      count: cat._count.category
    }))
  }

  // Advanced analytics and tracking
  static async getTaskCompletionAnalytics(days = 30) {
    const data = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const [total, completed, expired] = await Promise.all([
        prisma.task.count({
          where: {
            createdDate: { gte: date, lt: nextDate }
          }
        }),
        prisma.task.count({
          where: {
            createdDate: { gte: date, lt: nextDate },
            status: 'completed'
          }
        }),
        prisma.task.count({
          where: {
            createdDate: { gte: date, lt: nextDate },
            status: 'expired'
          }
        })
      ])

      const completionRate = total > 0 ? (completed / total) * 100 : 0

      data.push({
        date: date.toISOString().split('T')[0],
        total,
        completed,
        expired,
        completionRate: Math.round(completionRate * 10) / 10
      })
    }

    return data
  }

  static async getTaskDifficultyStats() {
    const difficulties = await prisma.task.groupBy({
      by: ['difficulty'],
      _count: {
        difficulty: true
      },
      orderBy: {
        _count: {
          difficulty: 'desc'
        }
      }
    })

    return difficulties.map(diff => ({
      name: diff.difficulty,
      count: diff._count.difficulty
    }))
  }

  static async getTaskPerformanceByCategory() {
    const categories = await prisma.task.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      where: {
        status: 'completed'
      }
    })

    const totalByCategory = await prisma.task.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    })

    return categories.map(cat => {
      const total = totalByCategory.find(t => t.category === cat.category)?._count.category || 0
      const completed = cat._count.category
      const completionRate = total > 0 ? (completed / total) * 100 : 0

      return {
        category: cat.category,
        completed,
        total,
        completionRate: Math.round(completionRate * 10) / 10
      }
    })
  }

  // Task assignment and scheduling
  static async assignTaskToUser(taskId: string, userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return prisma.task.update({
      where: { id: taskId },
      data: {
        userId,
        userName: user.name
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPremium: true
          }
        }
      }
    })
  }

  static async getUpcomingTasks(days = 7) {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    return prisma.task.findMany({
      where: {
        status: 'active',
        dueDate: {
          gte: now,
          lte: futureDate
        }
      },
      orderBy: { dueDate: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPremium: true
          }
        }
      }
    })
  }

  static async getOverdueTasks() {
    const now = new Date()

    return prisma.task.findMany({
      where: {
        status: 'active',
        dueDate: { lt: now }
      },
      orderBy: { dueDate: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPremium: true
          }
        }
      }
    })
  }

  // Bulk operations
  static async bulkUpdateTaskStatus(taskIds: string[], status: TaskStatus) {
    return prisma.task.updateMany({
      where: { id: { in: taskIds } },
      data: { status }
    })
  }

  static async bulkDeleteTasks(taskIds: string[]) {
    return prisma.task.deleteMany({
      where: { id: { in: taskIds } }
    })
  }

  static async bulkAssignTasks(taskIds: string[], userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return prisma.task.updateMany({
      where: { id: { in: taskIds } },
      data: {
        userId,
        userName: user.name
      }
    })
  }

  // Advanced search and filtering
  static async searchTasks(query: string, limit = 10) {
    return prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { userName: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      orderBy: { createdDate: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPremium: true
          }
        }
      }
    })
  }

  static async getTasksByDifficulty(difficulty: string, page = 1, limit = 10) {
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: { difficulty },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdDate: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isPremium: true
            }
          }
        }
      }),
      prisma.task.count({ where: { difficulty } })
    ])

    return {
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  // Task templates and generation
  static async createTaskTemplate(data: {
    title: string
    description: string
    category: string
    difficulty: string
    estimatedDuration?: number
    tags?: string[]
  }) {
    // This would create reusable task templates
    // For now, we'll store them as regular tasks with a special flag
    return prisma.task.create({
      data: {
        ...data,
        userId: 'template',
        userName: 'Template',
        status: 'active',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        aiConfidence: 100
      }
    })
  }

  static async getTaskTemplates() {
    return prisma.task.findMany({
      where: { userId: 'template' },
      orderBy: { createdDate: 'desc' }
    })
  }

  static async generateTaskFromTemplate(templateId: string, userId: string) {
    const template = await this.getTaskById(templateId)
    if (!template) throw new Error('Template not found')

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    })

    if (!user) throw new Error('User not found')

    return this.createTask({
      title: template.title,
      description: template.description,
      category: template.category,
      difficulty: template.difficulty,
      userId,
      userName: user.name,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      aiConfidence: template.aiConfidence
    })
  }

  // Task scheduling and automation
  static async scheduleRecurringTask(data: CreateTaskData & {
    recurrenceType: 'daily' | 'weekly' | 'monthly'
    recurrenceEnd?: Date
  }) {
    const { recurrenceType, recurrenceEnd, ...taskData } = data
    
    // Create the initial task
    const task = await this.createTask(taskData)
    
    // Store recurrence information (you might want to create a TaskRecurrence model)
    // For now, we'll add it to the task description
    await this.updateTask(task.id, {
      description: `${task.description}\n\n[RECURRING: ${recurrenceType}]`
    })

    return task
  }

  static async getRecurringTasks() {
    return prisma.task.findMany({
      where: {
        description: { contains: '[RECURRING:' }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPremium: true
          }
        }
      }
    })
  }

  // Task collaboration and comments
  static async addTaskComment(taskId: string, comment: string, authorId: string, authorName: string) {
    // This would require a TaskComment model
    // For now, we'll append to the task description
    const task = await this.getTaskById(taskId)
    if (!task) throw new Error('Task not found')

    const timestamp = new Date().toISOString()
    const commentText = `\n\n[COMMENT ${timestamp} by ${authorName}]: ${comment}`
    
    return this.updateTask(taskId, {
      description: task.description + commentText
    })
  }

  static async getTaskComments(taskId: string) {
    const task = await this.getTaskById(taskId)
    if (!task) return []

    // Extract comments from description
    const commentRegex = /\[COMMENT (.*?) by (.*?)\]: (.*?)(?=\n\n\[COMMENT|$)/gs
    const comments = []
    let match

    while ((match = commentRegex.exec(task.description)) !== null) {
      comments.push({
        timestamp: match[1],
        author: match[2],
        comment: match[3]
      })
    }

    return comments
  }

  // Task dependencies
  static async addTaskDependency(taskId: string, dependsOnTaskId: string) {
    // This would require a TaskDependency model
    // For now, we'll add it to the task description
    const task = await this.getTaskById(taskId)
    const dependsOnTask = await this.getTaskById(dependsOnTaskId)
    
    if (!task || !dependsOnTask) throw new Error('Task not found')

    return this.updateTask(taskId, {
      description: `${task.description}\n\n[DEPENDS ON: ${dependsOnTask.title} (${dependsOnTaskId})]`
    })
  }

  static async getTaskDependencies(taskId: string) {
    const task = await this.getTaskById(taskId)
    if (!task) return []

    const dependencyRegex = /\[DEPENDS ON: (.*?) \((.*?)\)\]/g
    const dependencies = []
    let match

    while ((match = dependencyRegex.exec(task.description)) !== null) {
      dependencies.push({
        title: match[1],
        taskId: match[2]
      })
    }

    return dependencies
  }

  // Advanced analytics
  static async getTaskProductivityAnalytics(userId?: string, days = 30) {
    const where: any = {
      createdDate: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    }

    if (userId) where.userId = userId

    const [totalTasks, completedTasks, averageCompletionTime] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, status: 'completed' } }),
      prisma.task.aggregate({
        where: { ...where, status: 'completed' },
        _avg: {
          aiConfidence: true
        }
      })
    ])

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    return {
      totalTasks,
      completedTasks,
      completionRate: Math.round(completionRate * 10) / 10,
      averageConfidence: Math.round((averageCompletionTime._avg.aiConfidence || 0) * 10) / 10
    }
  }

  static async getTaskStreakAnalytics(userId: string) {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        status: 'completed'
      },
      orderBy: { createdDate: 'asc' },
      select: {
        createdDate: true,
        status: true
      }
    })

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let lastDate: Date | null = null

    tasks.forEach(task => {
      const taskDate = new Date(task.createdDate)
      
      if (lastDate) {
        const daysDiff = Math.floor((taskDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      } else {
        tempStreak = 1
      }
      
      lastDate = taskDate
    })

    longestStreak = Math.max(longestStreak, tempStreak)
    
    // Calculate current streak (tasks completed in recent days)
    const recentTasks = tasks.filter(task => {
      const daysDiff = Math.floor((Date.now() - new Date(task.createdDate).getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff <= 7 // Last 7 days
    })

    currentStreak = recentTasks.length

    return {
      currentStreak,
      longestStreak,
      totalCompleted: tasks.length
    }
  }

  // Export functionality
  static async exportTasks(format: 'csv' | 'json' = 'csv', filters?: TaskFilters) {
    const { tasks } = await this.getTasks({ ...filters, limit: 10000 })
    
    if (format === 'json') {
      return JSON.stringify(tasks, null, 2)
    }

    // CSV format
    const headers = ['ID', 'Title', 'Description', 'Status', 'Category', 'Difficulty', 'User', 'Due Date', 'AI Confidence', 'Created Date']
    const rows = tasks.map(task => [
      task.id,
      task.title,
      task.description.replace(/"/g, '""'), // Escape quotes
      task.status,
      task.category,
      task.difficulty,
      task.userName,
      task.dueDate.toISOString(),
      task.aiConfidence,
      task.createdDate.toISOString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }

  // Task recommendations
  static async getTaskRecommendations(userId: string, limit = 5) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        isPremium: true
      }
    })

    if (!user) throw new Error('User not found')

    // Get user's completed tasks to understand preferences
    const completedTasks = await prisma.task.findMany({
      where: {
        userId,
        status: 'completed'
      },
      select: {
        category: true,
        difficulty: true
      }
    })

    // Analyze user preferences
    const categoryPreferences = completedTasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const preferredCategory = Object.keys(categoryPreferences).reduce((a, b) => 
      categoryPreferences[a] > categoryPreferences[b] ? a : b, 'Mindfulness'
    )

    // Get task templates that match user preferences
    const templates = await this.getTaskTemplates()
    const recommendations = templates
      .filter(template => template.category === preferredCategory)
      .slice(0, limit)

    return recommendations
  }

  // Validation
  static validateTaskData(data: CreateTaskData | UpdateTaskData) {
    const errors: string[] = []

    if ('title' in data && data.title) {
      if (data.title.length < 3) {
        errors.push('Title must be at least 3 characters long')
      }
      if (data.title.length > 200) {
        errors.push('Title must be less than 200 characters')
      }
    }

    if ('description' in data && data.description) {
      if (data.description.length < 10) {
        errors.push('Description must be at least 10 characters long')
      }
      if (data.description.length > 2000) {
        errors.push('Description must be less than 2000 characters')
      }
    }

    if ('dueDate' in data && data.dueDate) {
      const now = new Date()
      if (data.dueDate < now) {
        errors.push('Due date cannot be in the past')
      }
    }

    if ('aiConfidence' in data && data.aiConfidence !== undefined) {
      if (data.aiConfidence < 0 || data.aiConfidence > 100) {
        errors.push('AI confidence must be between 0 and 100')
      }
    }

    return errors
  }
}
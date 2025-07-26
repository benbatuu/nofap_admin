import { prisma } from '../prisma'
import { User, UserStatus } from '../generated/prisma'

export interface CreateUserData {
    name: string
    email: string
    avatar?: string
    globalEnabled?: boolean
    notifications?: any
    isPremium?: boolean
    status?: UserStatus
}

export interface UpdateUserData {
    name?: string
    email?: string
    avatar?: string
    globalEnabled?: boolean
    notifications?: any
    isPremium?: boolean
    status?: UserStatus
    streak?: number
}

export interface UserFilters {
    page?: number
    limit?: number
    search?: string
    status?: UserStatus
    isPremium?: boolean
}

export class UserService {
    static async getUsers(filters: UserFilters = {}) {
        const { page = 1, limit = 10, search, status, isPremium } = filters

        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (status) {
            where.status = status
        }

        if (isPremium !== undefined) {
            where.isPremium = isPremium
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            tasks: true,
                            messages: true,
                            activities: true,
                            billingLogs: true
                        }
                    }
                }
            }),
            prisma.user.count({ where })
        ])

        return {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    }

    static async getUserById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            include: {
                tasks: {
                    orderBy: { createdDate: 'desc' },
                    take: 5
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                activities: {
                    orderBy: { timestamp: 'desc' },
                    take: 10
                },
                billingLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                _count: {
                    select: {
                        tasks: true,
                        messages: true,
                        activities: true,
                        billingLogs: true
                    }
                }
            }
        })
    }

    static async createUser(data: CreateUserData) {
        return prisma.user.create({
            data: {
                ...data,
                lastActivity: new Date(),
                streak: 0,
                globalEnabled: data.globalEnabled ?? true,
                isPremium: data.isPremium ?? false,
                status: data.status ?? 'active',
                notifications: data.notifications ?? {
                    daily: true,
                    marketing: false,
                    system: true,
                    motivation: true
                }
            }
        })
    }

    static async updateUser(id: string, data: UpdateUserData) {
        return prisma.user.update({
            where: { id },
            data: {
                ...data,
                ...(data.status && { lastActivity: new Date() })
            }
        })
    }

    static async deleteUser(id: string) {
        // Soft delete by setting status to inactive
        return prisma.user.update({
            where: { id },
            data: { status: 'inactive' }
        })
    }

    static async getUserStats() {
        const [total, active, premium, banned] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { status: 'active' } }),
            prisma.user.count({ where: { isPremium: true } }),
            prisma.user.count({ where: { status: 'banned' } })
        ])

        return { total, active, premium, banned }
    }

    static async updateUserActivity(id: string) {
        return prisma.user.update({
            where: { id },
            data: { lastActivity: new Date() }
        })
    }

    // Advanced filtering and search capabilities
    static async searchUsers(query: string, limit = 10) {
        return prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                status: true,
                isPremium: true
            }
        })
    }

    static async getUsersByStatus(status: UserStatus, page = 1, limit = 10) {
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: { status },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where: { status } })
        ])

        return {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    }

    static async getPremiumUsers(page = 1, limit = 10) {
        return this.getUsersByStatus('active', page, limit).then(result => ({
            ...result,
            users: result.users.filter(user => user.isPremium)
        }))
    }

    // Analytics and statistics methods
    static async getUserGrowthStats(days = 30) {
        const data = []
        const now = new Date()

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(date.getDate() - i)
            date.setHours(0, 0, 0, 0)
            
            const nextDate = new Date(date)
            nextDate.setDate(nextDate.getDate() + 1)

            const count = await prisma.user.count({
                where: {
                    createdAt: {
                        gte: date,
                        lt: nextDate
                    }
                }
            })

            data.push({
                date: date.toISOString().split('T')[0],
                count
            })
        }

        return data
    }

    static async getUserActivityStats() {
        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const [activeToday, activeThisWeek, activeThisMonth] = await Promise.all([
            prisma.user.count({
                where: { lastActivity: { gte: oneDayAgo } }
            }),
            prisma.user.count({
                where: { lastActivity: { gte: oneWeekAgo } }
            }),
            prisma.user.count({
                where: { lastActivity: { gte: oneMonthAgo } }
            })
        ])

        return {
            activeToday,
            activeThisWeek,
            activeThisMonth
        }
    }

    static async getStreakLeaderboard(limit = 10) {
        return prisma.user.findMany({
            where: { status: 'active' },
            orderBy: { streak: 'desc' },
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                streak: true,
                isPremium: true
            }
        })
    }

    static async getUserEngagementMetrics() {
        const [avgStreak, maxStreak, totalTasks, completedTasks] = await Promise.all([
            prisma.user.aggregate({
                _avg: { streak: true }
            }),
            prisma.user.aggregate({
                _max: { streak: true }
            }),
            prisma.task.count(),
            prisma.task.count({ where: { status: 'completed' } })
        ])

        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

        return {
            averageStreak: Math.round((avgStreak._avg.streak || 0) * 10) / 10,
            maxStreak: maxStreak._max.streak || 0,
            taskCompletionRate: Math.round(completionRate * 10) / 10
        }
    }

    // Bulk operations
    static async bulkUpdateUserStatus(userIds: string[], status: UserStatus) {
        return prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { status }
        })
    }

    static async bulkUpdateNotificationSettings(userIds: string[], notifications: any) {
        return prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { notifications }
        })
    }

    // User relationships and detailed info
    static async getUserWithFullDetails(id: string) {
        return prisma.user.findUnique({
            where: { id },
            include: {
                tasks: {
                    orderBy: { createdDate: 'desc' },
                    take: 10
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                activities: {
                    orderBy: { timestamp: 'desc' },
                    take: 20
                },
                billingLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                devices: {
                    orderBy: { lastSeen: 'desc' }
                },
                streaks: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                relapses: {
                    orderBy: { date: 'desc' },
                    take: 5
                },
                notificationLogs: {
                    orderBy: { sentAt: 'desc' },
                    take: 10
                },
                _count: {
                    select: {
                        tasks: true,
                        messages: true,
                        activities: true,
                        billingLogs: true,
                        devices: true,
                        streaks: true,
                        relapses: true,
                        notificationLogs: true
                    }
                }
            }
        })
    }

    // Validation helpers
    static async validateUserData(data: CreateUserData | UpdateUserData) {
        const errors: string[] = []

        if ('email' in data && data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(data.email)) {
                errors.push('Invalid email format')
            }

            // Check for duplicate email (excluding current user for updates)
            const existingUser = await prisma.user.findFirst({
                where: { email: data.email }
            })
            if (existingUser) {
                errors.push('Email already exists')
            }
        }

        if ('name' in data && data.name) {
            if (data.name.length < 2) {
                errors.push('Name must be at least 2 characters long')
            }
        }

        return errors
    }
}
// API response types

export interface DashboardStats {
    totalUsers: number
    activeUsers: number
    premiumUsers: number
    bannedUsers: number
    totalMessages: number
    pendingMessages: number
    totalTasks: number
    activeTasks: number
    completedTasks: number
}

export interface Activity {
    id: string
    type: string
    message: string
    details: string
    timestamp: string
    color: 'green' | 'blue' | 'yellow' | 'purple'
}

export interface SystemStatus {
    api: {
        status: 'online' | 'offline'
        uptime: string
    }
    database: {
        status: 'online' | 'offline'
        uptime: string
    }
    notifications: {
        status: 'online' | 'offline'
        uptime: string
    }
}

export interface MonthlyStats {
    newRegistrations: number
    premiumConversion: number
    averageStreak: number
    totalRevenue: number
    adRevenue: number
    premiumRevenue: number
}

export interface User {
    id: string
    username: string
    email: string
    streak: number
    joinDate: string
    status: 'active' | 'banned' | 'inactive'
    isPremium: boolean
    lastActive: string
}

export interface UsersResponse {
    users: User[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export interface Role {
    id: string
    name: string
    description: string
    permissions: string[]
    userCount: number
    createdAt: string
}

export interface Permission {
    id: string
    name: string
    description: string
    category: string
    rolesCount: number
}

export interface CreateRoleData {
    name: string
    description: string
    permissions: string[]
}

export interface CreatePermissionData {
    name: string
    description: string
    category: string
}

export interface UserNotification {
    id: string
    name: string
    email: string
    avatar: string
    globalEnabled: boolean
    notifications: {
        motivation: { push: boolean; email: boolean; sms: boolean }
        dailyReminder: { push: boolean; email: boolean; sms: boolean }
        marketing: { push: boolean; email: boolean; sms: boolean }
        system: { push: boolean; email: boolean; sms: boolean }
    }
    lastActivity: string
}

export interface UpdateUserNotificationData {
    globalEnabled?: boolean
    notifications?: {
        motivation?: { push?: boolean; email?: boolean; sms?: boolean }
        dailyReminder?: { push?: boolean; email?: boolean; sms?: boolean }
        marketing?: { push?: boolean; email?: boolean; sms?: boolean }
        system?: { push?: boolean; email?: boolean; sms?: boolean }
    }
}

export interface BulkUpdateNotificationData {
    userIds: string[]
    updates: UpdateUserNotificationData
}

export interface BlockedUser {
    id: string
    username: string
    email: string
    blockedDate: string
    reason: string
    blockedBy: string
    status: 'active' | 'temporary' | 'permanent'
    blockedUntil?: string | null
}

export interface BlockedUsersResponse {
    users: BlockedUser[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
    stats: {
        total: number
        active: number
        temporary: number
        permanent: number
    }
}

export interface CreateBlockedUserData {
    username: string
    email: string
    reason: string
    status: 'active' | 'temporary' | 'permanent'
    blockedUntil?: string
}

export interface UpdateBlockedUserData {
    username?: string
    email?: string
    reason?: string
    status?: 'active' | 'temporary' | 'permanent'
    blockedUntil?: string
}
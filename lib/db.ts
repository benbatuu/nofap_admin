// Database connection and models
// Bu örnekte mock data kullanacağız, gerçek projede MongoDB, PostgreSQL vs. bağlantısı olacak

export interface User {
    id: string
    name: string
    email: string
    avatar?: string
    globalEnabled: boolean
    notifications: {
        motivation: { push: boolean; email: boolean; sms: boolean }
        dailyReminder: { push: boolean; email: boolean; sms: boolean }
        marketing: { push: boolean; email: boolean; sms: boolean }
        system: { push: boolean; email: boolean; sms: boolean }
    }
    lastActivity: string
    createdAt: string
    streak: number
    isPremium: boolean
    status: 'active' | 'banned' | 'inactive'
}

export interface Message {
    id: string
    sender: string
    title: string
    type: 'bug' | 'feedback' | 'support' | 'system'
    message: string
    status: 'pending' | 'read' | 'replied'
    createdAt: string
    updatedAt: string
}

export interface Task {
    id: string
    title: string
    description: string
    status: 'active' | 'completed' | 'expired'
    aiConfidence: number
    userId: string
    userName: string
    slipId?: string
    createdDate: string
    dueDate: string
    category: string
    difficulty: 'easy' | 'medium' | 'hard'
}

export interface Notification {
    id: string
    title: string
    message: string
    type: 'motivation' | 'dailyReminder' | 'marketing' | 'system'
    targetGroup: string
    scheduledAt: string
    status: 'active' | 'paused' | 'completed' | 'cancelled'
    frequency: 'once' | 'daily' | 'weekly' | 'monthly'
    createdAt: string
}

export interface BillingLog {
    id: string
    userId: string
    userName: string
    amount: number
    currency: string
    status: 'success' | 'pending' | 'failed'
    paymentMethod: string
    description: string
    createdAt: string
}

export interface Product {
    id: string
    name: string
    description: string
    price: number
    currency: string
    type: 'subscription' | 'one-time'
    duration?: string
    subscribers: number
    isActive: boolean
    createdAt: string
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

// Mock data - gerçek projede veritabanından gelecek
export const mockUsers: User[] = [
    {
        id: '1',
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        avatar: 'AY',
        globalEnabled: true,
        notifications: {
            motivation: { push: true, email: true, sms: false },
            dailyReminder: { push: false, email: true, sms: false },
            marketing: { push: true, email: false, sms: false },
            system: { push: true, email: true, sms: true }
        },
        lastActivity: '2025-01-25T10:30:00Z',
        createdAt: '2024-01-15T08:00:00Z',
        streak: 45,
        isPremium: true,
        status: 'active'
    },
    {
        id: '2',
        name: 'Elif Kaya',
        email: 'elif@example.com',
        avatar: 'EK',
        globalEnabled: false,
        notifications: {
            motivation: { push: false, email: false, sms: false },
            dailyReminder: { push: false, email: false, sms: false },
            marketing: { push: false, email: false, sms: false },
            system: { push: true, email: true, sms: false }
        },
        lastActivity: '2025-01-24T15:20:00Z',
        createdAt: '2024-02-20T12:00:00Z',
        streak: 12,
        isPremium: false,
        status: 'active'
    }
]

export const mockMessages: Message[] = [
    {
        id: 'MSG001',
        sender: 'ahmet.yilmaz',
        title: 'Uygulama çok yavaş çalışıyor',
        type: 'bug',
        message: 'Mobil uygulamada sayfa geçişleri çok yavaş oluyor.',
        status: 'pending',
        createdAt: '2025-01-25T10:30:00Z',
        updatedAt: '2025-01-25T10:30:00Z'
    }
]

export const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Günlük Meditasyon Rutini',
        description: '10 dakikalık nefes egzersizi yaparak zihnini sakinleştir.',
        status: 'active',
        aiConfidence: 92,
        userId: 'user_123',
        userName: 'Ahmet K.',
        slipId: 'slip_001',
        createdDate: '2025-01-20',
        dueDate: '2025-01-22',
        category: 'Mindfulness',
        difficulty: 'easy'
    }
]

// Database helper functions
export async function getUsers(params: { page?: number; limit?: number; search?: string } = {}) {
    const { page = 1, limit = 10, search = '' } = params

    // Mock implementation - expand mock data for better testing
    const expandedUsers = [
        ...mockUsers,
        {
            id: '3',
            name: 'Mehmet Demir',
            email: 'mehmet@example.com',
            avatar: 'MD',
            globalEnabled: true,
            notifications: {
                motivation: { push: true, email: false, sms: false },
                dailyReminder: { push: true, email: true, sms: false },
                marketing: { push: false, email: false, sms: false },
                system: { push: true, email: true, sms: false }
            },
            lastActivity: '2025-01-23T09:15:00Z',
            createdAt: '2024-03-10T14:30:00Z',
            streak: 0,
            isPremium: false,
            status: 'banned' as const
        },
        {
            id: '4',
            name: 'Ayşe Özkan',
            email: 'ayse@example.com',
            avatar: 'AÖ',
            globalEnabled: true,
            notifications: {
                motivation: { push: true, email: true, sms: false },
                dailyReminder: { push: true, email: true, sms: false },
                marketing: { push: true, email: false, sms: false },
                system: { push: true, email: true, sms: true }
            },
            lastActivity: '2025-01-25T14:20:00Z',
            createdAt: '2024-04-05T10:00:00Z',
            streak: 78,
            isPremium: true,
            status: 'active' as const
        }
    ]

    let filteredUsers = expandedUsers

    if (search) {
        filteredUsers = expandedUsers.filter(user =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        )
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    // Transform users for the frontend
    const transformedUsers = filteredUsers.slice(startIndex, endIndex).map(user => ({
        id: user.id,
        username: user.name,
        email: user.email,
        streak: user.streak,
        joinDate: user.createdAt,
        status: user.status,
        isPremium: user.isPremium,
        lastActive: getRelativeTime(user.lastActivity)
    }))

    return {
        users: transformedUsers,
        pagination: {
            total: filteredUsers.length,
            page,
            limit,
            totalPages: Math.ceil(filteredUsers.length / limit)
        }
    }
}

function getRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Şimdi'
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} saat önce`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} gün önce`
}

export async function getUserById(id: string) {
    return mockUsers.find(user => user.id === id)
}

export async function updateUser(id: string, updates: Partial<User>) {
    const userIndex = mockUsers.findIndex(user => user.id === id)
    if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates }
        return mockUsers[userIndex]
    }
    return null
}

export async function getMessages(page = 1, limit = 10, type?: string, status?: string) {
    let filteredMessages = mockMessages

    if (type && type !== 'all') {
        filteredMessages = filteredMessages.filter(msg => msg.type === type)
    }

    if (status && status !== 'all') {
        filteredMessages = filteredMessages.filter(msg => msg.status === status)
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    return {
        messages: filteredMessages.slice(startIndex, endIndex),
        total: filteredMessages.length,
        page,
        limit,
        totalPages: Math.ceil(filteredMessages.length / limit)
    }
}

export async function getTasks(page = 1, limit = 10, status?: string, userId?: string) {
    let filteredTasks = mockTasks

    if (status && status !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === status)
    }

    if (userId && userId !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.userId === userId)
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    return {
        tasks: filteredTasks.slice(startIndex, endIndex),
        total: filteredTasks.length,
        page,
        limit,
        totalPages: Math.ceil(filteredTasks.length / limit)
    }
}

// Recent activities mock data
export const mockActivities = [
    {
        id: '1',
        type: 'user_registration',
        message: 'Yeni kullanıcı kaydı',
        details: 'user_12345 - 2 dakika önce',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        color: 'green'
    },
    {
        id: '2',
        type: 'premium_subscription',
        message: 'Premium abonelik başlatıldı',
        details: 'user_67890 - 5 dakika önce',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        color: 'blue'
    },
    {
        id: '3',
        type: 'relapse_report',
        message: 'Relapse rapor edildi',
        details: 'user_11111 - 8 dakika önce',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        color: 'yellow'
    },
    {
        id: '4',
        type: 'streak_milestone',
        message: '100 günlük streak tamamlandı',
        details: 'user_22222 - 12 dakika önce',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        color: 'purple'
    }
]

// System status mock data
export const mockSystemStatus = {
    api: { status: 'online', uptime: '99.9%' },
    database: { status: 'online', uptime: '99.8%' },
    notifications: { status: 'online', uptime: '99.7%' }
}

// Monthly stats mock data
export const mockMonthlyStats = {
    newRegistrations: 1234,
    premiumConversion: 5.2,
    averageStreak: 23,
    totalRevenue: 12450,
    adRevenue: 3200,
    premiumRevenue: 9250
}

// Dashboard stats
export async function getDashboardStats() {
    // Use the same expanded users data for consistency
    const allUsers = [
        ...mockUsers,
        {
            id: '3',
            name: 'Mehmet Demir',
            email: 'mehmet@example.com',
            avatar: 'MD',
            globalEnabled: true,
            notifications: {
                motivation: { push: true, email: false, sms: false },
                dailyReminder: { push: true, email: true, sms: false },
                marketing: { push: false, email: false, sms: false },
                system: { push: true, email: true, sms: false }
            },
            lastActivity: '2025-01-23T09:15:00Z',
            createdAt: '2024-03-10T14:30:00Z',
            streak: 0,
            isPremium: false,
            status: 'banned' as const
        },
        {
            id: '4',
            name: 'Ayşe Özkan',
            email: 'ayse@example.com',
            avatar: 'AÖ',
            globalEnabled: true,
            notifications: {
                motivation: { push: true, email: true, sms: false },
                dailyReminder: { push: true, email: true, sms: false },
                marketing: { push: true, email: false, sms: false },
                system: { push: true, email: true, sms: true }
            },
            lastActivity: '2025-01-25T14:20:00Z',
            createdAt: '2024-04-05T10:00:00Z',
            streak: 78,
            isPremium: true,
            status: 'active' as const
        }
    ]

    return {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.status === 'active').length,
        premiumUsers: allUsers.filter(u => u.isPremium).length,
        bannedUsers: allUsers.filter(u => u.status === 'banned').length,
        totalMessages: mockMessages.length,
        pendingMessages: mockMessages.filter(m => m.status === 'pending').length,
        totalTasks: mockTasks.length,
        activeTasks: mockTasks.filter(t => t.status === 'active').length,
        completedTasks: mockTasks.filter(t => t.status === 'completed').length
    }
}

export async function getRecentActivities() {
    return mockActivities
}

export async function getSystemStatus() {
    return mockSystemStatus
}

export async function getMonthlyStats() {
    return mockMonthlyStats
}

// Statistics page mock data
export const mockStatisticsData = {
    keyMetrics: [
        { title: "Total Revenue", value: "$54,239", change: "+12.5%", icon: "DollarSign", trend: "up", color: "text-green-500" },
        { title: "Active Users", value: "8,432", change: "+18.2%", icon: "Users", trend: "up", color: "text-blue-500" },
        { title: "Orders", value: "1,247", change: "-2.3%", icon: "ShoppingCart", trend: "down", color: "text-red-500" },
        { title: "Page Views", value: "32,156", change: "+24.1%", icon: "Eye", trend: "up", color: "text-purple-500" }
    ],

    revenueData: [
        { month: "Jan", revenue: 4000, profit: 2800, users: 240 },
        { month: "Feb", revenue: 3000, profit: 1800, users: 220 },
        { month: "Mar", revenue: 5000, profit: 3500, users: 290 },
        { month: "Apr", revenue: 4500, profit: 3200, users: 270 },
        { month: "May", revenue: 6000, profit: 4200, users: 320 },
        { month: "Jun", revenue: 5500, profit: 3900, users: 310 },
        { month: "Jul", revenue: 7000, profit: 5000, users: 380 },
        { month: "Aug", revenue: 6500, profit: 4600, users: 360 },
        { month: "Sep", revenue: 8000, profit: 5800, users: 420 },
        { month: "Oct", revenue: 7500, profit: 5400, users: 400 },
        { month: "Nov", revenue: 9000, profit: 6500, users: 480 },
        { month: "Dec", revenue: 8500, profit: 6200, users: 460 }
    ],

    categoryData: [
        { name: "Electronics", value: 4500, color: "#8b5cf6", percentage: 35 },
        { name: "Clothing", value: 3200, color: "#06b6d4", percentage: 25 },
        { name: "Books", value: 2100, color: "#10b981", percentage: 16 },
        { name: "Home & Garden", value: 1800, color: "#f59e0b", percentage: 14 },
        { name: "Sports", value: 1300, color: "#ef4444", percentage: 10 }
    ],

    trafficData: [
        { name: "Desktop", value: 45, color: "#8b5cf6" },
        { name: "Mobile", value: 35, color: "#06b6d4" },
        { name: "Tablet", value: 15, color: "#10b981" },
        { name: "Other", value: 5, color: "#f59e0b" }
    ],

    performanceData: [
        { name: "Conversion Rate", value: 68, target: 75, color: "#8b5cf6" },
        { name: "Bounce Rate", value: 32, target: 25, color: "#06b6d4" },
        { name: "User Retention", value: 84, target: 80, color: "#10b981" },
        { name: "Goal Completion", value: 76, target: 85, color: "#f59e0b" }
    ],

    hourlyData: [
        { hour: "00", users: 120 }, { hour: "01", users: 95 }, { hour: "02", users: 80 },
        { hour: "03", users: 75 }, { hour: "04", users: 85 }, { hour: "05", users: 110 },
        { hour: "06", users: 180 }, { hour: "07", users: 280 }, { hour: "08", users: 420 },
        { hour: "09", users: 520 }, { hour: "10", users: 580 }, { hour: "11", users: 650 },
        { hour: "12", users: 720 }, { hour: "13", users: 680 }, { hour: "14", users: 620 },
        { hour: "15", users: 580 }, { hour: "16", users: 540 }, { hour: "17", users: 480 },
        { hour: "18", users: 420 }, { hour: "19", users: 380 }, { hour: "20", users: 320 },
        { hour: "21", users: 280 }, { hour: "22", users: 220 }, { hour: "23", users: 160 }
    ],

    topProducts: [
        { product: "iPhone 14 Pro", sales: 1234, revenue: "$123,400", growth: "+12%", trend: "up" },
        { product: "MacBook Air", sales: 867, revenue: "$86,700", growth: "+8%", trend: "up" },
        { product: "iPad Pro", sales: 543, revenue: "$54,300", growth: "+15%", trend: "up" },
        { product: "AirPods Pro", sales: 2156, revenue: "$43,120", growth: "+22%", trend: "up" },
        { product: "Apple Watch", sales: 876, revenue: "$35,040", growth: "-5%", trend: "down" },
        { product: "Mac Studio", sales: 234, revenue: "$46,800", growth: "+18%", trend: "up" }
    ]
}

export async function getStatisticsData() {
    return mockStatisticsData
}

// Mock data for roles and permissions
export const mockRoles: Role[] = [
    {
        id: '1',
        name: 'Admin',
        description: 'Full system access',
        userCount: 3,
        permissions: ['read', 'write', 'delete', 'manage_users'],
        createdAt: '2024-01-15'
    },
    {
        id: '2',
        name: 'Editor',
        description: 'Content management access',
        userCount: 12,
        permissions: ['read', 'write'],
        createdAt: '2024-01-20'
    },
    {
        id: '3',
        name: 'Viewer',
        description: 'Read-only access',
        userCount: 25,
        permissions: ['read'],
        createdAt: '2024-02-01'
    }
]

export const mockPermissions: Permission[] = [
    {
        id: '1',
        name: 'read',
        description: 'View content and data',
        category: 'Content',
        rolesCount: 3
    },
    {
        id: '2',
        name: 'write',
        description: 'Create and edit content',
        category: 'Content',
        rolesCount: 2
    },
    {
        id: '3',
        name: 'delete',
        description: 'Remove content and data',
        category: 'Content',
        rolesCount: 1
    },
    {
        id: '4',
        name: 'manage_users',
        description: 'Manage user accounts',
        category: 'User Management',
        rolesCount: 1
    }
]

// Roles functions
export async function getRoles(params: { search?: string } = {}) {
    const { search = '' } = params

    let filteredRoles = mockRoles

    if (search) {
        filteredRoles = mockRoles.filter(role =>
            role.name.toLowerCase().includes(search.toLowerCase()) ||
            role.description.toLowerCase().includes(search.toLowerCase())
        )
    }

    return filteredRoles
}

export async function getRoleById(id: string) {
    return mockRoles.find(role => role.id === id)
}

export async function createRole(data: { name: string; description: string; permissions: string[] }) {
    const newRole: Role = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        permissions: data.permissions,
        userCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
    }

    mockRoles.push(newRole)
    return newRole
}

export async function updateRole(id: string, data: { name?: string; description?: string; permissions?: string[] }) {
    const roleIndex = mockRoles.findIndex(role => role.id === id)
    if (roleIndex !== -1) {
        mockRoles[roleIndex] = { ...mockRoles[roleIndex], ...data }
        return mockRoles[roleIndex]
    }
    return null
}

export async function deleteRole(id: string) {
    const roleIndex = mockRoles.findIndex(role => role.id === id)
    if (roleIndex !== -1) {
        mockRoles.splice(roleIndex, 1)
        return true
    }
    return false
}

// Permissions functions
export async function getPermissions(params: { search?: string } = {}) {
    const { search = '' } = params

    let filteredPermissions = mockPermissions

    if (search) {
        filteredPermissions = mockPermissions.filter(permission =>
            permission.name.toLowerCase().includes(search.toLowerCase()) ||
            permission.description.toLowerCase().includes(search.toLowerCase()) ||
            permission.category.toLowerCase().includes(search.toLowerCase())
        )
    }

    return filteredPermissions
}

export async function getPermissionById(id: string) {
    return mockPermissions.find(permission => permission.id === id)
}

export async function createPermission(data: { name: string; description: string; category: string }) {
    const newPermission: Permission = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        category: data.category,
        rolesCount: 0
    }

    mockPermissions.push(newPermission)
    return newPermission
}

export async function updatePermission(id: string, data: { name?: string; description?: string; category?: string }) {
    const permissionIndex = mockPermissions.findIndex(permission => permission.id === id)
    if (permissionIndex !== -1) {
        mockPermissions[permissionIndex] = { ...mockPermissions[permissionIndex], ...data }
        return mockPermissions[permissionIndex]
    }
    return null
}

export async function deletePermission(id: string) {
    const permissionIndex = mockPermissions.findIndex(permission => permission.id === id)
    if (permissionIndex !== -1) {
        mockPermissions.splice(permissionIndex, 1)
        return true
    }
    return false
}

// User notifications interface
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

// Mock data for user notifications
export const mockUserNotifications: UserNotification[] = [
    {
        id: '1',
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        avatar: 'AY',
        globalEnabled: true,
        notifications: {
            motivation: { push: true, email: true, sms: false },
            dailyReminder: { push: false, email: true, sms: false },
            marketing: { push: true, email: false, sms: false },
            system: { push: true, email: true, sms: true }
        },
        lastActivity: '2025-01-15'
    },
    {
        id: '2',
        name: 'Elif Kaya',
        email: 'elif@example.com',
        avatar: 'EK',
        globalEnabled: false,
        notifications: {
            motivation: { push: false, email: false, sms: false },
            dailyReminder: { push: false, email: false, sms: false },
            marketing: { push: false, email: false, sms: false },
            system: { push: true, email: true, sms: false }
        },
        lastActivity: '2025-01-20'
    },
    {
        id: '3',
        name: 'Mehmet Demir',
        email: 'mehmet@example.com',
        avatar: 'MD',
        globalEnabled: true,
        notifications: {
            motivation: { push: true, email: false, sms: false },
            dailyReminder: { push: true, email: true, sms: false },
            marketing: { push: false, email: false, sms: false },
            system: { push: true, email: true, sms: false }
        },
        lastActivity: '2025-01-22'
    },
    {
        id: '4',
        name: 'Zeynep Özkan',
        email: 'zeynep@example.com',
        avatar: 'ZO',
        globalEnabled: true,
        notifications: {
            motivation: { push: true, email: true, sms: true },
            dailyReminder: { push: true, email: false, sms: false },
            marketing: { push: true, email: true, sms: false },
            system: { push: true, email: true, sms: true }
        },
        lastActivity: '2025-01-24'
    }
]

// User notifications functions
export async function getUserNotifications() {
    return mockUserNotifications
}

export async function getUserNotificationById(id: string) {
    return mockUserNotifications.find(user => user.id === id)
}

export async function updateUserNotifications(id: string, updates: { globalEnabled?: boolean; notifications?: any }) {
    const userIndex = mockUserNotifications.findIndex(user => user.id === id)
    if (userIndex !== -1) {
        mockUserNotifications[userIndex] = { ...mockUserNotifications[userIndex], ...updates }
        return mockUserNotifications[userIndex]
    }
    return null
}

export async function bulkUpdateUserNotifications(userIds: string[], updates: { globalEnabled?: boolean; notifications?: any }) {
    const updatedUsers: UserNotification[] = []

    userIds.forEach(id => {
        const userIndex = mockUserNotifications.findIndex(user => user.id === id)
        if (userIndex !== -1) {
            mockUserNotifications[userIndex] = { ...mockUserNotifications[userIndex], ...updates }
            updatedUsers.push(mockUserNotifications[userIndex])
        }
    })

    return updatedUsers
}
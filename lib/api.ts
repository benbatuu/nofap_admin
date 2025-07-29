/* eslint-disable @typescript-eslint/no-explicit-any */
// API client utilities
import type { 
    DashboardStats, 
    Activity, 
    SystemStatus, 
    MonthlyStats, 
    UsersResponse, 
    Role, 
    Permission, 
    CreateRoleData, 
    CreatePermissionData, 
    UserNotification, 
    UpdateUserNotificationData, 
    BulkUpdateNotificationData, 
    BlockedUsersResponse, 
    BlockedUser, 
    CreateBlockedUserData, 
    UpdateBlockedUserData, 
    StatisticData, 
    BlockedIPsResponse, 
    BlockedIP, 
    CreateBlockedIPData, 
    UpdateBlockedIPData,
    RelapseStats,
    RelapseFilters,
    RelapseData,
    RelapseResponse,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message)
        this.name = 'ApiError'
    }
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    }

    try {
        const response = await fetch(url, config)
        const data = await response.json()

        if (!response.ok) {
            throw new ApiError(response.status, data.error || 'API request failed')
        }

        if (!data.success) {
            throw new ApiError(response.status, data.error || 'API request failed')
        }

        return data.data
    } catch (error) {
        if (error instanceof ApiError) {
            throw error
        }
        throw new ApiError(500, 'Network error')
    }
}

// Users API
export const usersApi = {
    getUsers: (params?: { page?: number; limit?: number; search?: string }): Promise<UsersResponse> => {
        const searchParams = new URLSearchParams()
        if (params?.page) searchParams.set('page', params.page.toString())
        if (params?.limit) searchParams.set('limit', params.limit.toString())
        if (params?.search) searchParams.set('search', params.search)

        return apiRequest<UsersResponse>(`/users?${searchParams.toString()}`)
    },

    getUserById: (id: string) => {
        return apiRequest(`/users/${id}`)
    },

    createUser: (data: Record<string, any>) => {
        return apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    updateUser: (id: string, data: Record<string, any>) => {
        return apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    deleteUser: (id: string) => {
        return apiRequest(`/users/${id}`, {
            method: 'DELETE',
        })
    },
}

// Messages API
export const messagesApi = {
    getMessages: (params?: {
        page?: number;
        limit?: number;
        type?: string;
        status?: string;
        search?: string;
    }) => {
        const searchParams = new URLSearchParams()
        if (params?.page) searchParams.set('page', params.page.toString())
        if (params?.limit) searchParams.set('limit', params.limit.toString())
        if (params?.type) searchParams.set('type', params.type)
        if (params?.status) searchParams.set('status', params.status)
        if (params?.search) searchParams.set('search', params.search)

        return apiRequest(`/messages?${searchParams.toString()}`)
    },

    getMessageById: (id: string) => {
        return apiRequest(`/messages/${id}`)
    },

    createMessage: (data: any) => {
        return apiRequest('/messages', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    updateMessage: (id: string, data: any) => {
        return apiRequest(`/messages/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    deleteMessage: (id: string) => {
        return apiRequest(`/messages/${id}`, {
            method: 'DELETE',
        })
    },

    markAsRead: (id: string) => {
        return apiRequest(`/messages/${id}/mark-read`, {
            method: 'PUT',
        })
    },

    replyToMessage: (id: string, data: { replyText: string; adminId: string; adminName: string }) => {
        return apiRequest(`/messages/${id}/reply`, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    getAnalytics: (params?: { days?: number }) => {
        const searchParams = new URLSearchParams()
        if (params?.days) searchParams.set('days', params.days.toString())
        
        return apiRequest(`/messages/analytics?${searchParams.toString()}`)
    },

    exportMessages: (params?: {
        format?: 'csv' | 'json';
        type?: string;
        status?: string;
        search?: string;
    }) => {
        const searchParams = new URLSearchParams()
        if (params?.format) searchParams.set('format', params.format)
        if (params?.type) searchParams.set('type', params.type)
        if (params?.status) searchParams.set('status', params.status)
        if (params?.search) searchParams.set('search', params.search)

        return fetch(`${API_BASE_URL}/messages/export?${searchParams.toString()}`)
    },

    archiveMessage: (id: string) => {
        return apiRequest(`/messages/${id}/archive`, {
            method: 'PUT',
        })
    },

    // Enhanced message functionality
    getCategories: () => {
        return apiRequest('/messages/categories')
    },

    getMessagesByCategory: (category: string, limit?: number) => {
        return apiRequest('/messages/categories', {
            method: 'POST',
            body: JSON.stringify({ category, limit })
        })
    },

    scheduleMessage: (data: any) => {
        return apiRequest('/messages/schedule', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    },

    getScheduledMessages: () => {
        return apiRequest('/messages/schedule')
    },

    getDeliveryStats: (days?: number) => {
        const searchParams = new URLSearchParams()
        if (days) searchParams.set('days', days.toString())
        return apiRequest(`/messages/delivery?${searchParams.toString()}`)
    },

    markAsDelivered: (messageId: string) => {
        return apiRequest('/messages/delivery', {
            method: 'POST',
            body: JSON.stringify({ messageId })
        })
    },

    addTags: (messageId: string, tags: string[]) => {
        return apiRequest('/messages/tags', {
            method: 'POST',
            body: JSON.stringify({ messageId, tags, action: 'add' })
        })
    },

    removeTags: (messageId: string, tags: string[]) => {
        return apiRequest('/messages/tags', {
            method: 'POST',
            body: JSON.stringify({ messageId, tags, action: 'remove' })
        })
    },

    getMessageTags: (messageId: string) => {
        return apiRequest('/messages/tags', {
            method: 'PUT',
            body: JSON.stringify({ messageId })
        })
    },
}

// Tasks API
export const tasksApi = {
    getTasks: (params?: {
        page?: number;
        limit?: number;
        status?: string;
        userId?: string
    }) => {
        const searchParams = new URLSearchParams()
        if (params?.page) searchParams.set('page', params.page.toString())
        if (params?.limit) searchParams.set('limit', params.limit.toString())
        if (params?.status) searchParams.set('status', params.status)
        if (params?.userId) searchParams.set('userId', params.userId)

        return apiRequest(`/tasks?${searchParams.toString()}`)
    },

    createTask: (data: Record<string, unknown>) => {
        return apiRequest('/tasks', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },
}

// Dashboard API
export const dashboardApi = {
    getStats: (): Promise<DashboardStats> => {
        return apiRequest<DashboardStats>('/dashboard/stats')
    },

    getActivities: (): Promise<Activity[]> => {
        return apiRequest<Activity[]>('/dashboard/activities')
    },

    getSystemStatus: (): Promise<SystemStatus> => {
        return apiRequest<SystemStatus>('/dashboard/system-status')
    },

    getMonthlyStats: (): Promise<MonthlyStats> => {
        return apiRequest<MonthlyStats>('/dashboard/monthly-stats')
    },

    getStatistics: (): Promise<StatisticData> => {
        return apiRequest('/dashboard/statistics')
    },
}

// Roles API
export const rolesApi = {
    getRoles: (params?: { search?: string }): Promise<Role[]> => {
        const searchParams = new URLSearchParams()
        if (params?.search) searchParams.set('search', params.search)

        return apiRequest<Role[]>(`/roles?${searchParams.toString()}`)
    },

    getRoleById: (id: string): Promise<Role> => {
        return apiRequest<Role>(`/roles/${id}`)
    },

    createRole: (data: CreateRoleData): Promise<Role> => {
        return apiRequest<Role>('/roles', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    updateRole: (id: string, data: Partial<CreateRoleData>): Promise<Role> => {
        return apiRequest<Role>(`/roles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    deleteRole: (id: string): Promise<void> => {
        return apiRequest<void>(`/roles/${id}`, {
            method: 'DELETE',
        })
    },
}

// Permissions API
export const permissionsApi = {
    getPermissions: (params?: { search?: string }): Promise<Permission[]> => {
        const searchParams = new URLSearchParams()
        if (params?.search) searchParams.set('search', params.search)

        return apiRequest<Permission[]>(`/permissions?${searchParams.toString()}`)
    },

    getPermissionById: (id: string): Promise<Permission> => {
        return apiRequest<Permission>(`/permissions/${id}`)
    },

    createPermission: (data: CreatePermissionData): Promise<Permission> => {
        return apiRequest<Permission>('/permissions', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    updatePermission: (id: string, data: Partial<CreatePermissionData>): Promise<Permission> => {
        return apiRequest<Permission>(`/permissions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    deletePermission: (id: string): Promise<void> => {
        return apiRequest<void>(`/permissions/${id}`, {
            method: 'DELETE',
        })
    },
}

// User Notifications API
export const userNotificationsApi = {
    getUserNotifications: (): Promise<{ users: UserNotification[], pagination: any }> => {
        return apiRequest<{ users: UserNotification[], pagination: any }>('/users/notifications')
    },

    getUserNotificationById: (id: string): Promise<UserNotification> => {
        return apiRequest<UserNotification>(`/users/notifications/${id}`)
    },

    updateUserNotification: (id: string, data: UpdateUserNotificationData): Promise<UserNotification> => {
        return apiRequest<UserNotification>(`/users/notifications/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    bulkUpdateUserNotifications: (data: BulkUpdateNotificationData): Promise<UserNotification[]> => {
        return apiRequest<UserNotification[]>('/users/notifications', {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },
}

// Blocked Users API
export const blockedUsersApi = {
    getBlockedUsers: (params?: { page?: number; limit?: number; search?: string }): Promise<BlockedUsersResponse> => {
        const searchParams = new URLSearchParams()
        if (params?.page) searchParams.set('page', params.page.toString())
        if (params?.limit) searchParams.set('limit', params.limit.toString())
        if (params?.search) searchParams.set('search', params.search)


        return apiRequest<BlockedUsersResponse>(`/users/blocked?${searchParams.toString()}`)
    },


    getBlockedUserById: (id: string): Promise<BlockedUser> => {
        return apiRequest<BlockedUser>(`/users/blocked/${id}`)
    },

    createBlockedUser: (data: CreateBlockedUserData): Promise<BlockedUser> => {
        return apiRequest<BlockedUser>('/users/blocked', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    updateBlockedUser: (id: string, data: UpdateBlockedUserData): Promise<BlockedUser> => {
        return apiRequest<BlockedUser>(`/users/blocked/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    deleteBlockedUser: (id: string): Promise<void> => {
        return apiRequest<void>(`/users/blocked/${id}`, {
            method: 'DELETE',
        })
    },
}

export const blockedIpsApi = {
    getBlockedIps: (params?: { page?: number; limit?: number; search?: string }): Promise<BlockedIPsResponse> => {
        const searchParams = new URLSearchParams()
        if (params?.page) searchParams.set('page', params.page.toString())
        if (params?.limit) searchParams.set('limit', params.limit.toString())
        if (params?.search) searchParams.set('search', params.search)
        return apiRequest<BlockedIPsResponse>(`/blocked-ips?${searchParams.toString()}`)
    },

    getBlockedIpById: (id: string): Promise<BlockedIP> => {
        return apiRequest<BlockedIP>(`/blocked-ips/${id}`)
    },

    createBlockedIp: (data: CreateBlockedIPData): Promise<BlockedIP> => {
        return apiRequest<BlockedIP>('/blocked-ips', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    updateBlockedIp: (id: string, data: UpdateBlockedIPData): Promise<BlockedIP> => {
        return apiRequest<BlockedIP>(`/blocked-ips/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    deleteBlockedIp: (id: string): Promise<void> => {
        return apiRequest<void>(`/blocked-ips/${id}`, {
            method: 'DELETE',
        })
    },
}


export const relapseApi = {
    getRelapses: (filters?: RelapseFilters): Promise<RelapseResponse> => {
        const searchParams = new URLSearchParams()
        if (filters?.timeFilter && filters.timeFilter !== 'all') {
          searchParams.set('timeFilter', filters.timeFilter)
        }
        if (filters?.severityFilter && filters.severityFilter !== 'all') {
          searchParams.set('severityFilter', filters.severityFilter)
        }
        if (filters?.page) searchParams.set('page', filters.page.toString())
        if (filters?.limit) searchParams.set('limit', filters.limit.toString())
        if (filters?.userId) searchParams.set('userId', filters.userId)
    
        const queryString = searchParams.toString()
        return apiRequest<RelapseResponse>(`/relapse${queryString ? `?${queryString}` : ''}`)
      },
    
      getRelapseById: (id: string): Promise<RelapseData> => {
        return apiRequest<RelapseData>(`/relapse/${id}`)
      },
    
      createRelapse: (data: RelapseData): Promise<RelapseData> => {
        return apiRequest<RelapseData>('/relapse', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },
    
      updateRelapse: (id: string, data: Partial<RelapseData>): Promise<RelapseData> => {
        return apiRequest<RelapseData>(`/relapse/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })
      },
    
      deleteRelapse: (id: string): Promise<void> => {
        return apiRequest<void>(`/relapse/${id}`, {
          method: 'DELETE',
        })
      },
    
      getRelapseStats: (filters?: RelapseFilters): Promise<RelapseStats> => {
        const searchParams = new URLSearchParams()
        if (filters?.timeFilter && filters.timeFilter !== 'all') {
          searchParams.set('timeFilter', filters.timeFilter)
        }
        if (filters?.severityFilter && filters.severityFilter !== 'all') {
          searchParams.set('severityFilter', filters.severityFilter)
        }
        if (filters?.userId) {
          searchParams.set('userId', filters.userId)
        }
    
        const queryString = searchParams.toString()
        return apiRequest<RelapseStats>(`/relapse/stats${queryString ? `?${queryString}` : ''}`)
      },

      getRelapseAnalytics: (filters?: RelapseFilters): Promise<any> => {
        const searchParams = new URLSearchParams()
        if (filters?.timeFilter && filters.timeFilter !== 'all') {
          searchParams.set('timeFilter', filters.timeFilter)
        }
        if (filters?.severityFilter && filters.severityFilter !== 'all') {
          searchParams.set('severityFilter', filters.severityFilter)
        }
        if (filters?.userId) {
          searchParams.set('userId', filters.userId)
        }
    
        const queryString = searchParams.toString()
        return apiRequest<any>(`/relapse/analytics${queryString ? `?${queryString}` : ''}`)
      },
}

// Generic API hooks for React Query/SWR
export const streakApi = {
    getStreakAnalytics: (filters?: { userId?: string; timeFilter?: string; limit?: number }) => {
        const searchParams = new URLSearchParams()
        if (filters?.userId) searchParams.set('userId', filters.userId)
        if (filters?.timeFilter && filters.timeFilter !== 'all') {
            searchParams.set('timeFilter', filters.timeFilter)
        }
        if (filters?.limit) searchParams.set('limit', filters.limit.toString())

        const queryString = searchParams.toString()
        return apiRequest<any>(`/data/streak${queryString ? `?${queryString}` : ''}`)
    }
}

export const notificationSendApi = {
    getSentNotifications: (filters?: {
        page?: number;
        limit?: number;
        status?: string;
        type?: string;
        search?: string;
    }) => {
        const searchParams = new URLSearchParams()
        if (filters?.page) searchParams.set('page', filters.page.toString())
        if (filters?.limit) searchParams.set('limit', filters.limit.toString())
        if (filters?.status && filters.status !== 'all') searchParams.set('status', filters.status)
        if (filters?.type && filters.type !== 'all') searchParams.set('type', filters.type)
        if (filters?.search) searchParams.set('search', filters.search)

        const queryString = searchParams.toString()
        return apiRequest<any>(`/notifications/send${queryString ? `?${queryString}` : ''}`)
    },

    sendNotification: (data: any) => {
        return apiRequest<any>('/notifications/send', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    sendTargetedNotification: (data: any) => {
        return apiRequest<any>('/notifications/send/targeted', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    getTargetGroups: () => {
        return apiRequest<any>('/notifications/send/target-groups')
    }
}

export const notificationTemplateApi = {
    getNotificationTemplates: (filters?: {
        page?: number;
        limit?: number;
        type?: string;
        isActive?: boolean;
        search?: string;
    }) => {
        const searchParams = new URLSearchParams()
        if (filters?.page) searchParams.set('page', filters.page.toString())
        if (filters?.limit) searchParams.set('limit', filters.limit.toString())
        if (filters?.type && filters.type !== 'all') searchParams.set('type', filters.type)
        if (filters?.isActive !== undefined) searchParams.set('isActive', filters.isActive.toString())
        if (filters?.search) searchParams.set('search', filters.search)

        const queryString = searchParams.toString()
        return apiRequest<any>(`/notifications/templates${queryString ? `?${queryString}` : ''}`)
    },

    getNotificationTemplateById: (id: string) => {
        return apiRequest<any>(`/notifications/templates/${id}`)
    },

    createNotificationTemplate: (data: any) => {
        return apiRequest<any>('/notifications/templates', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    updateNotificationTemplate: (id: string, data: any) => {
        return apiRequest<any>(`/notifications/templates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    deleteNotificationTemplate: (id: string) => {
        return apiRequest<any>(`/notifications/templates/${id}`, {
            method: 'DELETE',
        })
    },

    getDefaultTemplates: () => {
        return apiRequest<any>('/notifications/templates/defaults')
    }
}

export const scheduledNotificationApi = {
    getScheduledNotifications: (filters?: {
        page?: number;
        limit?: number;
        status?: string;
        frequency?: string;
        search?: string;
    }) => {
        const searchParams = new URLSearchParams()
        if (filters?.page) searchParams.set('page', filters.page.toString())
        if (filters?.limit) searchParams.set('limit', filters.limit.toString())
        if (filters?.status && filters.status !== 'all') searchParams.set('status', filters.status)
        if (filters?.frequency && filters.frequency !== 'all') searchParams.set('frequency', filters.frequency)
        if (filters?.search) searchParams.set('search', filters.search)

        const queryString = searchParams.toString()
        return apiRequest<any>(`/notifications/scheduled${queryString ? `?${queryString}` : ''}`)
    },

    getScheduledNotificationById: (id: string) => {
        return apiRequest<any>(`/notifications/scheduled/${id}`)
    },

    createScheduledNotification: (data: any) => {
        return apiRequest<any>('/notifications/scheduled', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    updateScheduledNotification: (id: string, data: any) => {
        return apiRequest<any>(`/notifications/scheduled/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    deleteScheduledNotification: (id: string) => {
        return apiRequest<any>(`/notifications/scheduled/${id}`, {
            method: 'DELETE',
        })
    },

    getScheduledNotificationAnalytics: (filters?: { timeFilter?: string; status?: string }) => {
        const searchParams = new URLSearchParams()
        if (filters?.timeFilter && filters.timeFilter !== 'all') {
            searchParams.set('timeFilter', filters.timeFilter)
        }
        if (filters?.status && filters.status !== 'all') {
            searchParams.set('status', filters.status)
        }

        const queryString = searchParams.toString()
        return apiRequest<any>(`/notifications/scheduled/analytics${queryString ? `?${queryString}` : ''}`)
    },

    getNotificationTimeSuggestions: () => {
        return apiRequest<any>('/notifications/scheduled/suggestions')
    },

    getUpcomingNotifications: (filters?: { hours?: number; limit?: number }) => {
        const searchParams = new URLSearchParams()
        if (filters?.hours) searchParams.set('hours', filters.hours.toString())
        if (filters?.limit) searchParams.set('limit', filters.limit.toString())

        const queryString = searchParams.toString()
        return apiRequest<any>(`/notifications/scheduled/upcoming${queryString ? `?${queryString}` : ''}`)
    }
}

export const notificationLogApi = {
    getNotificationLogs: (filters?: {
        page?: number;
        limit?: number;
        status?: string;
        type?: string;
        search?: string;
        dateRange?: { start: Date; end: Date };
    }) => {
        const searchParams = new URLSearchParams()
        if (filters?.page) searchParams.set('page', filters.page.toString())
        if (filters?.limit) searchParams.set('limit', filters.limit.toString())
        if (filters?.status && filters.status !== 'all') searchParams.set('status', filters.status)
        if (filters?.type && filters.type !== 'all') searchParams.set('type', filters.type)
        if (filters?.search) searchParams.set('search', filters.search)
        if (filters?.dateRange) searchParams.set('dateRange', JSON.stringify(filters.dateRange))

        const queryString = searchParams.toString()
        return apiRequest<any>(`/notifications/logs${queryString ? `?${queryString}` : ''}`)
    },

    getNotificationLogAnalytics: (filters?: {
        dateRange?: { start: Date; end: Date };
    }) => {
        const searchParams = new URLSearchParams()
        if (filters?.dateRange) searchParams.set('dateRange', JSON.stringify(filters.dateRange))

        const queryString = searchParams.toString()
        return apiRequest<any>(`/notifications/logs/analytics${queryString ? `?${queryString}` : ''}`)
    },

    getNotificationLogStats: () => {
        return apiRequest<any>('/notifications/logs/stats')
    }
}

export const productApi = {
    getProducts: (filters?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }) => {
        const searchParams = new URLSearchParams()
        if (filters?.page) searchParams.set('page', filters.page.toString())
        if (filters?.limit) searchParams.set('limit', filters.limit.toString())
        if (filters?.search) searchParams.set('search', filters.search)
        if (filters?.status && filters.status !== 'all') searchParams.set('status', filters.status)

        const queryString = searchParams.toString()
        return apiRequest<any>(`/billing/products${queryString ? `?${queryString}` : ''}`)
    },

    getProductById: (id: string) => {
        return apiRequest<any>(`/billing/products/${id}`)
    },

    createProduct: (data: any) => {
        return apiRequest<any>('/billing/products', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    updateProduct: (id: string, data: any) => {
        return apiRequest<any>(`/billing/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    deleteProduct: (id: string) => {
        return apiRequest<any>(`/billing/products/${id}`, {
            method: 'DELETE',
        })
    },

    getProductAnalytics: (filters?: {
        timeFilter?: string;
    }) => {
        const searchParams = new URLSearchParams()
        if (filters?.timeFilter && filters.timeFilter !== 'all') {
            searchParams.set('timeFilter', filters.timeFilter)
        }

        const queryString = searchParams.toString()
        return apiRequest<any>(`/billing/products/analytics${queryString ? `?${queryString}` : ''}`)
    },

    getProductSuggestions: () => {
        return apiRequest<any>('/billing/products/suggestions')
    }
}

export const dataActivityApi = {

    getActivityAnalytics: (filters?: {
        timeFilter?: string;
        userId?: string;
        limit?: number;
    }) => {
        const searchParams = new URLSearchParams()
        if (filters?.timeFilter && filters.timeFilter !== 'all') {
            searchParams.set('timeFilter', filters.timeFilter)
        }
        if (filters?.userId) searchParams.set('userId', filters.userId)
        if (filters?.limit) searchParams.set('limit', filters.limit.toString())
        const queryString = searchParams.toString()
        return apiRequest<any>(`/data/activity/analytics${queryString ? `?${queryString}` : ''}`)  
    }
}

export const apiEndpoints = {
    users: '/users',
    messages: '/messages',
    tasks: '/tasks',
    dashboardStats: '/dashboard/stats',
    blockedUsers: '/users/blocked',
    blockedIps: '/blocked-ips',
    roles: '/roles',
    permissions: '/permissions',
    userNotifications: '/users/notifications',
    relapse: '/relapse',
    streak: '/data/streak',
    scheduledNotifications: '/notifications/scheduled',
    notificationSend: '/notifications/send',
    notificationTemplates: '/notifications/templates',
    notificationLogs: '/notifications/logs',
    products: '/billing/products',
    dataActivity: '/data/activity',
} as const
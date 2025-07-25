/* eslint-disable @typescript-eslint/no-explicit-any */
// API client utilities
import type { DashboardStats, Activity, SystemStatus, MonthlyStats, UsersResponse, Role, Permission, CreateRoleData, CreatePermissionData, UserNotification, UpdateUserNotificationData, BulkUpdateNotificationData, BlockedUsersResponse, BlockedUser, CreateBlockedUserData, UpdateBlockedUserData } from "@/types/api";

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

    updateUser: (id: string, data: Record<string, any>) => {
        return apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },
}

// Messages API
export const messagesApi = {
    getMessages: (params?: {
        page?: number;
        limit?: number;
        type?: string;
        status?: string
    }) => {
        const searchParams = new URLSearchParams()
        if (params?.page) searchParams.set('page', params.page.toString())
        if (params?.limit) searchParams.set('limit', params.limit.toString())
        if (params?.type) searchParams.set('type', params.type)
        if (params?.status) searchParams.set('status', params.status)

        return apiRequest(`/messages?${searchParams.toString()}`)
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

    getStatistics: () => {
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
    getUserNotifications: (): Promise<UserNotification[]> => {
        return apiRequest<UserNotification[]>('/users/notifications')
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

// Generic API hooks for React Query/SWR
export const apiEndpoints = {
    users: '/users',
    messages: '/messages',
    tasks: '/tasks',
    dashboardStats: '/dashboard/stats',
    blockedUsers: '/users/blocked',
} as const
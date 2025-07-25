/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi, messagesApi, tasksApi, dashboardApi, rolesApi, permissionsApi, userNotificationsApi, blockedUsersApi } from '@/lib/api'
import type { DashboardStats, Activity, SystemStatus, MonthlyStats, UsersResponse, Role, Permission, CreateRoleData, CreatePermissionData, UserNotification, UpdateUserNotificationData, BulkUpdateNotificationData, BlockedUsersResponse, BlockedUser, CreateBlockedUserData, UpdateBlockedUserData } from '@/types/api'

// Users hooks
export function useUsers(params?: { page?: number; limit?: number; search?: string }) {
    return useQuery<UsersResponse>({
        queryKey: ['users', params],
        queryFn: () => usersApi.getUsers(params),
    })
}

export function useUser(id: string) {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => usersApi.getUserById(id),
        enabled: !!id,
    })
}

export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            usersApi.updateUser(id, data),
        onSuccess: (data, variables) => {
            // Update the user in the cache
            queryClient.setQueryData(['users', variables.id], data)
            // Invalidate users list to refetch
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}

// Messages hooks
export function useMessages(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string
}) {
    return useQuery({
        queryKey: ['messages', params],
        queryFn: () => messagesApi.getMessages(params),
    })
}

// Tasks hooks
export function useTasks(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string
}) {
    return useQuery({
        queryKey: ['tasks', params],
        queryFn: () => tasksApi.getTasks(params),
    })
}

export function useCreateTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: any) => tasksApi.createTask(data),
        onSuccess: () => {
            // Invalidate tasks list to refetch
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })
}

// Dashboard hooks
export function useDashboardStats() {
    return useQuery<DashboardStats>({
        queryKey: ['dashboard', 'stats'],
        queryFn: () => dashboardApi.getStats(),
        refetchInterval: 30000, // Refetch every 30 seconds
    })
}

export function useRecentActivities() {
    return useQuery<Activity[]>({
        queryKey: ['dashboard', 'activities'],
        queryFn: () => dashboardApi.getActivities(),
        refetchInterval: 60000, // Refetch every minute
    })
}

export function useSystemStatus() {
    return useQuery<SystemStatus>({
        queryKey: ['dashboard', 'system-status'],
        queryFn: () => dashboardApi.getSystemStatus(),
        refetchInterval: 30000, // Refetch every 30 seconds
    })
}

export function useMonthlyStats() {
    return useQuery<MonthlyStats>({
        queryKey: ['dashboard', 'monthly-stats'],
        queryFn: () => dashboardApi.getMonthlyStats(),
        refetchInterval: 300000, // Refetch every 5 minutes
    })
}

export function useStatistics() {
    return useQuery({
        queryKey: ['dashboard', 'statistics'],
        queryFn: () => dashboardApi.getStatistics(),
        refetchInterval: 60000, // Refetch every minute
    })
}

// Generic hooks for common patterns
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

export function usePagination(initialPage = 1, initialLimit = 10) {
    const [page, setPage] = React.useState(initialPage)
    const [limit, setLimit] = React.useState(initialLimit)

    const nextPage = () => setPage(prev => prev + 1)
    const prevPage = () => setPage(prev => Math.max(1, prev - 1))
    const goToPage = (newPage: number) => setPage(Math.max(1, newPage))
    const changeLimit = (newLimit: number) => {
        setLimit(newLimit)
        setPage(1) // Reset to first page when changing limit
    }

    return {
        page,
        limit,
        nextPage,
        prevPage,
        goToPage,
        changeLimit,
        setPage,
        setLimit,
    }
}

// Roles hooks
export function useRoles(params?: { search?: string }) {
    return useQuery<Role[]>({
        queryKey: ['roles', params],
        queryFn: () => rolesApi.getRoles(params),
        refetchInterval: 60000, // Refetch every minute
    })
}

export function useRole(id: string) {
    return useQuery<Role>({
        queryKey: ['roles', id],
        queryFn: () => rolesApi.getRoleById(id),
        enabled: !!id,
    })
}

export function useCreateRole() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateRoleData) => rolesApi.createRole(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] })
        },
    })
}

export function useUpdateRole() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateRoleData> }) =>
            rolesApi.updateRole(id, data),
        onSuccess: (data, variables) => {
            queryClient.setQueryData(['roles', variables.id], data)
            queryClient.invalidateQueries({ queryKey: ['roles'] })
        },
    })
}

export function useDeleteRole() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => rolesApi.deleteRole(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] })
        },
    })
}

// Permissions hooks
export function usePermissions(params?: { search?: string }) {
    return useQuery<Permission[]>({
        queryKey: ['permissions', params],
        queryFn: () => permissionsApi.getPermissions(params),
        refetchInterval: 60000, // Refetch every minute
    })
}

export function usePermission(id: string) {
    return useQuery<Permission>({
        queryKey: ['permissions', id],
        queryFn: () => permissionsApi.getPermissionById(id),
        enabled: !!id,
    })
}

export function useCreatePermission() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreatePermissionData) => permissionsApi.createPermission(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] })
        },
    })
}

export function useUpdatePermission() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreatePermissionData> }) =>
            permissionsApi.updatePermission(id, data),
        onSuccess: (data, variables) => {
            queryClient.setQueryData(['permissions', variables.id], data)
            queryClient.invalidateQueries({ queryKey: ['permissions'] })
        },
    })
}

export function useDeletePermission() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => permissionsApi.deletePermission(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] })
        },
    })
}

// User Notifications hooks
export function useUserNotifications() {
    return useQuery<UserNotification[]>({
        queryKey: ['userNotifications'],
        queryFn: () => userNotificationsApi.getUserNotifications(),
        refetchInterval: 60000, // Refetch every minute
    })
}

export function useUserNotification(id: string) {
    return useQuery<UserNotification>({
        queryKey: ['userNotifications', id],
        queryFn: () => userNotificationsApi.getUserNotificationById(id),
        enabled: !!id,
    })
}

export function useUpdateUserNotification() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserNotificationData }) =>
            userNotificationsApi.updateUserNotification(id, data),
        onSuccess: (data, variables) => {
            queryClient.setQueryData(['userNotifications', variables.id], data)
            queryClient.invalidateQueries({ queryKey: ['userNotifications'] })
        },
    })
}

export function useBulkUpdateUserNotifications() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: BulkUpdateNotificationData) =>
            userNotificationsApi.bulkUpdateUserNotifications(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userNotifications'] })
        },
    })
}
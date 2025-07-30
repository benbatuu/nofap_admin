/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi, messagesApi, tasksApi, dashboardApi, rolesApi, permissionsApi, userNotificationsApi, blockedUsersApi, blockedIpsApi, relapseApi, streakApi, scheduledNotificationApi, notificationSendApi, notificationTemplateApi, notificationLogApi, productApi, subscriptionApi, dataActivityApi } from '@/lib/api'
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
  BlockedIPsResponse,
  BlockedIP,
  CreateBlockedIPData,
  UpdateBlockedIPData,
  RelapseData,
  RelapseFilters,
  RelapseResponse,
  RelapseStats
} from '@/types/api'

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

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => usersApi.createUser(data),
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: ['users'] })
      // invaliadate stats service
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
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
      // Invalidate stats service
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: ['users'] })
      // Invalidate stats service
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

// Messages hooks
export function useMessages(params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['messages', params],
    queryFn: () => messagesApi.getMessages(params),
  })
}

export function useMessage(id: string) {
  return useQuery({
    queryKey: ['messages', id],
    queryFn: () => messagesApi.getMessageById(id),
    enabled: !!id,
  })
}

export function useCreateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => messagesApi.createMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

export function useUpdateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      messagesApi.updateMessage(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['messages', variables.id], data)
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => messagesApi.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => messagesApi.markAsRead(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(['messages', id], data)
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

export function useReplyToMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { replyText: string; adminId: string; adminName: string } }) =>
      messagesApi.replyToMessage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

export function useMessageAnalytics(params?: { days?: number }) {
  return useQuery({
    queryKey: ['messages', 'analytics', params],
    queryFn: () => messagesApi.getAnalytics(params),
    staleTime: 300000, // 5 minutes
  })
}

export function useArchiveMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => messagesApi.archiveMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

// Enhanced message hooks
export function useMessageCategories() {
  return useQuery({
    queryKey: ['messages', 'categories'],
    queryFn: () => messagesApi.getCategories(),
    staleTime: 300000, // 5 minutes
  })
}

export function useMessagesByCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ category, limit }: { category: string; limit?: number }) =>
      messagesApi.getMessagesByCategory(category, limit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

export function useScheduleMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => messagesApi.scheduleMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['messages', 'scheduled'] })
    },
  })
}

export function useScheduledMessages() {
  return useQuery({
    queryKey: ['messages', 'scheduled'],
    queryFn: () => messagesApi.getScheduledMessages(),
    refetchInterval: 60000, // Refetch every minute
  })
}

export function useDeliveryStats(days = 30) {
  return useQuery({
    queryKey: ['messages', 'delivery', days],
    queryFn: () => messagesApi.getDeliveryStats(days),
    staleTime: 300000, // 5 minutes
  })
}

export function useMarkAsDelivered() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: string) => messagesApi.markAsDelivered(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['messages', 'delivery'] })
    },
  })
}

export function useAddMessageTags() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ messageId, tags }: { messageId: string; tags: string[] }) =>
      messagesApi.addTags(messageId, tags),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['messages', variables.messageId], data)
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

export function useRemoveMessageTags() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ messageId, tags }: { messageId: string; tags: string[] }) =>
      messagesApi.removeTags(messageId, tags),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['messages', variables.messageId], data)
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

export function useMessageTags(messageId: string) {
  return useQuery({
    queryKey: ['messages', messageId, 'tags'],
    queryFn: () => messagesApi.getMessageTags(messageId),
    enabled: !!messageId,
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

// AI Task Generation hooks
export function useGenerateAITask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { userId: string; slipId?: string; taskType?: string }) =>
      fetch('/api/tasks/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useBulkGenerateAITasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { userIds?: string[]; excludeUserIds?: string[] }) =>
      fetch('/api/tasks/ai-generate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useRegenerateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) =>
      fetch(`/api/tasks/${taskId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json()),
    onSuccess: () => {
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
    staleTime: 15000, // Consider data fresh for 15 seconds
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
export const useRoles = (params?: { search?: string }) => {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => rolesApi.getRoles(params),
    enabled: !!params?.search || !params // Bu satır sorun olabilir
  });
};

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
export const usePermissions = (params?: { search?: string }) => {
  return useQuery({
    queryKey: ['permissions', params],
    queryFn: () => permissionsApi.getPermissions(params),
    enabled: !!params?.search || !params // Bu satır sorun olabilir
  });
};

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
  return useQuery<{ users: UserNotification[], pagination: any }>({
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

// Blocked Users hooks
export function useBlockedUserss(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery<BlockedUsersResponse>({
    queryKey: ['blockedUsers', params],
    queryFn: () => blockedUsersApi.getBlockedUsers(params),
    refetchOnWindowFocus: true, // Pencere odaklandığında yenile
  })
}

export const useBlockedUsers = (params?: { page?: number; limit?: number; search?: string; }, options?: { enabled?: boolean; }) => {
  return useQuery<BlockedUsersResponse>({
    queryKey: ['blockedUsers', params],
    queryFn: () => blockedUsersApi.getBlockedUsers(params),
    enabled: options?.enabled !== false
  });
};

export function useBlockedUser(id: string) {
  return useQuery<BlockedUser>({
    queryKey: ['blockedUsers', id],
    queryFn: () => blockedUsersApi.getBlockedUserById(id),
    enabled: !!id,
  })
}

export function useCreateBlockedUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBlockedUserData) => blockedUsersApi.createBlockedUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] })
    },
  })
}

export function useUpdateBlockedUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlockedUserData }) =>
      blockedUsersApi.updateBlockedUser(id, data),
    onSuccess: (data, variables) => {
      // Sadece burada invalidate işlemi yap, refetch yapma
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] })
    },
  })
}

export function useDeleteBlockedUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => blockedUsersApi.deleteBlockedUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] })
    },
  })
}

export function useBlockedIPs(params?: { page?: number; limit?: number; search?: string; }, options?: { enabled?: boolean; }) {
  return useQuery<BlockedIPsResponse>({
    queryKey: ['blockedIPs', params],
    queryFn: () => blockedIpsApi.getBlockedIps(params),
    enabled: options?.enabled !== false,
    refetchOnWindowFocus: true, // Pencere odaklandığında yenile
  })
}

export function useBlockedIP(id: string) {
  return useQuery<BlockedIP>({
    queryKey: ['blockedIPs', id],
    queryFn: () => blockedIpsApi.getBlockedIpById(id),
    enabled: !!id,
  })
}

export function useCreateBlockedIP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBlockedIPData) => blockedIpsApi.createBlockedIp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedIPs'] })
    },
  })
}

export function useUpdateBlockedIP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlockedIPData }) =>
      blockedIpsApi.updateBlockedIp(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blockedIPs'] })
    },
  })
}

export function useDeleteBlockedIP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => blockedIpsApi.deleteBlockedIp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedIPs'] })
    },
  })
}

export function useFetchRelapses(filters: RelapseFilters = {}) {
  return useQuery<RelapseResponse, Error>({
    queryKey: ['relapses', filters],
    queryFn: () => relapseApi.getRelapses(filters),
    staleTime: 30000, // 30 saniye
    retry: 2,
  })
}

export function useFetchRelapse(id: string) {
  return useQuery<RelapseData, Error>({
    queryKey: ['relapses', id],
    queryFn: () => relapseApi.getRelapseById(id),
    enabled: !!id,
    retry: 2,
  })
}

export function useCreateRelapse() {
  const queryClient = useQueryClient()

  return useMutation<RelapseData, Error, RelapseData>({
    mutationFn: (data: RelapseData) => relapseApi.createRelapse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relapses'] })
      queryClient.invalidateQueries({ queryKey: ['relapseStats'] })
    },
    onError: (error) => {
      console.error('Create relapse error:', error)
    }
  })
}

export function useUpdateRelapse() {
  const queryClient = useQueryClient()

  return useMutation<RelapseData, Error, { id: string; data: Partial<RelapseData> }>({
    mutationFn: ({ id, data }) => relapseApi.updateRelapse(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['relapses'] })
      queryClient.invalidateQueries({ queryKey: ['relapses', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['relapseStats'] })
    },
    onError: (error) => {
      console.error('Update relapse error:', error)
    }
  })
}

export function useDeleteRelapse() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => relapseApi.deleteRelapse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relapses'] })
      queryClient.invalidateQueries({ queryKey: ['relapseStats'] })
    },
    onError: (error) => {
      console.error('Delete relapse error:', error)
    }
  })
}

export function useRelapseStats(filters?: RelapseFilters) {
  return useQuery<RelapseStats, Error>({
    queryKey: ['relapseStats', filters],
    queryFn: () => relapseApi.getRelapseStats(filters),
    staleTime: 60000, // 1 dakika
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// Streak hooks
export function useStreakAnalytics(filters?: { userId?: string; timeFilter?: string; limit?: number }) {
  return useQuery({
    queryKey: ['streakAnalytics', filters],
    queryFn: () => streakApi.getStreakAnalytics(filters),
    staleTime: 60000, // 1 dakika
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

// Scheduled Notification hooks
export function useScheduledNotifications(filters?: {
  page?: number;
  limit?: number;
  status?: string;
  frequency?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['scheduledNotifications', filters],
    queryFn: () => scheduledNotificationApi.getScheduledNotifications(filters),
    staleTime: 30000,
    retry: 2,
  })
}

export function useScheduledNotification(id: string) {
  return useQuery({
    queryKey: ['scheduledNotifications', id],
    queryFn: () => scheduledNotificationApi.getScheduledNotificationById(id),
    enabled: !!id,
    retry: 2,
  })
}

export function useCreateScheduledNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => scheduledNotificationApi.createScheduledNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledNotifications'] })
      queryClient.invalidateQueries({ queryKey: ['scheduledNotificationAnalytics'] })
    },
  })
}

export function useUpdateScheduledNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      scheduledNotificationApi.updateScheduledNotification(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['scheduledNotifications', variables.id], data)
      queryClient.invalidateQueries({ queryKey: ['scheduledNotifications'] })
      queryClient.invalidateQueries({ queryKey: ['scheduledNotificationAnalytics'] })
    },
  })
}

export function useDeleteScheduledNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scheduledNotificationApi.deleteScheduledNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledNotifications'] })
      queryClient.invalidateQueries({ queryKey: ['scheduledNotificationAnalytics'] })
    },
  })
}

export function useScheduledNotificationAnalytics(filters?: { timeFilter?: string; status?: string }) {
  return useQuery({
    queryKey: ['scheduledNotificationAnalytics', filters],
    queryFn: () => scheduledNotificationApi.getScheduledNotificationAnalytics(filters),
    staleTime: 60000,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export function useNotificationTimeSuggestions() {
  return useQuery({
    queryKey: ['notificationTimeSuggestions'],
    queryFn: () => scheduledNotificationApi.getNotificationTimeSuggestions(),
    staleTime: 300000, // 5 dakika
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export function useUpcomingNotifications(filters?: { hours?: number; limit?: number }) {
  return useQuery({
    queryKey: ['upcomingNotifications', filters],
    queryFn: () => scheduledNotificationApi.getUpcomingNotifications(filters),
    staleTime: 30000,
    retry: 2,
    refetchInterval: 60000, // Her dakika yenile
  })
}

// Notification Send hooks
export function useSentNotifications(filters?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['sentNotifications', filters],
    queryFn: () => notificationSendApi.getSentNotifications(filters),
    staleTime: 30000,
    retry: 2,
  })
}

export function useSendNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => notificationSendApi.sendNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentNotifications'] })
      queryClient.invalidateQueries({ queryKey: ['scheduledNotifications'] })
    },
  })
}

export function useSendTargetedNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => notificationSendApi.sendTargetedNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentNotifications'] })
      queryClient.invalidateQueries({ queryKey: ['scheduledNotifications'] })
    },
  })
}

// Notification Template hooks
export function useNotificationTemplates(filters?: {
  page?: number;
  limit?: number;
  type?: string;
  isActive?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: ['notificationTemplates', filters],
    queryFn: () => notificationTemplateApi.getNotificationTemplates(filters),
    staleTime: 60000,
    retry: 2,
  })
}

export function useNotificationTemplate(id: string) {
  return useQuery({
    queryKey: ['notificationTemplates', id],
    queryFn: () => notificationTemplateApi.getNotificationTemplateById(id),
    enabled: !!id,
    retry: 2,
  })
}

export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => notificationTemplateApi.createNotificationTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationTemplates'] })
    },
  })
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      notificationTemplateApi.updateNotificationTemplate(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['notificationTemplates', variables.id], data)
      queryClient.invalidateQueries({ queryKey: ['notificationTemplates'] })
    },
  })
}

export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationTemplateApi.deleteNotificationTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationTemplates'] })
    },
  })
}

export function useDefaultNotificationTemplates() {
  return useQuery({
    queryKey: ['defaultNotificationTemplates'],
    queryFn: () => notificationTemplateApi.getDefaultTemplates(),
    staleTime: 300000, // 5 dakika
    retry: 2,
  })
}

export function useTargetGroups() {
  return useQuery({
    queryKey: ['targetGroups'],
    queryFn: () => notificationSendApi.getTargetGroups(),
    staleTime: 60000, // 1 dakika
    retry: 2,
  })
}

// Notification Log hooks
export function useNotificationLogs(filters?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
  dateRange?: { start: Date; end: Date };
}) {
  return useQuery({
    queryKey: ['notificationLogs', filters],
    queryFn: () => notificationLogApi.getNotificationLogs(filters),
    staleTime: 30000, // 30 saniye
    retry: 2,
  })
}

export function useNotificationLogAnalytics(filters?: {
  dateRange?: { start: Date; end: Date };
}) {
  return useQuery({
    queryKey: ['notificationLogAnalytics', filters],
    queryFn: () => notificationLogApi.getNotificationLogAnalytics(filters),
    staleTime: 60000, // 1 dakika
    retry: 2,
  })
}

export function useNotificationLogStats() {
  return useQuery({
    queryKey: ['notificationLogStats'],
    queryFn: () => notificationLogApi.getNotificationLogStats(),
    staleTime: 300000, // 5 dakika
    retry: 2,
  })
}

// Product hooks
export function useProducts(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.getProducts(filters),
    staleTime: 60000, // 1 dakika
    retry: 2,
  })
}

export function useProductById(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductById(id),
    staleTime: 300000, // 5 dakika
    retry: 2,
    enabled: !!id,
  })
}

export function useProductAnalytics(filters?: {
  timeFilter?: string;
}) {
  return useQuery({
    queryKey: ['productAnalytics', filters],
    queryFn: () => productApi.getProductAnalytics(filters),
    staleTime: 300000, // 5 dakika
    retry: 2
  })
}

// Ads hooks
export function useAds(filters?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  placement?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['ads', filters],
    queryFn: () => fetch(`/api/ads?${new URLSearchParams(filters as any).toString()}`).then(res => res.json()),
    staleTime: 30000,
    retry: 2,
  })
}

export function useAd(id: string) {
  return useQuery({
    queryKey: ['ads', id],
    queryFn: () => fetch(`/api/ads/${id}`).then(res => res.json()),
    enabled: !!id,
    retry: 2,
  })
}

export function useCreateAd() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] })
      queryClient.invalidateQueries({ queryKey: ['adAnalytics'] })
    },
  })
}

export function useUpdateAd() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fetch(`/api/ads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['ads', variables.id], data)
      queryClient.invalidateQueries({ queryKey: ['ads'] })
      queryClient.invalidateQueries({ queryKey: ['adAnalytics'] })
    },
  })
}

export function useDeleteAd() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fetch(`/api/ads/${id}`, {
      method: 'DELETE'
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] })
      queryClient.invalidateQueries({ queryKey: ['adAnalytics'] })
    },
  })
}

export function useAdAnalytics() {
  return useQuery({
    queryKey: ['adAnalytics'],
    queryFn: () => fetch('/api/ads/analytics').then(res => res.json()),
    staleTime: 60000, // 1 dakika
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export function useAdSuggestions() {
  return useQuery({
    queryKey: ['adSuggestions'],
    queryFn: () => fetch('/api/ads/suggestions').then(res => res.json()),
    staleTime: 300000, // 5 dakika
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export function useProductSuggestions() {
  return useQuery({
    queryKey: ['productSuggestions'],
    queryFn: () => productApi.getProductSuggestions(),
    staleTime: 300000, // 5 dakika
    retry: 2
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => productApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['productAnalytics'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productApi.updateProduct(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['product', variables.id], data)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['productAnalytics'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['productAnalytics'] })
    },
  })
}

// Billing Logs hooks
export function useBillingLogs(filters?: {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  paymentMethod?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: ['billingLogs', filters],
    queryFn: () => {
      const params = new URLSearchParams()
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.status) params.append('status', filters.status)
      if (filters?.userId) params.append('userId', filters.userId)
      if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.append('dateTo', filters.dateTo)

      return fetch(`/api/billing/logs?${params.toString()}`).then(res => res.json())
    },
    staleTime: 30000, // 30 saniye
    retry: 2,
  })
}

export function useBillingLog(id: string) {
  return useQuery({
    queryKey: ['billingLogs', id],
    queryFn: () => fetch(`/api/billing/logs/${id}`).then(res => res.json()),
    enabled: !!id,
    retry: 2,
  })
}

export function useBillingAnalytics(filters?: {
  days?: number;
  period?: 'day' | 'week' | 'month' | 'year';
}) {
  return useQuery({
    queryKey: ['billingAnalytics', filters],
    queryFn: () => {
      const params = new URLSearchParams()
      if (filters?.days) params.append('days', filters.days.toString())
      if (filters?.period) params.append('period', filters.period)

      return fetch(`/api/billing/logs/analytics?${params.toString()}`).then(res => res.json())
    },
    staleTime: 300000, // 5 dakika
    retry: 2,
  })
}

export function useBillingAnalyze() {
  return useQuery({
    queryKey: ['billingAnalyze'],
    queryFn: () => fetch('/api/billing/logs/analyze').then(res => res.json()),
    staleTime: 300000, // 5 dakika
    retry: 2,
  })
}

export function useCreateBillingLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) =>
      fetch('/api/billing/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingLogs'] })
      queryClient.invalidateQueries({ queryKey: ['billingAnalytics'] })
    },
  })
}

export function useUpdateBillingLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fetch(`/api/billing/logs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['billingLogs', variables.id], data)
      queryClient.invalidateQueries({ queryKey: ['billingLogs'] })
      queryClient.invalidateQueries({ queryKey: ['billingAnalytics'] })
    },
  })
}

export function useDeleteBillingLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/billing/logs/${id}`, { method: 'DELETE' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingLogs'] })
      queryClient.invalidateQueries({ queryKey: ['billingAnalytics'] })
    },
  })
}

// Subscribers hooks
export function useSubscribers(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  plan?: string;
}) {
  return useQuery({
    queryKey: ['subscribers', filters],
    queryFn: () => {
      const params = new URLSearchParams()
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.search) params.append('search', filters.search)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.plan) params.append('plan', filters.plan)

      return fetch(`/api/billing/subscribers?${params.toString()}`).then(res => res.json())
    },
    staleTime: 30000, // 30 seconds
    retry: 2,
  })
}

export function useSubscriberAnalytics() {
  return useQuery({
    queryKey: ['subscriberAnalytics'],
    queryFn: () => fetch('/api/billing/subscribers/analytics').then(res => res.json()),
    staleTime: 300000, // 5 minutes
    retry: 2,
  })
}
// Subscription hooks
export function useSubscriptions(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  userId?: string;
}) {
  return useQuery({
    queryKey: ['subscriptions', filters],
    queryFn: () => subscriptionApi.getSubscriptions(filters),
    staleTime: 60000, // 1 dakika
    retry: 2,
  })
}

export function useSubscriptionById(id: string) {
  return useQuery({
    queryKey: ['subscription', id],
    queryFn: () => subscriptionApi.getSubscriptionById(id),
    staleTime: 300000, // 5 dakika
    retry: 2,
    enabled: !!id,
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => subscriptionApi.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['productAnalytics'] })
    },
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      subscriptionApi.updateSubscription(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['subscription', variables.id], data)
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['productAnalytics'] })
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => subscriptionApi.cancelSubscription(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(['subscription', id], data)
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['productAnalytics'] })
    },
  })
}

export function useSubscriptionAnalytics(filters?: {
  timeFilter?: string;
}) {
  return useQuery({
    queryKey: ['subscriptionAnalytics', filters],
    queryFn: () => subscriptionApi.getSubscriptionAnalytics(filters),
    staleTime: 300000, // 5 dakika
    retry: 2,
  })
}

// DATA ACTIVITY
export function useDataActivity(filters?: {
  timeFilter?: string;
  userId?: string;
  limit?: number;
  page?: number;
  dateRange?: { start: Date; end: Date };
}) {
  return useQuery({
    queryKey: ['dataActivity', filters],
    queryFn: () => dataActivityApi.getActivityAnalytics({
      timeFilter: filters?.timeFilter,
      userId: filters?.userId,
      limit: filters?.limit
    }),
    staleTime: 30000, // 30 saniye
    retry: 2,
    refetchOnWindowFocus: false,
  })
}
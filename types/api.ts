// API response types

export interface DashboardStats {
    users:{
        total: number
        active: number
        premium: number
        banned: number
    },
    messages:{
        total: number
        replied: number
        pending: number
        read: number
    },
    tasks:{
        active: number
        completed: number
        expired: number
        total: number
    }
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

export interface StatisticData{
    keyMetrics: {
        title: string
        value: string
        change: string
        icon: string
        trend: 'up' | 'down'
        color: string
    }[]
    userGrowthData: {
        month: string
        users: number
    }[]
    revenueData: {
        month: string
        revenue: number
        transactions: number
    }[]
    taskCompletionData: {
        date: string
        completed: number
        total: number
        completionRate: number
    }[] 
    popularCategories: {
        count: number
        name: string
    }[]
    topUsers: {
        avatar: string
        email: string
        id: string
        isPremium: boolean
        name: string
        streak: number
        _count:{
            tasks: number
        }
    }[]
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

export interface BlockedIP {
    id: string
    ip: string
    reason: string
    location?: string
    attempts: number
    status: 'active' | 'temporary' | 'permanent'
    blockedBy: string
    blockedDate: string
}

export interface BlockedIPsResponse {
    ips: BlockedIP[]
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

export interface BlockedIpRequest {
    id: string
    ip: string
    reason: string
    location?: string
    attempts: number
    status: 'active' | 'temporary' | 'permanent'
}

export interface CreateBlockedIPData {
    ip: string
    reason: string
    location?: string
    attempts?: number
    status: 'active' | 'temporary' | 'permanent'
    blockedBy?: string
}

export interface UpdateBlockedIPData {
    ip?: string
    reason?: string
    location?: string
    attempts?: number
    status?: 'active' | 'temporary' | 'permanent'
}
// types/api.ts

export interface RelapseData {
    id?: string
    userId: string
    trigger?: string | null
    mood?: string | null
    notes?: string | null
    severity: 'low' | 'medium' | 'high'
    previousStreak?: number
    time?: string | Date | null
    date?: string | Date
    recovery?: string | null
    createdAt?: string
    updatedAt?: string
    user?: {
      name: string
      email: string
    }
  }
  
  export interface RelapseFilters {
    timeFilter?: 'all' | 'today' | 'week' | 'month'
    severityFilter?: 'all' | 'low' | 'medium' | 'high'
    page?: number
    limit?: number
    userId?: string
  }
  
  export interface RelapseResponse {
    data: RelapseData[]
    pagination: {
      total: number
      page: number
      pages: number
      limit: number
    }
  }
  
  export interface TriggerStat {
    trigger: string
    count: number
    percentage: string
  }
  
  export interface RelapseStats {
    today: number
    week: number
    month: number
    averageStreak: number
    triggerStats: TriggerStat[]
  }
  
  export interface ApiError {
    message: string
    status?: number
    code?: string
  }
  

// Data activity types 

export interface UserActivity {
    id: string;
    username: string;
    lastSeen: string;
    sessionDuration: string;
    device: string;
    location: string;
    actions: string[];
    status: 'online' | 'away' | 'offline';
  }
  
  export interface ActivityStats {
    onlineUsers: number;
    dailyActiveUsers: number;
    averageSessionDuration: string;
    engagementRate: number;
    dailyActiveUsersChange: string;
    sessionDurationChange: string;
  }
  
  export interface DeviceStats {
    device: string;
    count: number;
    percentage: number;
  }
  
  export interface ActivityInsight {
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    description: string;
    color: 'blue' | 'green' | 'yellow' | 'red';
  }
  
  export interface ActivityAnalytics {
    stats: ActivityStats;
    deviceStats: DeviceStats[];
    recentActivities: UserActivity[];
    insights: ActivityInsight[];
    totalUsers: number;
    peakHours: string;
  }
  
  export interface ActivityFilters {
    timeFilter?: string;
    deviceFilter?: string;
    userId?: string;
    limit?: number;
    page?: number;
    dateRange?: {
      start: Date;
      end: Date;
    };
  }
  
  export interface ActivityApiFilters {
    timeFilter?: string;
    userId?: string;
    limit?: number;
  }
  
  export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
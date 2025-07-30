/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../prisma";
import { BaseService, ValidationResult } from "./base.service";
import { Activity } from "../generated/prisma";
import {
    ActivityAnalytics,
    ActivityStats,
    DeviceStats,
    UserActivity,
    ActivityInsight
} from "@/types/api";

interface ActivityFilters {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    userId?: string;
    type?: string;
    dateFrom?: Date;
    dateTo?: Date;
    timeFilter?: string;
}

export class ActivityAnalyticsService extends BaseService<Activity, any, any, ActivityFilters> {
    protected modelName = 'Activity';
    protected model = prisma.activity;
    protected defaultIncludes = {
        user: {
            select: {
                name: true,
                email: true
            }
        }
    };
    protected searchFields = ['type', 'message', 'details'];
    protected sortableFields = ['timestamp', 'type', 'userId'];

    protected async validateCreate(data: any): Promise<ValidationResult> {
        return { success: true, data };
    }

    protected async validateUpdate(data: any): Promise<ValidationResult> {
        return { success: true, data };
    }

    protected transformCreateData(data: any): any {
        return data;
    }

    protected transformUpdateData(data: any): any {
        return data;
    }

    protected buildWhereClause(filters: ActivityFilters): any {
        const where = super.buildWhereClause(filters);

        if (filters.userId) {
            where.userId = filters.userId;
        }

        if (filters.type) {
            where.type = filters.type;
        }

        if (filters.dateFrom || filters.dateTo) {
            where.timestamp = {};
            if (filters.dateFrom) {
                where.timestamp.gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.timestamp.lte = filters.dateTo;
            }
        }

        return where;
    }

    // Analytics methods
    static async getActivityAnalytics(filters: ActivityFilters = {}): Promise<ActivityAnalytics> {
        const service = new ActivityAnalyticsService();

        try {
            const [
                stats,
                deviceStats,
                recentActivities,
                insights,
                totalUsers,
                peakHours
            ] = await Promise.all([
                service.calculateActivityStats(filters),
                service.calculateDeviceStats(filters),
                service.getRecentActivities(filters),
                service.generateInsights(filters),
                service.getTotalUsersCount(),
                service.calculatePeakHours()
            ]);

            return {
                stats,
                deviceStats,
                recentActivities,
                insights,
                totalUsers,
                peakHours
            };
        } catch (error) {
            console.error('Error fetching activity analytics:', error);
            throw new Error('Failed to fetch activity analytics');
        }
    }

    private async calculateActivityStats(filters: ActivityFilters): Promise<ActivityStats> {
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Calculate online users (active in last hour)
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const onlineUsers = await prisma.activity.findMany({
            where: {
                timestamp: { gte: oneHourAgo }
            },
            select: { userId: true },
            distinct: ['userId']
        });

        // Calculate daily active users
        const dailyActiveUsers = await prisma.activity.findMany({
            where: {
                timestamp: { gte: today }
            },
            select: { userId: true },
            distinct: ['userId']
        });

        // Calculate yesterday's active users for comparison
        const yesterdayActiveUsers = await prisma.activity.findMany({
            where: {
                timestamp: {
                    gte: yesterday,
                    lt: today
                }
            },
            select: { userId: true },
            distinct: ['userId']
        });

        // Calculate average session duration from user sessions
        const sessions = await prisma.userSession.findMany({
            where: {
                createdAt: { gte: weekAgo }
            },
            include: {
                user: true
            }
        });

        // Group sessions by user to calculate average duration
        const userSessions = sessions.reduce((acc, session) => {
            if (!acc[session.userId]) {
                acc[session.userId] = [];
            }
            acc[session.userId].push(session.createdAt);
            return acc;
        }, {} as Record<string, Date[]>);

        let totalDuration = 0;
        let sessionCount = 0;

        Object.values(userSessions).forEach(userSessionTimes => {
            if (userSessionTimes.length > 1) {
                userSessionTimes.sort((a, b) => a.getTime() - b.getTime());
                for (let i = 1; i < userSessionTimes.length; i++) {
                    const duration = userSessionTimes[i].getTime() - userSessionTimes[i - 1].getTime();
                    if (duration < 4 * 60 * 60 * 1000) { // Less than 4 hours (reasonable session)
                        totalDuration += duration;
                        sessionCount++;
                    }
                }
            }
        });

        const averageSessionMinutes = sessionCount > 0 ? Math.round(totalDuration / sessionCount / 60000) : 25;
        const averageSessionDuration = `${averageSessionMinutes} dk`;

        // Calculate engagement rate (users who returned within 7 days)
        const weeklyActiveUsers = await prisma.activity.findMany({
            where: {
                timestamp: { gte: weekAgo }
            },
            select: { userId: true },
            distinct: ['userId']
        });

        const engagementRate = weeklyActiveUsers.length > 0
            ? Math.round((dailyActiveUsers.length / weeklyActiveUsers.length) * 100)
            : 0;

        // Calculate changes
        const dailyChange = yesterdayActiveUsers.length > 0
            ? Math.round(((dailyActiveUsers.length - yesterdayActiveUsers.length) / yesterdayActiveUsers.length) * 100)
            : 0;

        const dailyActiveUsersChange = dailyChange >= 0 ? `+${dailyChange}%` : `${dailyChange}%`;
        const sessionDurationChange = '+5 dk'; // Mock data for session duration change

        return {
            onlineUsers: onlineUsers.length,
            dailyActiveUsers: dailyActiveUsers.length,
            averageSessionDuration,
            engagementRate,
            dailyActiveUsersChange,
            sessionDurationChange
        };
    }

    private async calculateDeviceStats(filters: ActivityFilters): Promise<DeviceStats[]> {
        const timeFilter = this.getTimeFilterDate(filters.timeFilter);

        const sessions = await prisma.userSession.findMany({
            where: {
                createdAt: { gte: timeFilter }
            },
            select: {
                deviceType: true
            }
        });

        const deviceCounts = sessions.reduce((acc, session) => {
            const deviceType = this.normalizeDeviceType(session.deviceType);
            acc[deviceType] = (acc[deviceType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const total = sessions.length;

        return Object.entries(deviceCounts).map(([device, count]) => ({
            device,
            count,
            percentage: total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0
        })).sort((a, b) => b.count - a.count);
    }

    private async getRecentActivities(filters: ActivityFilters): Promise<UserActivity[]> {
        const limit = filters.limit || 50;
        const timeFilter = this.getTimeFilterDate(filters.timeFilter);

        const activities = await prisma.activity.findMany({
            where: {
                timestamp: { gte: timeFilter },
                ...(filters.userId && { userId: filters.userId })
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        lastActivity: true
                    }
                }
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: limit
        });

        // Get user sessions for device info
        const userIds = activities.map(a => a.userId).filter(Boolean) as string[];
        const sessions = await prisma.userSession.findMany({
            where: {
                userId: { in: userIds },
                createdAt: { gte: timeFilter }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const userSessionMap = sessions.reduce((acc, session) => {
            if (!acc[session.userId]) {
                acc[session.userId] = session;
            }
            return acc;
        }, {} as Record<string, any>);

        return activities.map(activity => {
            const session = activity.userId ? userSessionMap[activity.userId] : null;
            const lastSeen = this.formatLastSeen(activity.timestamp);
            const sessionDuration = this.calculateSessionDuration(activity.timestamp);
            const status = this.determineUserStatus(activity.timestamp);

            return {
                id: activity.id,
                username: activity.user?.name || 'Bilinmeyen Kullanıcı',
                lastSeen,
                sessionDuration,
                device: session?.deviceType || 'Bilinmeyen Cihaz',
                location: 'Türkiye', // Mock location data
                actions: [activity.message, activity.details].filter(Boolean),
                status
            };
        });
    }

    private async generateInsights(filters: ActivityFilters): Promise<ActivityInsight[]> {
        const insights: ActivityInsight[] = [];

        // Peak hours insight
        const peakHours = await this.calculatePeakHours();
        insights.push({
            type: 'info',
            title: 'Yoğun Saatler',
            description: `En yoğun kullanım saatleri: ${peakHours}. Bu saatlerde özel içerik sunulabilir.`,
            color: 'blue'
        });

        // Device usage insight
        const deviceStats = await this.calculateDeviceStats(filters);
        const mobilePercentage = deviceStats.find(d => d.device === 'Mobile')?.percentage || 0;

        if (mobilePercentage > 60) {
            insights.push({
                type: 'success',
                title: 'Mobil Odaklı',
                description: `Kullanıcıların %${mobilePercentage}'i mobil cihaz kullanıyor. Mobil deneyim öncelikli olmalı.`,
                color: 'green'
            });
        }

        // Engagement insight
        const stats = await this.calculateActivityStats(filters);
        if (stats.engagementRate > 70) {
            insights.push({
                type: 'success',
                title: 'Yüksek Engagement',
                description: `%${stats.engagementRate} engagement oranı ile kullanıcı etkileşimi oldukça yüksek.`,
                color: 'green'
            });
        } else if (stats.engagementRate < 50) {
            insights.push({
                type: 'warning',
                title: 'Engagement Artırma',
                description: `%${stats.engagementRate} engagement oranı. Daha fazla etkileşimli içerik eklenebilir.`,
                color: 'yellow'
            });
        }

        return insights;
    }

    private async getTotalUsersCount(): Promise<number> {
        return await prisma.user.count();
    }

    private async calculatePeakHours(): Promise<string> {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const activities = await prisma.activity.findMany({
            where: {
                timestamp: { gte: weekAgo }
            },
            select: {
                timestamp: true
            }
        });

        const hourCounts = activities.reduce((acc, activity) => {
            const hour = activity.timestamp.getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        const sortedHours = Object.entries(hourCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2);

        if (sortedHours.length >= 2) {
            const [hour1] = sortedHours[0];
            const [hour2] = sortedHours[1];
            return `${hour1}:00-${hour2}:00`;
        }

        return '20:00-22:00'; // Default peak hours
    }

    // Helper methods
    private getTimeFilterDate(timeFilter?: string): Date {
        const now = new Date();

        switch (timeFilter) {
            case '1h':
                return new Date(now.getTime() - 60 * 60 * 1000);
            case '24h':
                return new Date(now.getTime() - 24 * 60 * 60 * 1000);
            case '7d':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '30d':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            default:
                return new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to 24h
        }
    }

    private normalizeDeviceType(deviceType: string): string {
        const device = deviceType.toLowerCase();

        if (device.includes('iphone') || device.includes('android') || device.includes('mobile')) {
            return 'Mobile';
        } else if (device.includes('ipad') || device.includes('tablet')) {
            return 'Tablet';
        } else {
            return 'Desktop';
        }
    }

    private formatLastSeen(timestamp: Date): string {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Şimdi';
        if (minutes < 60) return `${minutes} dakika önce`;
        if (hours < 24) return `${hours} saat önce`;
        if (days < 7) return `${days} gün önce`;

        return timestamp.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    private calculateSessionDuration(timestamp: Date): string {
        // Mock session duration calculation
        // In a real implementation, you would track session start/end times
        const randomMinutes = Math.floor(Math.random() * 60) + 10; // 10-70 minutes
        return `${randomMinutes} dakika`;
    }

    private determineUserStatus(timestamp: Date): 'online' | 'away' | 'offline' {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 5) return 'online';
        if (minutes < 30) return 'away';
        return 'offline';
    }

    // Legacy methods for backward compatibility
    static async getActivities(filters: ActivityFilters = {}) {
        const service = new ActivityAnalyticsService();
        const result = await service.list(filters);

        return {
            data: result.data,
            pagination: {
                total: result.pagination.total,
                page: result.pagination.page,
                pages: result.pagination.totalPages,
                limit: result.pagination.limit
            }
        };
    }

    static async getActivityById(id: string) {
        const service = new ActivityAnalyticsService();
        return service.getById(id);
    }

    static async getActivityStats(filters: ActivityFilters = {}) {
        const service = new ActivityAnalyticsService();
        const baseWhere = service.buildWhereClause(filters);

        try {
            const [
                totalActivities,
                uniqueUsers,
                todayActivities,
                weekActivities
            ] = await Promise.all([
                prisma.activity.count({ where: baseWhere }),
                service.getUniqueUsersCount(baseWhere),
                service.getTodayActivitiesCount(baseWhere),
                service.getWeekActivitiesCount(baseWhere)
            ]);

            return {
                total: totalActivities,
                uniqueUsers,
                today: todayActivities,
                week: weekActivities
            };
        } catch (error) {
            console.error('Error fetching activity stats:', error);
            throw new Error('Failed to fetch activity statistics');
        }
    }

    private async getUniqueUsersCount(baseWhere: any): Promise<number> {
        const result = await prisma.activity.findMany({
            where: baseWhere,
            select: { userId: true },
            distinct: ['userId']
        });

        return result.length;
    }

    private async getTodayActivitiesCount(baseWhere: any): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return prisma.activity.count({
            where: {
                ...baseWhere,
                timestamp: { gte: today }
            }
        });
    }

    private async getWeekActivitiesCount(baseWhere: any): Promise<number> {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        return prisma.activity.count({
            where: {
                ...baseWhere,
                timestamp: { gte: weekAgo }
            }
        });
    }

    // Activity trends
    static async getActivityTrends(days: number = 30) {
        const data = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const [totalActivities, uniqueUsers] = await Promise.all([
                prisma.activity.count({
                    where: {
                        timestamp: {
                            gte: date,
                            lt: nextDate
                        }
                    }
                }),
                prisma.activity.findMany({
                    where: {
                        timestamp: {
                            gte: date,
                            lt: nextDate
                        }
                    },
                    select: { userId: true },
                    distinct: ['userId']
                }).then(users => users.length)
            ]);

            data.push({
                date: date.toISOString().split('T')[0],
                activities: totalActivities,
                users: uniqueUsers
            });
        }

        return data;
    }
}
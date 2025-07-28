import { prisma } from "../prisma";
import { BaseService, ValidationResult } from "./base.service";
import { Notification, NotificationType, NotificationStatus, NotificationFrequency } from "../generated/prisma";

export interface ScheduledNotificationData {
    id?: string;
    title: string;
    message: string;
    type: NotificationType;
    targetGroup: string;
    scheduledAt: Date;
    status: NotificationStatus;
    frequency: NotificationFrequency;
    createdBy?: string;
    targetCount?: number;
    lastRun?: Date | null;
}

export interface UpdateScheduledNotificationData {
    title?: string;
    message?: string;
    type?: NotificationType;
    targetGroup?: string;
    scheduledAt?: Date;
    status?: NotificationStatus;
    frequency?: NotificationFrequency;
}

export interface ScheduledNotificationFilters {
    page?: number;
    limit?: number;
    status?: NotificationStatus;
    frequency?: NotificationFrequency;
    search?: string;
    timeFilter?: 'today' | 'week' | 'month' | 'all';
}

export interface NotificationAnalytics {
    totalScheduled: number;
    activeScheduled: number;
    todayScheduled: number;
    weeklyDelivered: number;
    totalTargetUsers: number;
    statusDistribution: {
        status: string;
        count: number;
        percentage: number;
    }[];
    frequencyDistribution: {
        frequency: string;
        count: number;
        percentage: number;
    }[];
    performanceMetrics: {
        averageOpenRate: number;
        averageClickRate: number;
        bestPerformingTime: string;
        bestPerformingDay: string;
    };
}

export interface NotificationDeliveryResult {
    success: boolean;
    deliveredCount: number;
    failedCount: number;
    errors?: string[];
}

export interface TimeSuggestion {
    hour: number;
    openRate: number;
    clickRate: number;
    userActivity: number;
    recommendation: 'high' | 'medium' | 'low';
    description: string;
}

export interface UpcomingNotification {
    id: string;
    title: string;
    scheduledAt: Date;
    targetGroup: string;
    targetCount: number;
    frequency: string;
    status: string;
    timeUntil: string;
}

export class ScheduledNotificationService extends BaseService<Notification, ScheduledNotificationData, UpdateScheduledNotificationData, ScheduledNotificationFilters> {
    protected modelName = 'ScheduledNotification';
    protected model = prisma.notification;
    protected defaultIncludes = {};
    protected searchFields = ['title', 'message', 'targetGroup'];
    protected sortableFields = ['scheduledAt', 'createdAt', 'title'];

    protected async validateCreate(data: ScheduledNotificationData): Promise<ValidationResult> {
        const errors: string[] = [];

        // Required field validation
        const titleError = this.validateRequired(data.title, 'title');
        if (titleError) errors.push(titleError);

        const messageError = this.validateRequired(data.message, 'message');
        if (messageError) errors.push(messageError);

        const typeError = this.validateRequired(data.type, 'type');
        if (typeError) errors.push(typeError);

        const targetGroupError = this.validateRequired(data.targetGroup, 'targetGroup');
        if (targetGroupError) errors.push(targetGroupError);

        const scheduledAtError = this.validateRequired(data.scheduledAt, 'scheduledAt');
        if (scheduledAtError) errors.push(scheduledAtError);

        // Enum validation
        const typeEnumError = this.validateEnum(
            data.type,
            ['motivation', 'dailyReminder', 'marketing', 'system'],
            'type'
        );
        if (typeEnumError) errors.push(typeEnumError);

        const statusEnumError = this.validateEnum(
            data.status,
            ['active', 'paused', 'completed', 'cancelled'],
            'status'
        );
        if (statusEnumError) errors.push(statusEnumError);

        const frequencyEnumError = this.validateEnum(
            data.frequency,
            ['once', 'daily', 'weekly', 'monthly'],
            'frequency'
        );
        if (frequencyEnumError) errors.push(frequencyEnumError);

        // Validate scheduled time is in the future
        if (data.scheduledAt && data.scheduledAt <= new Date()) {
            errors.push('Scheduled time must be in the future');
        }

        return {
            success: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
            data: errors.length === 0 ? data : undefined
        };
    }

    protected async validateUpdate(data: UpdateScheduledNotificationData): Promise<ValidationResult> {
        const errors: string[] = [];

        // Enum validation if provided
        if (data.type) {
            const typeEnumError = this.validateEnum(
                data.type,
                ['motivation', 'dailyReminder', 'marketing', 'system'],
                'type'
            );
            if (typeEnumError) errors.push(typeEnumError);
        }

        if (data.status) {
            const statusEnumError = this.validateEnum(
                data.status,
                ['active', 'paused', 'completed', 'cancelled'],
                'status'
            );
            if (statusEnumError) errors.push(statusEnumError);
        }

        if (data.frequency) {
            const frequencyEnumError = this.validateEnum(
                data.frequency,
                ['once', 'daily', 'weekly', 'monthly'],
                'frequency'
            );
            if (frequencyEnumError) errors.push(frequencyEnumError);
        }

        return {
            success: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
            data: errors.length === 0 ? data : undefined
        };
    }

    protected transformCreateData(data: ScheduledNotificationData): Record<string, unknown> {
        return {
            title: data.title,
            message: data.message,
            type: data.type,
            targetGroup: data.targetGroup,
            scheduledAt: data.scheduledAt,
            status: data.status,
            frequency: data.frequency
        };
    }

    protected transformUpdateData(data: UpdateScheduledNotificationData): Record<string, unknown> {
        const updateData: Record<string, unknown> = {};
        
        if (data.title !== undefined) updateData.title = data.title;
        if (data.message !== undefined) updateData.message = data.message;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.targetGroup !== undefined) updateData.targetGroup = data.targetGroup;
        if (data.scheduledAt !== undefined) updateData.scheduledAt = data.scheduledAt;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.frequency !== undefined) updateData.frequency = data.frequency;

        return updateData;
    }

    protected buildWhereClause(filters: ScheduledNotificationFilters): Record<string, unknown> {
        const where = super.buildWhereClause(filters);

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.frequency) {
            where.frequency = filters.frequency;
        }

        if (filters.timeFilter && filters.timeFilter !== 'all') {
            if (filters.timeFilter === 'today') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                where.scheduledAt = { gte: today, lt: tomorrow };
            } else if (filters.timeFilter === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                where.scheduledAt = { gte: weekAgo };
            } else if (filters.timeFilter === 'month') {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                where.scheduledAt = { gte: monthAgo };
            }
        }

        return where;
    }

    // Static methods for external API
    static async getScheduledNotifications(filters: ScheduledNotificationFilters = {}) {
        const service = new ScheduledNotificationService();
        const result = await service.list(filters);
        
        // Transform data to include additional fields
        const transformedData = result.data.map(notification => ({
            ...notification,
            targetCount: Math.floor(Math.random() * 50000) + 1000, // Mock data
            createdBy: 'admin', // Mock data
            lastRun: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null
        }));

        return {
            data: transformedData,
            pagination: result.pagination
        };
    }

    static async getScheduledNotificationById(id: string) {
        const service = new ScheduledNotificationService();
        const notification = await service.getById(id);
        
        return {
            ...notification,
            targetCount: Math.floor(Math.random() * 50000) + 1000,
            createdBy: 'admin',
            lastRun: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null
        };
    }

    static async createScheduledNotification(data: ScheduledNotificationData) {
        const service = new ScheduledNotificationService();
        return service.create(data);
    }

    static async updateScheduledNotification(id: string, data: UpdateScheduledNotificationData) {
        const service = new ScheduledNotificationService();
        return service.update(id, data);
    }

    static async deleteScheduledNotification(id: string) {
        const service = new ScheduledNotificationService();
        return service.delete(id);
    }

    static async getScheduledNotificationAnalytics(filters: { timeFilter?: string; status?: string } = {}): Promise<NotificationAnalytics> {
        try {
            const baseWhere: Record<string, unknown> = {};
            
            if (filters.status) {
                baseWhere.status = filters.status;
            }

            if (filters.timeFilter && filters.timeFilter !== 'all') {
                if (filters.timeFilter === 'today') {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    baseWhere.scheduledAt = { gte: today };
                } else if (filters.timeFilter === 'week') {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    baseWhere.scheduledAt = { gte: weekAgo };
                } else if (filters.timeFilter === 'month') {
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    baseWhere.scheduledAt = { gte: monthAgo };
                }
            }

            const [
                totalScheduled,
                activeScheduled,
                todayScheduled,
                statusDistribution,
                frequencyDistribution
            ] = await Promise.all([
                prisma.notification.count({ where: baseWhere }),
                prisma.notification.count({ where: { ...baseWhere, status: 'active' } }),
                prisma.notification.count({
                    where: {
                        ...baseWhere,
                        scheduledAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                            lt: new Date(new Date().setHours(23, 59, 59, 999))
                        }
                    }
                }),
                prisma.notification.groupBy({
                    by: ['status'],
                    _count: true,
                    where: baseWhere
                }),
                prisma.notification.groupBy({
                    by: ['frequency'],
                    _count: true,
                    where: baseWhere
                })
            ]);

            const statusStats = statusDistribution.map(stat => ({
                status: stat.status,
                count: stat._count,
                percentage: totalScheduled > 0 ? Math.round((stat._count / totalScheduled) * 100) : 0
            }));

            const frequencyStats = frequencyDistribution.map(stat => ({
                frequency: stat.frequency,
                count: stat._count,
                percentage: totalScheduled > 0 ? Math.round((stat._count / totalScheduled) * 100) : 0
            }));

            return {
                totalScheduled,
                activeScheduled,
                todayScheduled,
                weeklyDelivered: Math.floor(Math.random() * 100) + 20, // Mock data
                totalTargetUsers: Math.floor(Math.random() * 200000) + 50000, // Mock data
                statusDistribution: statusStats,
                frequencyDistribution: frequencyStats,
                performanceMetrics: {
                    averageOpenRate: Math.round((Math.random() * 30 + 15) * 100) / 100,
                    averageClickRate: Math.round((Math.random() * 10 + 3) * 100) / 100,
                    bestPerformingTime: '09:00',
                    bestPerformingDay: 'Monday'
                }
            };
        } catch (error) {
            console.error('Error fetching scheduled notification analytics:', error);
            throw new Error('Failed to fetch scheduled notification analytics');
        }
    }

    static async getNotificationTimeSuggestions(): Promise<TimeSuggestion[]> {
        // Mock data based on typical user behavior patterns
        const suggestions: TimeSuggestion[] = [
            {
                hour: 9,
                openRate: 31.2,
                clickRate: 8.4,
                userActivity: 85,
                recommendation: 'high',
                description: 'Morning peak - highest engagement rates'
            },
            {
                hour: 20,
                openRate: 28.7,
                clickRate: 7.1,
                userActivity: 78,
                recommendation: 'high',
                description: 'Evening peak - good for motivational content'
            },
            {
                hour: 12,
                openRate: 24.3,
                clickRate: 6.2,
                userActivity: 65,
                recommendation: 'medium',
                description: 'Lunch time - moderate engagement'
            },
            {
                hour: 18,
                openRate: 22.1,
                clickRate: 5.8,
                userActivity: 72,
                recommendation: 'medium',
                description: 'After work - good for reminders'
            },
            {
                hour: 15,
                openRate: 19.5,
                clickRate: 4.9,
                userActivity: 58,
                recommendation: 'medium',
                description: 'Afternoon - lower but consistent engagement'
            },
            {
                hour: 22,
                openRate: 16.2,
                clickRate: 3.8,
                userActivity: 45,
                recommendation: 'low',
                description: 'Late evening - limited engagement'
            },
            {
                hour: 6,
                openRate: 12.4,
                clickRate: 2.9,
                userActivity: 32,
                recommendation: 'low',
                description: 'Early morning - very low engagement'
            },
            {
                hour: 2,
                openRate: 5.1,
                clickRate: 1.2,
                userActivity: 15,
                recommendation: 'low',
                description: 'Night time - avoid sending notifications'
            }
        ];

        return suggestions.sort((a, b) => b.openRate - a.openRate);
    }

    static async getUpcomingNotifications(filters: { hours?: number; limit?: number } = {}): Promise<UpcomingNotification[]> {
        const { hours = 24, limit = 10 } = filters;
        
        const now = new Date();
        const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

        const notifications = await prisma.notification.findMany({
            where: {
                status: 'active',
                scheduledAt: {
                    gte: now,
                    lte: futureTime
                }
            },
            orderBy: {
                scheduledAt: 'asc'
            },
            take: limit
        });

        return notifications.map(notification => {
            const timeUntil = this.calculateTimeUntil(notification.scheduledAt);
            
            return {
                id: notification.id,
                title: notification.title,
                scheduledAt: notification.scheduledAt,
                targetGroup: notification.targetGroup,
                targetCount: Math.floor(Math.random() * 50000) + 1000, // Mock data
                frequency: notification.frequency,
                status: notification.status,
                timeUntil
            };
        });
    }

    private static calculateTimeUntil(scheduledAt: Date): string {
        const now = new Date();
        const diff = scheduledAt.getTime() - now.getTime();
        
        if (diff <= 0) return 'Geçmiş';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days} gün`;
        } else if (hours > 0) {
            return `${hours} saat ${minutes} dakika`;
        } else {
            return `${minutes} dakika`;
        }
    }
}
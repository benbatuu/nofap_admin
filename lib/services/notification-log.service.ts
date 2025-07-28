import { prisma } from "../prisma";
import { BaseService, ValidationResult } from "./base.service";
import { NotificationLog, NotificationType, NotificationLogStatus } from "../generated/prisma";

export interface NotificationLogFilters {
    page?: number;
    limit?: number;
    status?: NotificationLogStatus;
    type?: NotificationType;
    search?: string;
    dateRange?: { start: Date; end: Date };
    userId?: string;
    notificationId?: string;
}

export interface NotificationLogAnalytics {
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalClicked: number;
    totalFailed: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    averageDeliveryTime: number;
    topPerformingCampaigns: Array<{
        title: string;
        openRate: number;
        clickRate: number;
        totalSent: number;
    }>;
    hourlyPerformance: Array<{
        hour: number;
        openRate: number;
        clickRate: number;
    }>;
}

export interface NotificationLogStats {
    today: {
        sent: number;
        delivered: number;
        read: number;
        clicked: number;
        failed: number;
    };
    thisWeek: {
        sent: number;
        delivered: number;
        read: number;
        clicked: number;
        failed: number;
    };
    thisMonth: {
        sent: number;
        delivered: number;
        read: number;
        clicked: number;
        failed: number;
    };
}

export class NotificationLogService extends BaseService<NotificationLog, any, any, NotificationLogFilters> {
    protected modelName = 'NotificationLog';
    protected model = prisma.notificationLog;
    protected defaultIncludes = {
        notification: {
            select: {
                title: true,
                message: true,
                type: true,
                targetGroup: true
            }
        },
        user: {
            select: {
                name: true,
                email: true
            }
        }
    };
    protected searchFields = ['title', 'message'];
    protected sortableFields = ['sentAt', 'deliveredAt', 'readAt', 'clickedAt'];

    protected async validateCreate(data: any): Promise<ValidationResult> {
        // Not used for logs as they are created by the system
        return { success: true, data };
    }

    protected async validateUpdate(data: any): Promise<ValidationResult> {
        // Not used for logs as they are read-only
        return { success: true, data };
    }

    protected transformCreateData(data: any): Record<string, unknown> {
        return data;
    }

    protected transformUpdateData(data: any): Record<string, unknown> {
        return data;
    }

    protected buildWhereClause(filters: NotificationLogFilters): Record<string, unknown> {
        const where = super.buildWhereClause(filters);

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.type) {
            where.type = filters.type;
        }

        if (filters.userId) {
            where.userId = filters.userId;
        }

        if (filters.notificationId) {
            where.notificationId = filters.notificationId;
        }

        if (filters.dateRange) {
            where.sentAt = {
                gte: filters.dateRange.start,
                lte: filters.dateRange.end
            };
        }

        return where;
    }

    // Static methods for external API
    static async getNotificationLogs(filters: NotificationLogFilters = {}) {
        try {
            const { page = 1, limit = 10, status, type, search, dateRange, userId, notificationId } = filters;
            const skip = (page - 1) * limit;

            // Build where clause
            const where: any = {};
            if (status) where.status = status;
            if (type) where.type = type;
            if (userId) where.userId = userId;
            if (notificationId) where.notificationId = notificationId;
            if (dateRange) {
                where.sentAt = {
                    gte: dateRange.start,
                    lte: dateRange.end
                };
            }
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { message: { contains: search, mode: 'insensitive' } }
                ];
            }

            const [logs, total] = await Promise.all([
                prisma.notificationLog.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { sentAt: 'desc' },
                    include: {
                        notification: {
                            select: {
                                title: true,
                                message: true,
                                type: true,
                                targetGroup: true
                            }
                        },
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }),
                prisma.notificationLog.count({ where })
            ]);

            // Transform data to include analytics
            const transformedData = logs.map(log => ({
                id: log.id,
                title: log.title,
                message: log.message,
                type: log.type,
                status: log.status,
                sentAt: log.sentAt,
                deliveredAt: log.deliveredAt,
                readAt: log.readAt,
                clickedAt: log.clickedAt,
                errorMessage: log.errorMessage,
                notification: log.notification,
                user: log.user,
                // Mock analytics data for now
                totalSent: Math.floor(Math.random() * 50000) + 1000,
                delivered: Math.floor(Math.random() * 50000) + 1000,
                opened: Math.floor(Math.random() * 20000) + 500,
                clicked: Math.floor(Math.random() * 5000) + 100,
                targetGroup: log.notification?.targetGroup || 'Unknown',
                campaign: `${log.type}_${log.id.slice(-6)}`
            }));

            return {
                data: transformedData,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            console.error('Error fetching notification logs:', error);
            throw new Error('Failed to fetch notification logs');
        }
    }

    static async getNotificationLogAnalytics(filters?: NotificationLogFilters): Promise<NotificationLogAnalytics> {
        try {
            const where: any = {};
            if (filters?.dateRange) {
                where.sentAt = {
                    gte: filters.dateRange.start,
                    lte: filters.dateRange.end
                };
            }

            const [
                totalSent,
                totalDelivered,
                totalRead,
                totalClicked,
                totalFailed,
                topCampaigns,
                hourlyStats
            ] = await Promise.all([
                prisma.notificationLog.count({ where }),
                prisma.notificationLog.count({ where: { ...where, status: 'delivered' } }),
                prisma.notificationLog.count({ where: { ...where, status: 'read' } }),
                prisma.notificationLog.count({ where: { ...where, status: 'clicked' } }),
                prisma.notificationLog.count({ where: { ...where, status: 'failed' } }),
                // Get top performing campaigns (mock data for now)
                Promise.resolve([
                    { title: 'Milestone Celebration', openRate: 74.2, clickRate: 18.9, totalSent: 1234 },
                    { title: 'Daily Motivation', openRate: 28.4, clickRate: 8.2, totalSent: 45231 },
                    { title: 'Premium Promotion', openRate: 21.1, clickRate: 4.2, totalSent: 42881 }
                ]),
                // Get hourly performance (mock data for now)
                Promise.resolve(Array.from({ length: 24 }, (_, i) => ({
                    hour: i,
                    openRate: Math.random() * 50 + 20,
                    clickRate: Math.random() * 15 + 5
                })))
            ]);

            const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
            const openRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;
            const clickRate = totalRead > 0 ? (totalClicked / totalRead) * 100 : 0;

            return {
                totalSent,
                totalDelivered,
                totalRead,
                totalClicked,
                totalFailed,
                deliveryRate: Math.round(deliveryRate * 100) / 100,
                openRate: Math.round(openRate * 100) / 100,
                clickRate: Math.round(clickRate * 100) / 100,
                averageDeliveryTime: 2.3, // Mock data
                topPerformingCampaigns: topCampaigns,
                hourlyPerformance: hourlyStats
            };
        } catch (error) {
            console.error('Error fetching notification log analytics:', error);
            throw new Error('Failed to fetch notification log analytics');
        }
    }

    static async getNotificationLogStats(): Promise<NotificationLogStats> {
        try {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(today.getFullYear(), now.getMonth(), 1);

            const [todayStats, weekStats, monthStats] = await Promise.all([
                this.getStatsForPeriod(today, now),
                this.getStatsForPeriod(weekAgo, now),
                this.getStatsForPeriod(monthAgo, now)
            ]);

            return {
                today: todayStats,
                thisWeek: weekStats,
                thisMonth: monthStats
            };
        } catch (error) {
            console.error('Error fetching notification log stats:', error);
            throw new Error('Failed to fetch notification log stats');
        }
    }

    private static async getStatsForPeriod(startDate: Date, endDate: Date) {
        const where = {
            sentAt: {
                gte: startDate,
                lte: endDate
            }
        };

        const [sent, delivered, read, clicked, failed] = await Promise.all([
            prisma.notificationLog.count({ where }),
            prisma.notificationLog.count({ where: { ...where, status: 'delivered' } }),
            prisma.notificationLog.count({ where: { ...where, status: 'read' } }),
            prisma.notificationLog.count({ where: { ...where, status: 'clicked' } }),
            prisma.notificationLog.count({ where: { ...where, status: 'failed' } })
        ]);

        return { sent, delivered, read, clicked, failed };
    }
} 
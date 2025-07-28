import { prisma } from "../prisma";
import { BaseService, ValidationResult } from "./base.service";
import { Activity } from "../generated/prisma";

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
}

interface ActivityAnalytics {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    engagementMetrics: {
        averageSessionDuration: number;
        pagesPerSession: number;
        bounceRate: number;
    };
    featureUsage: Array<{ feature: string; usage: number }>;
    retentionRates: Array<{ period: string; rate: number }>;
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
                dailyActiveUsers,
                weeklyActiveUsers,
                monthlyActiveUsers,
                engagementMetrics,
                featureUsage,
                retentionRates
            ] = await Promise.all([
                service.calculateDailyActiveUsers(),
                service.calculateWeeklyActiveUsers(),
                service.calculateMonthlyActiveUsers(),
                service.calculateEngagementMetrics(),
                service.getFeatureUsage(),
                service.calculateRetentionRates()
            ]);

            return {
                dailyActiveUsers,
                weeklyActiveUsers,
                monthlyActiveUsers,
                engagementMetrics,
                featureUsage,
                retentionRates
            };
        } catch (error) {
            console.error('Error fetching activity analytics:', error);
            throw new Error('Failed to fetch activity analytics');
        }
    }

    private async calculateDailyActiveUsers(): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = await prisma.activity.findMany({
            where: {
                timestamp: { gte: today }
            },
            select: { userId: true },
            distinct: ['userId']
        });

        return result.length;
    }

    private async calculateWeeklyActiveUsers(): Promise<number> {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        const result = await prisma.activity.findMany({
            where: {
                timestamp: { gte: weekAgo }
            },
            select: { userId: true },
            distinct: ['userId']
        });

        return result.length;
    }

    private async calculateMonthlyActiveUsers(): Promise<number> {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        monthAgo.setHours(0, 0, 0, 0);

        const result = await prisma.activity.findMany({
            where: {
                timestamp: { gte: monthAgo }
            },
            select: { userId: true },
            distinct: ['userId']
        });

        return result.length;
    }

    private async calculateEngagementMetrics(): Promise<{
        averageSessionDuration: number;
        pagesPerSession: number;
        bounceRate: number;
    }> {
        // For now, return mock data since we don't have session tracking
        // In a real implementation, you would calculate these from user session data
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const activities = await prisma.activity.findMany({
            where: {
                timestamp: { gte: weekAgo }
            },
            select: { userId: true, timestamp: true }
        });

        // Group activities by user and calculate basic metrics
        const userSessions = activities.reduce((acc, activity) => {
            if (!acc[activity.userId]) {
                acc[activity.userId] = [];
            }
            acc[activity.userId].push(activity.timestamp);
            return acc;
        }, {} as Record<string, Date[]>);

        const sessionData = Object.values(userSessions);
        const totalSessions = sessionData.length;

        if (totalSessions === 0) {
            return {
                averageSessionDuration: 0,
                pagesPerSession: 0,
                bounceRate: 0
            };
        }

        // Calculate average pages per session (activities per user)
        const totalPages = activities.length;
        const pagesPerSession = totalPages / totalSessions;

        // Calculate bounce rate (users with only 1 activity)
        const singleActivityUsers = sessionData.filter(sessions => sessions.length === 1).length;
        const bounceRate = (singleActivityUsers / totalSessions) * 100;

        return {
            averageSessionDuration: 15, // Mock: 15 minutes average
            pagesPerSession: Math.round(pagesPerSession * 10) / 10,
            bounceRate: Math.round(bounceRate * 10) / 10
        };
    }

    private async getFeatureUsage(): Promise<Array<{ feature: string; usage: number }>> {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const featureUsage = await prisma.activity.groupBy({
            by: ['type'],
            _count: true,
            where: {
                timestamp: { gte: weekAgo }
            },
            orderBy: {
                _count: {
                    type: 'desc'
                }
            },
            take: 10
        });

        return featureUsage.map(usage => ({
            feature: usage.type,
            usage: usage._count
        }));
    }

    private async calculateRetentionRates(): Promise<Array<{ period: string; rate: number }>> {
        const now = new Date();
        const periods = [
            { period: '1 day', days: 1 },
            { period: '7 days', days: 7 },
            { period: '30 days', days: 30 }
        ];

        const results = await Promise.all(
            periods.map(async ({ period, days }) => {
                const startDate = new Date(now);
                startDate.setDate(startDate.getDate() - days);

                const endDate = new Date(now);
                endDate.setDate(endDate.getDate() - days - 1);

                // Users who were active in the initial period
                const initialUsers = await prisma.activity.findMany({
                    where: {
                        timestamp: {
                            gte: endDate,
                            lt: startDate
                        }
                    },
                    select: { userId: true },
                    distinct: ['userId']
                });

                if (initialUsers.length === 0) {
                    return { period, rate: 0 };
                }

                // Users who returned after the period
                const returnedUsers = await prisma.activity.findMany({
                    where: {
                        userId: {
                            in: initialUsers.map(u => u.userId)
                        },
                        timestamp: { gte: startDate }
                    },
                    select: { userId: true },
                    distinct: ['userId']
                });

                const rate = (returnedUsers.length / initialUsers.length) * 100;

                return {
                    period,
                    rate: Math.round(rate * 10) / 10
                };
            })
        );

        return results;
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
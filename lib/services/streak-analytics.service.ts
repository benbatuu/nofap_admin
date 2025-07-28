import { prisma } from "../prisma";
import { BaseService, ValidationResult, PaginatedResponse } from "./base.service";
import { Streak } from "../generated/prisma";

interface StreakFilters {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    userId?: string;
    isActive?: boolean;
    minDays?: number;
    maxDays?: number;
}

interface StreakAnalytics {
    averageStreakLength: number;
    longestStreak: number;
    activeStreaks: number;
    streakDistribution: Array<{ range: string; count: number }>;
    successRates: Array<{ period: string; rate: number }>;
    streakTrends: Array<{ month: string; average: number }>;
}

export class StreakAnalyticsService extends BaseService<Streak, any, any, StreakFilters> {
    protected modelName = 'Streak';
    protected model = prisma.streak;
    protected defaultIncludes = {
        user: {
            select: {
                name: true,
                email: true
            }
        }
    };
    protected searchFields = [];
    protected sortableFields = ['startDate', 'endDate', 'currentDays', 'bestStreak', 'createdAt'];

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

    protected buildWhereClause(filters: StreakFilters): any {
        const where = super.buildWhereClause(filters);

        if (filters.userId) {
            where.userId = filters.userId;
        }

        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters.minDays !== undefined) {
            where.currentDays = { ...where.currentDays, gte: filters.minDays };
        }

        if (filters.maxDays !== undefined) {
            where.currentDays = { ...where.currentDays, lte: filters.maxDays };
        }

        return where;
    }

    // Analytics methods
    static async getStreakAnalytics(filters: StreakFilters = {}): Promise<StreakAnalytics> {
        const service = new StreakAnalyticsService();
        const baseWhere = service.buildWhereClause(filters);

        try {
            const [
                averageStreak,
                longestStreak,
                activeStreaks,
                streakDistribution,
                successRates,
                streakTrends
            ] = await Promise.all([
                service.calculateAverageStreakLength(baseWhere),
                service.findLongestStreak(baseWhere),
                service.countActiveStreaks(baseWhere),
                service.getStreakDistribution(baseWhere),
                service.calculateSuccessRates(baseWhere),
                service.getStreakTrends(baseWhere)
            ]);

            return {
                averageStreakLength: averageStreak,
                longestStreak,
                activeStreaks,
                streakDistribution,
                successRates,
                streakTrends
            };
        } catch (error) {
            console.error('Error fetching streak analytics:', error);
            throw new Error('Failed to fetch streak analytics');
        }
    }

    private async calculateAverageStreakLength(baseWhere: any): Promise<number> {
        const result = await prisma.streak.aggregate({
            _avg: { currentDays: true },
            where: baseWhere
        });

        return Math.round(result._avg.currentDays || 0);
    }

    private async findLongestStreak(baseWhere: any): Promise<number> {
        const result = await prisma.streak.aggregate({
            _max: { bestStreak: true },
            where: baseWhere
        });

        return result._max.bestStreak || 0;
    }

    private async countActiveStreaks(baseWhere: any): Promise<number> {
        return prisma.streak.count({
            where: {
                ...baseWhere,
                isActive: true
            }
        });
    }

    private async getStreakDistribution(baseWhere: any): Promise<Array<{ range: string; count: number }>> {
        const streaks = await prisma.streak.findMany({
            where: baseWhere,
            select: { currentDays: true }
        });

        const ranges = [
            { range: '1-7 days', min: 1, max: 7 },
            { range: '8-30 days', min: 8, max: 30 },
            { range: '31-90 days', min: 31, max: 90 },
            { range: '91-365 days', min: 91, max: 365 },
            { range: '365+ days', min: 365, max: Infinity }
        ];

        return ranges.map(range => ({
            range: range.range,
            count: streaks.filter(s => 
                s.currentDays >= range.min && 
                (range.max === Infinity ? true : s.currentDays <= range.max)
            ).length
        }));
    }

    private async calculateSuccessRates(baseWhere: any): Promise<Array<{ period: string; rate: number }>> {
        const now = new Date();
        const periods = [
            { period: 'Last 7 days', days: 7 },
            { period: 'Last 30 days', days: 30 },
            { period: 'Last 90 days', days: 90 }
        ];

        const results = await Promise.all(
            periods.map(async ({ period, days }) => {
                const startDate = new Date(now);
                startDate.setDate(startDate.getDate() - days);

                const [totalStreaks, successfulStreaks] = await Promise.all([
                    prisma.streak.count({
                        where: {
                            ...baseWhere,
                            startDate: { gte: startDate }
                        }
                    }),
                    prisma.streak.count({
                        where: {
                            ...baseWhere,
                            startDate: { gte: startDate },
                            currentDays: { gte: 7 } // Consider 7+ days as successful
                        }
                    })
                ]);

                const rate = totalStreaks > 0 ? (successfulStreaks / totalStreaks) * 100 : 0;

                return {
                    period,
                    rate: Math.round(rate * 10) / 10
                };
            })
        );

        return results;
    }

    private async getStreakTrends(baseWhere: any): Promise<Array<{ month: string; average: number }>> {
        const data = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

            const result = await prisma.streak.aggregate({
                _avg: { currentDays: true },
                where: {
                    ...baseWhere,
                    startDate: {
                        gte: date,
                        lt: nextDate
                    }
                }
            });

            data.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                average: Math.round((result._avg.currentDays || 0) * 10) / 10
            });
        }

        return data;
    }

    // Legacy methods for backward compatibility
    static async getStreaks(filters: StreakFilters = {}) {
        const service = new StreakAnalyticsService();
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

    static async getStreakById(id: string) {
        const service = new StreakAnalyticsService();
        return service.getById(id);
    }

    static async getStreakStats(filters: StreakFilters = {}) {
        const service = new StreakAnalyticsService();
        const baseWhere = service.buildWhereClause(filters);

        try {
            const [
                totalStreaks,
                activeStreaks,
                averageLength,
                longestStreak
            ] = await Promise.all([
                prisma.streak.count({ where: baseWhere }),
                prisma.streak.count({ 
                    where: { ...baseWhere, isActive: true } 
                }),
                service.calculateAverageStreakLength(baseWhere),
                service.findLongestStreak(baseWhere)
            ]);

            return {
                total: totalStreaks,
                active: activeStreaks,
                averageLength,
                longestStreak
            };
        } catch (error) {
            console.error('Error fetching streak stats:', error);
            throw new Error('Failed to fetch streak statistics');
        }
    }
}
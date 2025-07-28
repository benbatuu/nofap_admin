import { prisma } from "../prisma";
import { BaseService, ValidationResult } from "./base.service";
import { Streak } from "../generated/prisma";

interface StreakFilters {
    userId?: string;
    timeFilter?: 'all' | 'today' | 'week' | 'month';
    limit?: number;
}

interface StreakStats {
    activeStreaks: number;
    averageStreak: number;
    longestStreak: number;
    monthlyResets: number;
    weeklyGrowth: number;
    milestoneStats: {
        milestone: string;
        count: number;
        percentage: number;
    }[];
    topStreaks: {
        id: string;
        username: string;
        currentStreak: number;
        longestStreak: number;
        startDate: string;
        lastUpdate: string;
        status: string;
        milestones: string[];
    }[];
}

interface CreateStreakData {
    userId: string;
    startDate: Date;
    currentDays: number;
    bestStreak: number;
    isActive: boolean;
}

interface UpdateStreakData {
    endDate?: Date;
    currentDays?: number;
    bestStreak?: number;
    isActive?: boolean;
}

export class StreakService extends BaseService<Streak, CreateStreakData, UpdateStreakData, StreakFilters> {
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
    protected sortableFields = ['currentDays', 'bestStreak', 'startDate', 'createdAt'];

    protected async validateCreate(data: CreateStreakData): Promise<ValidationResult> {
        const errors: string[] = [];

        // Required field validation
        const userIdError = this.validateRequired(data.userId, 'userId');
        if (userIdError) errors.push(userIdError);

        const startDateError = this.validateRequired(data.startDate, 'startDate');
        if (startDateError) errors.push(startDateError);

        // Validate user exists
        if (data.userId) {
            const userExists = await prisma.user.findUnique({
                where: { id: data.userId }
            });
            if (!userExists) {
                errors.push('User not found');
            }
        }

        // Validate currentDays is non-negative
        if (data.currentDays < 0) {
            errors.push('Current days cannot be negative');
        }

        // Validate bestStreak is non-negative
        if (data.bestStreak < 0) {
            errors.push('Best streak cannot be negative');
        }

        return {
            success: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
            data: errors.length === 0 ? data : undefined
        };
    }

    protected async validateUpdate(data: UpdateStreakData): Promise<ValidationResult> {
        const errors: string[] = [];

        // Validate currentDays is non-negative
        if (data.currentDays !== undefined && data.currentDays < 0) {
            errors.push('Current days cannot be negative');
        }

        // Validate bestStreak is non-negative
        if (data.bestStreak !== undefined && data.bestStreak < 0) {
            errors.push('Best streak cannot be negative');
        }

        return {
            success: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
            data: errors.length === 0 ? data : undefined
        };
    }

    protected transformCreateData(data: CreateStreakData): Record<string, unknown> {
        return {
            userId: data.userId,
            startDate: data.startDate,
            currentDays: data.currentDays,
            bestStreak: data.bestStreak,
            isActive: data.isActive
        };
    }

    protected transformUpdateData(data: UpdateStreakData): Record<string, unknown> {
        const updateData: Record<string, unknown> = {};
        
        if (data.endDate !== undefined) updateData.endDate = data.endDate;
        if (data.currentDays !== undefined) updateData.currentDays = data.currentDays;
        if (data.bestStreak !== undefined) updateData.bestStreak = data.bestStreak;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        return updateData;
    }

    protected buildWhereClause(filters: StreakFilters): Record<string, unknown> {
        const where: Record<string, unknown> = {};

        if (filters.userId) {
            where.userId = filters.userId;
        }

        if (filters.timeFilter && filters.timeFilter !== 'all') {
            if (filters.timeFilter === 'today') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                where.createdAt = { gte: today };
            } else if (filters.timeFilter === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                where.createdAt = { gte: weekAgo };
            } else if (filters.timeFilter === 'month') {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                where.createdAt = { gte: monthAgo };
            }
        }

        return where;
    }

    static async getStreakAnalytics(filters: StreakFilters = {}): Promise<StreakStats> {
        try {
            const service = new StreakService();
            const baseWhere = service.buildWhereClause(filters);

            // Get basic stats
            const [
                activeStreaksCount,
                averageStreakData,
                longestStreakData,
                monthlyResetsCount,
                weeklyGrowthData
            ] = await Promise.all([
                // Active streaks count
                prisma.streak.count({
                    where: {
                        ...baseWhere,
                        isActive: true
                    }
                }),

                // Average streak
                prisma.streak.aggregate({
                    _avg: {
                        currentDays: true
                    },
                    where: {
                        ...baseWhere,
                        isActive: true
                    }
                }),

                // Longest streak
                prisma.streak.aggregate({
                    _max: {
                        bestStreak: true
                    },
                    where: baseWhere
                }),

                // Monthly resets (streaks that ended this month)
                prisma.streak.count({
                    where: {
                        ...baseWhere,
                        isActive: false,
                        endDate: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    }
                }),

                // Weekly growth (new streaks this week)
                prisma.streak.count({
                    where: {
                        ...baseWhere,
                        startDate: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                })
            ]);

            // Calculate milestone stats
            const milestoneStats = await service.calculateMilestoneStats(baseWhere);

            // Get top streaks
            const topStreaks = await service.getTopStreaks(filters.limit || 10, baseWhere);

            return {
                activeStreaks: activeStreaksCount,
                averageStreak: Math.round(averageStreakData._avg.currentDays || 0),
                longestStreak: longestStreakData._max.bestStreak || 0,
                monthlyResets: monthlyResetsCount,
                weeklyGrowth: weeklyGrowthData,
                milestoneStats,
                topStreaks
            };
        } catch (error) {
            console.error('Error fetching streak analytics:', error);
            throw new Error('Failed to fetch streak analytics');
        }
    }

    private async calculateMilestoneStats(baseWhere: Record<string, unknown>) {
        const milestones = [
            { days: 7, label: '7 gün' },
            { days: 30, label: '30 gün' },
            { days: 90, label: '90 gün' },
            { days: 365, label: '365 gün' }
        ];

        const totalStreaks = await prisma.streak.count({ where: baseWhere });

        const milestoneStats = await Promise.all(
            milestones.map(async (milestone) => {
                const count = await prisma.streak.count({
                    where: {
                        ...baseWhere,
                        OR: [
                            { currentDays: { gte: milestone.days } },
                            { bestStreak: { gte: milestone.days } }
                        ]
                    }
                });

                return {
                    milestone: milestone.label,
                    count,
                    percentage: totalStreaks > 0 ? Math.round((count / totalStreaks) * 100 * 10) / 10 : 0
                };
            })
        );

        return milestoneStats;
    }

    private async getTopStreaks(limit: number, baseWhere: Record<string, unknown>) {
        const streaks = await prisma.streak.findMany({
            where: baseWhere,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: [
                { currentDays: 'desc' },
                { bestStreak: 'desc' }
            ],
            take: limit
        });

        return streaks.map(streak => {
            const milestones = [];
            if (streak.currentDays >= 7 || streak.bestStreak >= 7) milestones.push('7 days');
            if (streak.currentDays >= 30 || streak.bestStreak >= 30) milestones.push('30 days');
            if (streak.currentDays >= 90 || streak.bestStreak >= 90) milestones.push('90 days');
            if (streak.currentDays >= 365 || streak.bestStreak >= 365) milestones.push('365 days');

            return {
                id: streak.id,
                username: streak.user?.name || 'Unknown User',
                currentStreak: streak.currentDays,
                longestStreak: streak.bestStreak,
                startDate: streak.startDate.toISOString().split('T')[0],
                lastUpdate: streak.createdAt.toISOString().split('T')[0],
                status: streak.isActive ? 'active' : 'reset',
                milestones
            };
        });
    }
}
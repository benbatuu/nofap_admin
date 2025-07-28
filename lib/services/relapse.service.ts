import { RelapseData, RelapseFilters, RelapseStats } from "@/types/api";
import { prisma } from "../prisma";
import { BaseService, ValidationResult } from "./base.service";
import { Relapse, RelapseSeverity } from "../generated/prisma";

interface CreateRelapseData {
    userId: string;
    trigger?: string;
    mood?: string;
    notes?: string;
    severity: RelapseSeverity;
    previousStreak?: number;
    time?: string;
    date?: Date;
    recovery?: string;
}

interface UpdateRelapseData {
    trigger?: string;
    mood?: string;
    notes?: string;
    severity?: RelapseSeverity;
    previousStreak?: number;
    time?: string;
    date?: Date;
    recovery?: string;
}

interface RelapseServiceFilters extends RelapseFilters {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export class RelapseService extends BaseService<Relapse, CreateRelapseData, UpdateRelapseData, RelapseServiceFilters> {
    protected modelName = 'Relapse';
    protected model = prisma.relapse;
    protected defaultIncludes = {
        user: {
            select: {
                name: true,
                email: true
            }
        }
    };
    protected searchFields = ['trigger', 'mood', 'notes', 'recovery'];
    protected sortableFields = ['date', 'severity', 'previousStreak', 'createdAt'];

    protected async validateCreate(data: CreateRelapseData): Promise<ValidationResult> {
        const errors: string[] = [];

        // Required field validation
        const userIdError = this.validateRequired(data.userId, 'userId');
        if (userIdError) errors.push(userIdError);

        const severityError = this.validateRequired(data.severity, 'severity');
        if (severityError) errors.push(severityError);

        // Enum validation
        const severityEnumError = this.validateEnum(
            data.severity, 
            ['low', 'medium', 'high'], 
            'severity'
        );
        if (severityEnumError) errors.push(severityEnumError);

        // Validate user exists
        if (data.userId) {
            const userExists = await prisma.user.findUnique({
                where: { id: data.userId }
            });
            if (!userExists) {
                errors.push('User not found');
            }
        }

        // Validate previousStreak is non-negative
        if (data.previousStreak !== undefined && data.previousStreak < 0) {
            errors.push('Previous streak cannot be negative');
        }

        return {
            success: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
            data: errors.length === 0 ? data : undefined
        };
    }

    protected async validateUpdate(data: UpdateRelapseData): Promise<ValidationResult> {
        const errors: string[] = [];

        // Enum validation if severity is provided
        if (data.severity) {
            const severityEnumError = this.validateEnum(
                data.severity, 
                ['low', 'medium', 'high'], 
                'severity'
            );
            if (severityEnumError) errors.push(severityEnumError);
        }

        // Validate previousStreak is non-negative
        if (data.previousStreak !== undefined && data.previousStreak < 0) {
            errors.push('Previous streak cannot be negative');
        }

        return {
            success: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
            data: errors.length === 0 ? data : undefined
        };
    }

    protected transformCreateData(data: CreateRelapseData): Record<string, unknown> {
        return {
            userId: data.userId,
            trigger: data.trigger || null,
            mood: data.mood || null,
            notes: data.notes || null,
            severity: data.severity,
            previousStreak: data.previousStreak || 0,
            time: data.time || null,
            date: data.date || new Date(),
            recovery: data.recovery || null
        };
    }

    protected transformUpdateData(data: UpdateRelapseData): Record<string, unknown> {
        const updateData: Record<string, unknown> = {};
        
        if (data.trigger !== undefined) updateData.trigger = data.trigger;
        if (data.mood !== undefined) updateData.mood = data.mood;
        if (data.notes !== undefined) updateData.notes = data.notes;
        if (data.severity !== undefined) updateData.severity = data.severity;
        if (data.previousStreak !== undefined) updateData.previousStreak = data.previousStreak;
        if (data.time !== undefined) updateData.time = data.time;
        if (data.date !== undefined) updateData.date = data.date;
        if (data.recovery !== undefined) updateData.recovery = data.recovery;

        return updateData;
    }

    protected buildWhereClause(filters: RelapseServiceFilters): Record<string, unknown> {
        const where = super.buildWhereClause(filters);

        // Add relapse-specific filters
        if (filters.severityFilter && filters.severityFilter !== 'all') {
            where.severity = filters.severityFilter;
        }

        if (filters.timeFilter && filters.timeFilter !== 'all') {
            if (filters.timeFilter === 'today') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                where.date = { gte: today };
            } else if (filters.timeFilter === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                where.date = { gte: weekAgo };
            } else if (filters.timeFilter === 'month') {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                where.date = { gte: monthAgo };
            }
        }

        if (filters.userId) {
            where.userId = filters.userId;
        }

        return where;
    }

    // Legacy methods for backward compatibility
    static async getRelapses(filters: RelapseFilters = {}) {
        const service = new RelapseService();
        
        // Convert legacy filters to new format
        const serviceFilters: RelapseServiceFilters = {
            page: filters.page || 1,
            limit: filters.limit || 10,
            timeFilter: filters.timeFilter,
            severityFilter: filters.severityFilter,
            userId: filters.userId
        };
        
        const result = await service.list(serviceFilters);
        
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

    static async getRelapseById(id: string) {
        const service = new RelapseService();
        return service.getById(id);
    }

    static async createRelapse(data: RelapseData) {
        const service = new RelapseService();
        const createData: CreateRelapseData = {
            userId: data.userId,
            trigger: data.trigger || undefined,
            mood: data.mood || undefined,
            notes: data.notes || undefined,
            severity: data.severity,
            previousStreak: data.previousStreak,
            time: data.time ? String(data.time) : undefined,
            date: data.date ? new Date(data.date) : undefined,
            recovery: data.recovery || undefined
        };
        return service.create(createData);
    }

    static async updateRelapse(id: string, data: Partial<RelapseData>) {
        const service = new RelapseService();
        const updateData: UpdateRelapseData = {
            trigger: data.trigger || undefined,
            mood: data.mood || undefined,
            notes: data.notes || undefined,
            severity: data.severity,
            previousStreak: data.previousStreak,
            time: data.time ? String(data.time) : undefined,
            date: data.date ? new Date(data.date) : undefined,
            recovery: data.recovery || undefined
        };
        return service.update(id, updateData);
    }

    static async deleteRelapse(id: string) {
        const service = new RelapseService();
        await service.delete(id);
        return { success: true };
    }



    static async getRelapseStats(filters: RelapseFilters = {}): Promise<RelapseStats> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - 6);
            
            const monthStart = new Date(today);
            monthStart.setMonth(today.getMonth() - 1);

            // Base where clause
            const baseWhere: Record<string, unknown> = {};
            
            if (filters.userId) {
                baseWhere.userId = filters.userId;
            }

            const [todayCount, weekCount, monthCount, averageStreak] = await Promise.all([
                prisma.relapse.count({
                    where: {
                        ...baseWhere,
                        date: { gte: today }
                    }
                }),
                prisma.relapse.count({
                    where: {
                        ...baseWhere,
                        date: { gte: weekStart }
                    }
                }),
                prisma.relapse.count({
                    where: {
                        ...baseWhere,
                        date: { gte: monthStart }
                    }
                }),
                prisma.relapse.aggregate({
                    _avg: {
                        previousStreak: true
                    },
                    where: baseWhere
                })
            ]);

            const triggerStats = await prisma.relapse.groupBy({
                by: ['trigger'],
                _count: true,
                where: { 
                    ...baseWhere,
                    trigger: { not: null }
                },
                orderBy: { _count: { trigger: 'desc' } },
                take: 5
            });

            const totalRelapses = await prisma.relapse.count({ where: baseWhere });

            const triggerStatsFormatted = triggerStats.map(stat => ({
                trigger: stat.trigger ?? '',
                count: stat._count,
                percentage: totalRelapses > 0 ? ((stat._count / totalRelapses) * 100).toFixed(2) + '%' : '0%'
            }));

            return {
                today: todayCount,
                week: weekCount,
                month: monthCount,
                averageStreak: averageStreak._avg.previousStreak || 0,
                triggerStats: triggerStatsFormatted
            };
        } catch (error) {
            console.error('Error fetching relapse stats:', error);
            throw new Error('Failed to fetch relapse statistics');
        }
    }

    // Analytics methods
    static async getRelapseAnalytics(filters: RelapseFilters = {}) {
        const service = new RelapseService();
        const baseWhere: Record<string, unknown> = service.buildWhereClause(filters as RelapseServiceFilters);

        try {
            const [
                totalRelapses,
                severityDistribution,
                monthlyTrends,
                commonTriggers,
                averageTimeBetween
            ] = await Promise.all([
                prisma.relapse.count({ where: baseWhere }),
                
                prisma.relapse.groupBy({
                    by: ['severity'],
                    _count: true,
                    where: baseWhere,
                    orderBy: { _count: { severity: 'desc' } }
                }),

                service.getMonthlyTrends(baseWhere),
                
                prisma.relapse.groupBy({
                    by: ['trigger'],
                    _count: true,
                    where: { 
                        ...baseWhere,
                        trigger: { not: null }
                    },
                    orderBy: { _count: { trigger: 'desc' } },
                    take: 10
                }),

                service.calculateAverageTimeBetweenRelapses(baseWhere)
            ]);

            return {
                totalRelapses,
                averageTimeBetweenRelapses: averageTimeBetween,
                commonTriggers: commonTriggers.map(t => ({
                    trigger: t.trigger || 'Unknown',
                    count: t._count
                })),
                severityDistribution: severityDistribution.map(s => ({
                    severity: s.severity,
                    count: s._count
                })),
                monthlyTrends
            };
        } catch (error) {
            console.error('Error fetching relapse analytics:', error);
            throw new Error('Failed to fetch relapse analytics');
        }
    }

    private async getMonthlyTrends(baseWhere: Record<string, unknown>) {
        const data = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

            const count = await prisma.relapse.count({
                where: {
                    ...baseWhere,
                    date: {
                        gte: date,
                        lt: nextDate
                    }
                }
            });

            data.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                count
            });
        }

        return data;
    }

    private async calculateAverageTimeBetweenRelapses(baseWhere: Record<string, unknown>): Promise<number> {
        const relapses = await prisma.relapse.findMany({
            where: baseWhere,
            orderBy: { date: 'asc' },
            select: { date: true, userId: true }
        });

        if (relapses.length < 2) return 0;

        const userRelapses = relapses.reduce((acc, relapse) => {
            if (!acc[relapse.userId]) acc[relapse.userId] = [];
            acc[relapse.userId].push(relapse.date);
            return acc;
        }, {} as Record<string, Date[]>);

        let totalDays = 0;
        let intervals = 0;

        Object.values(userRelapses).forEach(dates => {
            for (let i = 1; i < dates.length; i++) {
                const diff = dates[i].getTime() - dates[i - 1].getTime();
                totalDays += diff / (1000 * 60 * 60 * 24);
                intervals++;
            }
        });

        return intervals > 0 ? Math.round(totalDays / intervals) : 0;
    }
}
import { prisma } from "../prisma";
import { BaseService, ValidationResult } from "./base.service";
import { NotificationLog, NotificationType, NotificationLogStatus } from "../generated/prisma";

export interface NotificationSendData {
    title: string;
    message: string;
    type: NotificationType;
    targetGroups: string[];
    sendImmediate: boolean;
    scheduledAt?: Date;
    targeting?: NotificationTargeting;
}

export interface NotificationTargeting {
    userSegments: UserSegment[];
    demographics?: DemographicFilter;
    behavioral?: BehavioralFilter;
    excludeGroups?: string[];
}

export interface UserSegment {
    id: string;
    name: string;
    criteria: Record<string, any>;
    userCount: number;
}

export interface DemographicFilter {
    ageRange?: { min: number; max: number };
    location?: string[];
    gender?: string[];
    premiumStatus?: boolean;
}

export interface BehavioralFilter {
    streakRange?: { min: number; max: number };
    lastActiveRange?: { days: number };
    engagementLevel?: 'high' | 'medium' | 'low';
    relapseHistory?: boolean;
}

export interface NotificationSendResult {
    id: string;
    totalRecipients: number;
    successCount: number;
    failureCount: number;
    status: 'sent' | 'scheduled' | 'failed';
    sentAt?: Date;
    scheduledAt?: Date;
    errors?: string[];
}

export interface NotificationSendFilters {
    page?: number;
    limit?: number;
    status?: 'sent' | 'scheduled' | 'failed';
    type?: 'immediate' | 'scheduled' | 'targeted';
    search?: string;
    dateRange?: { start: Date; end: Date };
}

export interface UpdateNotificationSendData {
    title?: string;
    message?: string;
    status?: NotificationLogStatus;
    scheduledAt?: Date;
}

export class NotificationSendService extends BaseService<NotificationLog, NotificationSendData, UpdateNotificationSendData, NotificationSendFilters> {
    protected modelName = 'NotificationSend';
    protected model = prisma.notificationLog;
    protected defaultIncludes = {
        notification: {
            select: {
                title: true,
                message: true,
                type: true
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
    protected sortableFields = ['sentAt', 'createdAt'];

    protected async validateCreate(data: NotificationSendData): Promise<ValidationResult> {
        const errors: string[] = [];

        // Required field validation
        const titleError = this.validateRequired(data.title, 'title');
        if (titleError) errors.push(titleError);

        const messageError = this.validateRequired(data.message, 'message');
        if (messageError) errors.push(messageError);

        const typeError = this.validateRequired(data.type, 'type');
        if (typeError) errors.push(typeError);

        // Validate target groups
        if (!data.targetGroups || data.targetGroups.length === 0) {
            errors.push('At least one target group must be selected');
        }

        // Enum validation
        const typeEnumError = this.validateEnum(
            data.type,
            ['motivation', 'dailyReminder', 'marketing', 'system'],
            'type'
        );
        if (typeEnumError) errors.push(typeEnumError);

        // Validate scheduled time if not immediate
        if (!data.sendImmediate) {
            if (!data.scheduledAt) {
                errors.push('Scheduled time is required for non-immediate notifications');
            } else if (data.scheduledAt <= new Date()) {
                errors.push('Scheduled time must be in the future');
            }
        }

        return {
            success: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
            data: errors.length === 0 ? data : undefined
        };
    }

    protected async validateUpdate(data: UpdateNotificationSendData): Promise<ValidationResult> {
        const errors: string[] = [];

        // Basic validation for update data
        if (data.scheduledAt && data.scheduledAt <= new Date()) {
            errors.push('Scheduled time must be in the future');
        }

        return {
            success: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
            data: errors.length === 0 ? data : undefined
        };
    }

    protected transformCreateData(data: NotificationSendData): Record<string, unknown> {
        // This is a complex transformation as we need to create notification logs
        // For now, return basic structure
        return {
            type: data.type,
            title: data.title,
            message: data.message,
            status: data.sendImmediate ? 'sent' : 'sent', // Will be handled in service logic
            sentAt: data.sendImmediate ? new Date() : data.scheduledAt
        };
    }

    protected transformUpdateData(data: UpdateNotificationSendData): Record<string, unknown> {
        const updateData: Record<string, unknown> = {};
        
        if (data.title !== undefined) updateData.title = data.title;
        if (data.message !== undefined) updateData.message = data.message;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.scheduledAt !== undefined) updateData.sentAt = data.scheduledAt;

        return updateData;
    }

    protected buildWhereClause(filters: NotificationSendFilters): Record<string, unknown> {
        const where = super.buildWhereClause(filters);

        if (filters.status) {
            where.status = filters.status;
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
    static async getSentNotifications(filters: NotificationSendFilters = {}) {
        try {
            const { page = 1, limit = 10, status, type, search } = filters;
            const skip = (page - 1) * limit;

            // Build where clause
            const where: any = {};
            if (status) where.status = status;
            if (type) where.type = type;
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
                        notification: true,
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

            // Transform data to include additional fields
            const transformedData = logs.map(log => ({
                id: log.id,
                title: log.title,
                message: log.message,
                type: log.type,
                status: log.status,
                sentAt: log.sentAt,
                totalRecipients: Math.floor(Math.random() * 50000) + 1000, // Mock data for now
                successCount: Math.floor(Math.random() * 50000) + 1000, // Mock data for now
                failureCount: Math.floor(Math.random() * 1000), // Mock data for now
                createdAt: log.sentAt
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
            console.error('Error fetching sent notifications:', error);
            throw new Error('Failed to fetch sent notifications');
        }
    }

    static async sendNotification(data: NotificationSendData): Promise<NotificationSendResult> {
        try {
            // Validate the data
            const service = new NotificationSendService();
            const validation = await service.validateCreate(data);
            
            if (!validation.success) {
                throw new Error(validation.errors?.join(', ') || 'Validation failed');
            }

            // Calculate total recipients based on target groups
            const totalRecipients = await this.calculateRecipients(data.targetGroups, data.targeting);

            // Create notification record
            const notification = await prisma.notification.create({
                data: {
                    title: data.title,
                    message: data.message,
                    type: data.type,
                    targetGroup: data.targetGroups.join(', '),
                    scheduledAt: data.sendImmediate ? new Date() : data.scheduledAt!,
                    status: data.sendImmediate ? 'completed' : 'active',
                    frequency: 'once'
                }
            });

            if (data.sendImmediate) {
                // Send immediately
                const result = await this.deliverNotification(notification.id, totalRecipients);
                
                return {
                    id: notification.id,
                    totalRecipients,
                    successCount: result.successCount,
                    failureCount: result.failureCount,
                    status: 'sent',
                    sentAt: new Date(),
                    errors: result.errors
                };
            } else {
                // Schedule for later
                return {
                    id: notification.id,
                    totalRecipients,
                    successCount: 0,
                    failureCount: 0,
                    status: 'scheduled',
                    scheduledAt: data.scheduledAt
                };
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            throw new Error('Failed to send notification');
        }
    }

    static async sendTargetedNotification(data: NotificationSendData): Promise<NotificationSendResult> {
        try {
            // Enhanced targeting logic
            const targetedRecipients = await this.calculateTargetedRecipients(data.targeting);
            
            // Create notification with targeting info
            const notification = await prisma.notification.create({
                data: {
                    title: data.title,
                    message: data.message,
                    type: data.type,
                    targetGroup: `Targeted: ${data.targeting?.userSegments.map(s => s.name).join(', ') || 'Custom'}`,
                    scheduledAt: data.sendImmediate ? new Date() : data.scheduledAt!,
                    status: data.sendImmediate ? 'completed' : 'active',
                    frequency: 'once'
                }
            });

            if (data.sendImmediate) {
                const result = await this.deliverNotification(notification.id, targetedRecipients);
                
                return {
                    id: notification.id,
                    totalRecipients: targetedRecipients,
                    successCount: result.successCount,
                    failureCount: result.failureCount,
                    status: 'sent',
                    sentAt: new Date(),
                    errors: result.errors
                };
            } else {
                return {
                    id: notification.id,
                    totalRecipients: targetedRecipients,
                    successCount: 0,
                    failureCount: 0,
                    status: 'scheduled',
                    scheduledAt: data.scheduledAt
                };
            }
        } catch (error) {
            console.error('Error sending targeted notification:', error);
            throw new Error('Failed to send targeted notification');
        }
    }

    private static async calculateRecipients(targetGroups: string[], targeting?: NotificationTargeting): Promise<number> {
        // Mock calculation based on target groups
        const groupCounts: Record<string, number> = {
            'all': 45231,
            'premium': 2350,
            'active': 38492,
            'struggling': 5678,
            'champions': 1234
        };

        let total = 0;
        for (const group of targetGroups) {
            total += groupCounts[group] || 0;
        }

        // Apply targeting filters (mock reduction)
        if (targeting) {
            if (targeting.demographics) total = Math.floor(total * 0.8);
            if (targeting.behavioral) total = Math.floor(total * 0.7);
            if (targeting.excludeGroups?.length) total = Math.floor(total * 0.9);
        }

        return total;
    }

    private static async calculateTargetedRecipients(targeting?: NotificationTargeting): Promise<number> {
        if (!targeting || !targeting.userSegments.length) {
            return Math.floor(Math.random() * 10000) + 1000;
        }

        return targeting.userSegments.reduce((total, segment) => total + segment.userCount, 0);
    }

    private static async deliverNotification(notificationId: string, totalRecipients: number) {
        // Mock delivery simulation
        const successRate = Math.random() * 0.2 + 0.8; // 80-100% success rate
        const successCount = Math.floor(totalRecipients * successRate);
        const failureCount = totalRecipients - successCount;

        // Create notification logs (sample)
        const sampleUsers = await prisma.user.findMany({ take: Math.min(10, totalRecipients) });
        
        for (const user of sampleUsers) {
            await prisma.notificationLog.create({
                data: {
                    notificationId,
                    userId: user.id,
                    type: 'system',
                    title: 'Notification',
                    message: 'Sample notification',
                    status: Math.random() > 0.1 ? 'delivered' : 'failed',
                    sentAt: new Date()
                }
            });
        }

        return {
            successCount,
            failureCount,
            errors: failureCount > 0 ? [`${failureCount} notifications failed to deliver`] : undefined
        };
    }

    // Get target groups with user counts
    static async getTargetGroups() {
        try {
            const [
                totalUsers,
                premiumUsers,
                activeUsers,
                strugglingUsers,
                championUsers
            ] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { isPremium: true } }),
                prisma.user.count({ where: { status: 'active' } }),
                prisma.user.count({ 
                    where: { 
                        status: 'active',
                        streak: { lt: 7 }
                    } 
                }),
                prisma.user.count({ 
                    where: { 
                        status: 'active',
                        streak: { gt: 90 }
                    } 
                })
            ]);

            return [
                { id: "all", name: "Tüm Kullanıcılar", count: totalUsers },
                { id: "premium", name: "Premium Üyeler", count: premiumUsers },
                { id: "active", name: "Aktif Kullanıcılar", count: activeUsers },
                { id: "struggling", name: "Zorlanıyor (Streak < 7)", count: strugglingUsers },
                { id: "champions", name: "Şampiyonlar (Streak > 90)", count: championUsers }
            ];
        } catch (error) {
            console.error('Error fetching target groups:', error);
            // Return mock data if database query fails
            return [
                { id: "all", name: "Tüm Kullanıcılar", count: 45231 },
                { id: "premium", name: "Premium Üyeler", count: 2350 },
                { id: "active", name: "Aktif Kullanıcılar", count: 38492 },
                { id: "struggling", name: "Zorlanıyor (Streak < 7)", count: 5678 },
                { id: "champions", name: "Şampiyonlar (Streak > 90)", count: 1234 }
            ];
        }
    }
}
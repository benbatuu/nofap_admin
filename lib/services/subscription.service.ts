import { prisma } from "../prisma";
import { BaseService, ValidationResult } from "./base.service";
import { Subscription } from "../generated/prisma";

export interface SubscriptionFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'cancelled' | 'expired' | 'pending';
    userId?: string;
    productId?: string;
}

export interface CreateSubscriptionData {
    userId: string;
    productId: string;
    paymentMethod: string;
    startDate?: Date;
    endDate?: Date;
}

export interface UpdateSubscriptionData {
    status?: 'active' | 'cancelled' | 'expired' | 'pending';
    endDate?: Date;
    paymentMethod?: string;
}

export class SubscriptionService extends BaseService<Subscription, CreateSubscriptionData, UpdateSubscriptionData, SubscriptionFilters> {
    protected modelName = 'Subscription';
    protected model = prisma.subscription;
    protected defaultIncludes = {
        user: {
            select: {
                id: true,
                name: true,
                email: true
            }
        },
        product: {
            select: {
                id: true,
                name: true,
                interval: true,
                features: true
            }
        }
    };
    protected searchFields = ['user.name', 'user.email', 'product.name'];
    protected sortableFields = ['createdAt', 'startDate', 'endDate', 'price'];

    protected async validateCreate(data: CreateSubscriptionData): Promise<ValidationResult> {
        const errors: string[] = [];

        if (!data.userId) errors.push('User ID is required');
        if (!data.productId) errors.push('Product ID is required');
        if (!data.paymentMethod) errors.push('Payment method is required');

        // Check if user exists
        if (data.userId) {
            const user = await prisma.user.findUnique({ where: { id: data.userId } });
            if (!user) errors.push('User not found');
        }

        // Check if product exists
        if (data.productId) {
            const product = await prisma.product.findUnique({ where: { id: data.productId } });
            if (!product) errors.push('Product not found');
            if (product && !product.isActive) errors.push('Product is not active');
        }

        if (errors.length > 0) return { success: false, errors };
        return { success: true, data };
    }

    protected async validateUpdate(data: UpdateSubscriptionData): Promise<ValidationResult> {
        const errors: string[] = [];

        if (data.status && !['active', 'cancelled', 'expired', 'pending'].includes(data.status)) {
            errors.push('Invalid status');
        }

        if (errors.length > 0) return { success: false, errors };
        return { success: true, data };
    }

    protected async transformCreateData(data: CreateSubscriptionData): Promise<any> {
        // Get product details for pricing
        const product = await prisma.product.findUnique({
            where: { id: data.productId }
        });

        if (!product) throw new Error('Product not found');

        // Calculate end date if not provided
        let endDate = data.endDate;
        if (!endDate && data.startDate) {
            const start = new Date(data.startDate);
            if (product.interval === 'monthly') {
                endDate = new Date(start.setMonth(start.getMonth() + 1));
            } else {
                endDate = new Date(start.setFullYear(start.getFullYear() + 1));
            }
        }

        return {
            userId: data.userId,
            productId: data.productId,
            status: 'active',
            startDate: data.startDate || new Date(),
            endDate,
            price: product.price,
            currency: product.currency,
            paymentMethod: data.paymentMethod
        };
    }

    protected transformUpdateData(data: UpdateSubscriptionData): Record<string, unknown> {
        return { ...data };
    }

    protected buildWhereClause(filters: SubscriptionFilters): Record<string, unknown> {
        const where: any = super.buildWhereClause(filters);

        if (filters.status) where.status = filters.status;
        if (filters.userId) where.userId = filters.userId;
        if (filters.productId) where.productId = filters.productId;

        return where;
    }

    static async getSubscriptions(filters: SubscriptionFilters = {}) {
        try {
            const service = new SubscriptionService();
            return await service.findMany(filters);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            throw new Error('Failed to fetch subscriptions');
        }
    }

    static async getSubscriptionById(id: string) {
        try {
            const service = new SubscriptionService();
            return await service.findById(id);
        } catch (error) {
            console.error('Error fetching subscription:', error);
            throw new Error('Failed to fetch subscription');
        }
    }

    static async createSubscription(data: CreateSubscriptionData) {
        try {
            const service = new SubscriptionService();
            return await service.create(data);
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw new Error('Failed to create subscription');
        }
    }

    static async updateSubscription(id: string, data: UpdateSubscriptionData) {
        try {
            const service = new SubscriptionService();
            return await service.update(id, data);
        } catch (error) {
            console.error('Error updating subscription:', error);
            throw new Error('Failed to update subscription');
        }
    }

    static async cancelSubscription(id: string) {
        try {
            const service = new SubscriptionService();
            return await service.update(id, {
                status: 'cancelled',
                endDate: new Date()
            });
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            throw new Error('Failed to cancel subscription');
        }
    }

    static async getSubscriptionAnalytics(filters: { timeFilter?: string } = {}) {
        try {
            const { timeFilter = 'month' } = filters;

            // Calculate date range based on filter
            const now = new Date();
            let startDate = new Date();

            switch (timeFilter) {
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    startDate.setMonth(now.getMonth() - 1);
            }

            const [
                totalRevenue,
                totalSubscribers,
                activeSubscriptions,
                recentSubscriptions,
                subscriptionsByProduct
            ] = await Promise.all([
                prisma.subscription.aggregate({
                    where: { status: 'active' },
                    _sum: { price: true }
                }),
                prisma.subscription.count({
                    where: { status: 'active' }
                }),
                prisma.subscription.findMany({
                    where: { status: 'active' },
                    include: { product: true }
                }),
                prisma.subscription.findMany({
                    where: {
                        createdAt: { gte: startDate },
                        status: 'active'
                    }
                }),
                prisma.subscription.groupBy({
                    by: ['productId'],
                    where: { status: 'active' },
                    _count: { id: true },
                    _sum: { price: true }
                })
            ]);

            // Get product details
            const productIds = subscriptionsByProduct.map(s => s.productId);
            const products = await prisma.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, name: true }
            });

            const revenueByProduct = subscriptionsByProduct.map(sub => {
                const product = products.find(p => p.id === sub.productId);
                return {
                    productId: sub.productId,
                    productName: product?.name || 'Unknown Product',
                    revenue: sub._sum.price || 0,
                    subscribers: sub._count.id
                };
            });

            // Calculate growth rate
            const previousPeriodStart = new Date(startDate);
            previousPeriodStart.setTime(previousPeriodStart.getTime() - (now.getTime() - startDate.getTime()));

            const previousPeriodSubscriptions = await prisma.subscription.count({
                where: {
                    createdAt: { gte: previousPeriodStart, lt: startDate }
                }
            });

            const currentPeriodSubscriptions = recentSubscriptions.length;
            const growthRate = previousPeriodSubscriptions > 0
                ? ((currentPeriodSubscriptions - previousPeriodSubscriptions) / previousPeriodSubscriptions) * 100
                : 0;

            // Calculate conversion rate (assuming total users)
            const totalUsers = await prisma.user.count();
            const conversionRate = totalUsers > 0 ? (totalSubscribers / totalUsers) * 100 : 0;

            return {
                totalRevenue: totalRevenue._sum.price || 0,
                totalSubscribers,
                monthlyGrowth: growthRate,
                conversionRate,
                averageRevenuePerUser: totalSubscribers > 0 ? (totalRevenue._sum.price || 0) / totalSubscribers : 0,
                revenueByProduct,
                stats: {
                    total: await prisma.subscription.count(),
                    active: totalSubscribers,
                    cancelled: await prisma.subscription.count({ where: { status: 'cancelled' } }),
                    revenue: totalRevenue._sum.price || 0
                }
            };
        } catch (error) {
            console.error('Error fetching subscription analytics:', error);
            throw new Error('Failed to fetch subscription analytics');
        }
    }
}
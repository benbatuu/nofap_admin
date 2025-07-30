import { prisma } from "../prisma";
import { BaseService, ValidationResult } from "./base.service";
import { Product } from "../generated/prisma";

export interface BillingProductFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
    type?: string;
}

export class ProductService extends BaseService<Product, any, any, BillingProductFilters> {
    protected modelName = 'Product';
    protected model = prisma.product;
    protected defaultIncludes = {};
    protected searchFields = ['name', 'description'];
    protected sortableFields = ['name', 'price', 'createdAt'];

    protected async validateCreate(data: any): Promise<ValidationResult> {
        const errors: string[] = [];
        if (!data.name || data.name.trim().length === 0) errors.push('Product name is required');
        if (!data.price || data.price <= 0) errors.push('Valid price is required');
        if (!data.type) errors.push('Product type is required');
        if (errors.length > 0) return { success: false, errors };
        return { success: true, data };
    }

    protected async validateUpdate(data: any): Promise<ValidationResult> {
        const errors: string[] = [];
        if (data.name !== undefined && data.name.trim().length === 0) errors.push('Product name cannot be empty');
        if (data.price !== undefined && data.price <= 0) errors.push('Price must be greater than 0');
        if (errors.length > 0) return { success: false, errors };
        return { success: true, data };
    }

    protected transformCreateData(data: any): any {
        // Set duration based on interval
        let duration = null;
        if (data.interval === 'monthly') {
            duration = '1 month';
        } else if (data.interval === 'yearly') {
            duration = '1 year';
        }

        return {
            name: data.name,
            description: data.description,
            price: data.price,
            currency: data.currency || 'USD',
            type: data.type || 'subscription',
            duration: duration,
            features: data.features || [],
            isActive: data.isActive !== undefined ? data.isActive : true,
            subscribers: data.subscribers || 0
        } as any;
    }

    protected transformUpdateData(data: any): Record<string, unknown> {
        return { ...data };
    }

    protected buildWhereClause(filters: BillingProductFilters): Record<string, unknown> {
        const where: any = super.buildWhereClause(filters);
        if (filters.status) where.isActive = filters.status === 'active';
        if (filters.type) where.type = filters.type;
        return where;
    }

    static async getProducts(filters: BillingProductFilters = {}) {
        try {
            const { page = 1, limit = 10, search, status, type } = filters;
            const skip = (page - 1) * limit;
            const where: any = {};
            if (status) where.isActive = status === 'active';
            if (type) where.type = type;
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }
            const [products, total] = await Promise.all([
                prisma.product.findMany({
                    where,
                    skip,
                    take: limit,
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        price: true,
                        currency: true,
                        type: true,
                        duration: true,
                        features: true,
                        subscribers: true,
                        isActive: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.product.count({ where })
            ]);
            // Add default values for interval based on duration
            const productsWithDefaults = products.map(product => ({
                ...product,
                interval: (product.duration === '1 year' ? 'yearly' : 'monthly') as const,
                features: product.features || []
            }));

            return {
                data: productsWithDefaults,
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
            console.error('Error fetching products:', error);
            throw new Error('Failed to fetch products');
        }
    }

    static async getProductById(id: string) {
        try {
            const product = await prisma.product.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    currency: true,
                    type: true,
                    duration: true,
                    features: true,
                    subscribers: true,
                    isActive: true,
                    createdAt: true
                }
            });
            if (!product) return null;

            // Add interval based on duration
            return {
                ...product,
                interval: (product.duration === '1 year' ? 'yearly' : 'monthly') as const,
                features: product.features || []
            };
        } catch (error) {
            console.error('Error fetching product:', error);
            throw new Error('Failed to fetch product');
        }
    }

    static async createProduct(data: any) {
        try {
            const service = new ProductService();
            const validation = await service.validateCreate(data);
            if (!validation.success) throw new Error(validation.errors?.join(', ') || 'Validation failed');
            const transformedData = service.transformCreateData(data);
            const product = await prisma.product.create({ data: transformedData });
            return product;
        } catch (error) {
            console.error('Error creating product:', error);
            throw new Error('Failed to create product');
        }
    }

    static async updateProduct(id: string, data: any) {
        try {
            const service = new ProductService();
            const validation = await service.validateUpdate(data);
            if (!validation.success) throw new Error(validation.errors?.join(', ') || 'Validation failed');
            const transformedData = service.transformUpdateData(data);
            const product = await prisma.product.update({ where: { id }, data: transformedData });
            return product;
        } catch (error) {
            console.error('Error updating product:', error);
            throw new Error('Failed to update product');
        }
    }

    static async deleteProduct(id: string) {
        try {
            await prisma.product.delete({ where: { id } });
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw new Error('Failed to delete product');
        }
    }

    static async getProductAnalytics(): Promise<any> {
        try {
            // Use product-based analytics (fallback approach)
            const [products, users] = await Promise.all([
                prisma.product.findMany({
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        subscribers: true,
                        isActive: true
                    }
                }),
                prisma.user.count()
            ]);

            // Calculate metrics based on product data
            const totalRevenue = products.reduce((sum, product) => sum + (product.price * product.subscribers), 0);
            const totalSubscribers = products.reduce((sum, product) => sum + product.subscribers, 0);
            const activeProducts = products.length;

            // Mock growth rate for now
            const monthlyGrowth = 8.5;

            // Calculate conversion rate
            const conversionRate = users > 0 ? (totalSubscribers / users) * 100 : 0;

            // Calculate average revenue per user
            const averageRevenuePerUser = totalSubscribers > 0 ? totalRevenue / totalSubscribers : 0;

            return {
                totalRevenue,
                totalSubscribers,
                monthlyGrowth,
                conversionRate,
                averageRevenuePerUser,
                activeProducts
            };
        } catch (error) {
            console.error('Error fetching product analytics:', error);
            // Return default values if there's an error
            return {
                totalRevenue: 0,
                totalSubscribers: 0,
                monthlyGrowth: 0,
                conversionRate: 0,
                averageRevenuePerUser: 0,
                activeProducts: 0
            };
        }
    }

    static async getProductSuggestions(): Promise<any> {
        try {
            // Mock suggestions
            return {
                marketingSuggestions: [
                    {
                        strategy: 'Yıllık Plan Teşviki',
                        description: 'Yıllık plana geçiş için %25 indirim kampanyası düzenlenebilir.',
                        targetAudience: 'Mevcut aylık aboneler',
                        expectedConversion: 15,
                        cost: 1000
                    },
                    {
                        strategy: 'Yeni Özellik Paketi',
                        description: 'Streak Booster ürününü yeniden aktifleştirmeyi düşünün.',
                        targetAudience: 'Tüm kullanıcılar',
                        expectedConversion: 8,
                        cost: 500
                    },
                    {
                        strategy: 'A/B Test Önerisi',
                        description: 'Farklı fiyat noktalarında A/B test yapılabilir.',
                        targetAudience: 'Yeni kullanıcılar',
                        expectedConversion: 12,
                        cost: 300
                    }
                ]
            };
        } catch (error) {
            console.error('Error fetching product suggestions:', error);
            throw new Error('Failed to fetch product suggestions');
        }
    }
}
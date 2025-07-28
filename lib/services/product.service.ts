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
        return {
            name: data.name,
            description: data.description,
            price: data.price,
            currency: data.currency,
            type: data.type,
            duration: data.duration || null,
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
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.product.count({ where })
            ]);
            return {
                data: products,
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
            const product = await prisma.product.findUnique({ where: { id } });
            if (!product) return null;
            return product;
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
            const totalRevenue = await prisma.product.aggregate({ _sum: { price: true } });
            const totalSubscribers = await prisma.product.aggregate({ _sum: { subscribers: true } });
            const activeProducts = await prisma.product.count({ where: { isActive: true } });
            return {
                totalRevenue: totalRevenue._sum.price || 0,
                totalSubscribers: totalSubscribers._sum.subscribers || 0,
                activeProducts
            };
        } catch (error) {
            console.error('Error fetching product analytics:', error);
            throw new Error('Failed to fetch product analytics');
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
import { prisma } from '../prisma';
import { APIError, ErrorCode, createPaginationInfo, PaginationInfo } from '@/lib/utils/api-response';

// Base interfaces for all services
export interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface BulkOperationResult {
  count: number;
  success: boolean;
}

export interface ValidationResult {
  success: boolean;
  errors?: string[];
  data?: any;
}

// Base service class with common CRUD operations
export abstract class BaseService<T, CreateData, UpdateData, Filters extends BaseFilters = BaseFilters> {
  protected abstract modelName: string;
  protected abstract model: any; // Prisma model
  protected abstract defaultIncludes?: any;
  protected abstract searchFields: string[];
  protected abstract sortableFields: string[];

  // Abstract methods that must be implemented by subclasses
  protected abstract validateCreate(data: CreateData): Promise<ValidationResult>;
  protected abstract validateUpdate(data: UpdateData): Promise<ValidationResult>;
  protected abstract transformCreateData(data: CreateData): any;
  protected abstract transformUpdateData(data: UpdateData): any;

  // Common CRUD operations
  async list(filters: Filters = {} as Filters): Promise<PaginatedResponse<T>> {
    const { page = 1, limit = 10, search, sortBy, sortOrder = 'desc' } = filters;
    
    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(100, Math.max(1, limit));
    const skip = (validatedPage - 1) * validatedLimit;

    // Build where clause
    const where = this.buildWhereClause(filters);

    // Build order by clause
    const orderBy = this.buildOrderByClause(sortBy, sortOrder);

    try {
      const [data, total] = await Promise.all([
        this.model.findMany({
          where,
          skip,
          take: validatedLimit,
          orderBy,
          include: this.defaultIncludes,
        }),
        this.model.count({ where }),
      ]);

      const pagination = createPaginationInfo(total, validatedPage, validatedLimit);

      return { data, pagination };
    } catch (error) {
      throw new APIError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to fetch ${this.modelName} list`,
        500,
        error
      );
    }
  }

  async getById(id: string): Promise<T | null> {
    if (!id) {
      throw new APIError(ErrorCode.VALIDATION_ERROR, 'ID is required', 400);
    }

    try {
      const result = await this.model.findUnique({
        where: { id },
        include: this.defaultIncludes,
      });

      return result;
    } catch (error) {
      throw new APIError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to fetch ${this.modelName}`,
        500,
        error
      );
    }
  }

  async create(data: CreateData): Promise<T> {
    // Validate input data
    const validation = await this.validateCreate(data);
    if (!validation.success) {
      throw new APIError(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed',
        400,
        validation.errors
      );
    }

    // Transform data for database
    const transformedData = this.transformCreateData(validation.data || data);

    try {
      const result = await this.model.create({
        data: transformedData,
        include: this.defaultIncludes,
      });

      // Log creation for audit trail
      await this.logAuditEvent('CREATE', result.id, transformedData);

      return result;
    } catch (error) {
      if (this.isPrismaUniqueConstraintError(error)) {
        throw new APIError(
          ErrorCode.CONFLICT,
          `${this.modelName} already exists`,
          409
        );
      }

      throw new APIError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to create ${this.modelName}`,
        500,
        error
      );
    }
  }

  async update(id: string, data: UpdateData): Promise<T> {
    if (!id) {
      throw new APIError(ErrorCode.VALIDATION_ERROR, 'ID is required', 400);
    }

    // Check if record exists
    const existing = await this.getById(id);
    if (!existing) {
      throw new APIError(
        ErrorCode.NOT_FOUND,
        `${this.modelName} not found`,
        404
      );
    }

    // Validate input data
    const validation = await this.validateUpdate(data);
    if (!validation.success) {
      throw new APIError(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed',
        400,
        validation.errors
      );
    }

    // Transform data for database
    const transformedData = this.transformUpdateData(validation.data || data);

    try {
      const result = await this.model.update({
        where: { id },
        data: transformedData,
        include: this.defaultIncludes,
      });

      // Log update for audit trail
      await this.logAuditEvent('UPDATE', id, transformedData, existing);

      return result;
    } catch (error) {
      if (this.isPrismaUniqueConstraintError(error)) {
        throw new APIError(
          ErrorCode.CONFLICT,
          `${this.modelName} already exists`,
          409
        );
      }

      throw new APIError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to update ${this.modelName}`,
        500,
        error
      );
    }
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      throw new APIError(ErrorCode.VALIDATION_ERROR, 'ID is required', 400);
    }

    // Check if record exists
    const existing = await this.getById(id);
    if (!existing) {
      throw new APIError(
        ErrorCode.NOT_FOUND,
        `${this.modelName} not found`,
        404
      );
    }

    try {
      await this.model.delete({
        where: { id },
      });

      // Log deletion for audit trail
      await this.logAuditEvent('DELETE', id, null, existing);
    } catch (error) {
      if (this.isPrismaForeignKeyError(error)) {
        throw new APIError(
          ErrorCode.CONFLICT,
          `Cannot delete ${this.modelName} - it is referenced by other records`,
          409
        );
      }

      throw new APIError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to delete ${this.modelName}`,
        500,
        error
      );
    }
  }

  // Bulk operations
  async bulkCreate(dataArray: CreateData[]): Promise<BulkOperationResult> {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new APIError(
        ErrorCode.VALIDATION_ERROR,
        'Data array is required and cannot be empty',
        400
      );
    }

    // Validate all items
    const validationResults = await Promise.all(
      dataArray.map(data => this.validateCreate(data))
    );

    const errors = validationResults
      .filter(result => !result.success)
      .flatMap(result => result.errors || []);

    if (errors.length > 0) {
      throw new APIError(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed for bulk create',
        400,
        errors
      );
    }

    // Transform all data
    const transformedData = dataArray.map(data => this.transformCreateData(data));

    try {
      const result = await this.model.createMany({
        data: transformedData,
        skipDuplicates: true,
      });

      return {
        count: result.count,
        success: true,
      };
    } catch (error) {
      throw new APIError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to bulk create ${this.modelName}`,
        500,
        error
      );
    }
  }

  async bulkUpdate(ids: string[], data: UpdateData): Promise<BulkOperationResult> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new APIError(
        ErrorCode.VALIDATION_ERROR,
        'IDs array is required and cannot be empty',
        400
      );
    }

    // Validate update data
    const validation = await this.validateUpdate(data);
    if (!validation.success) {
      throw new APIError(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed',
        400,
        validation.errors
      );
    }

    const transformedData = this.transformUpdateData(validation.data || data);

    try {
      const result = await this.model.updateMany({
        where: { id: { in: ids } },
        data: transformedData,
      });

      return {
        count: result.count,
        success: true,
      };
    } catch (error) {
      throw new APIError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to bulk update ${this.modelName}`,
        500,
        error
      );
    }
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new APIError(
        ErrorCode.VALIDATION_ERROR,
        'IDs array is required and cannot be empty',
        400
      );
    }

    try {
      const result = await this.model.deleteMany({
        where: { id: { in: ids } },
      });

      return {
        count: result.count,
        success: true,
      };
    } catch (error) {
      throw new APIError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to bulk delete ${this.modelName}`,
        500,
        error
      );
    }
  }

  // Search functionality
  async search(query: string, limit: number = 10): Promise<T[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const where = this.buildSearchWhereClause(query);

    try {
      return await this.model.findMany({
        where,
        take: limit,
        include: this.defaultIncludes,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new APIError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to search ${this.modelName}`,
        500,
        error
      );
    }
  }

  // Analytics and statistics
  async getCount(filters?: Partial<Filters>): Promise<number> {
    const where = filters ? this.buildWhereClause(filters as Filters) : {};

    try {
      return await this.model.count({ where });
    } catch (error) {
      throw new APIError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to count ${this.modelName}`,
        500,
        error
      );
    }
  }

  async getStats(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const [total, recent] = await Promise.all([
        this.model.count(),
        this.model.count({
          where: {
            createdAt: { gte: startDate },
          },
        }),
      ]);

      return {
        total,
        recent,
        growth: total > 0 ? ((recent / total) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      throw new APIError(
        ErrorCode.INTERNAL_ERROR,
        `Failed to get ${this.modelName} stats`,
        500,
        error
      );
    }
  }

  // Export functionality
  async export(filters: Filters = {} as Filters, format: 'json' | 'csv' = 'json'): Promise<string> {
    const { data } = await this.list({ ...filters, limit: 10000 });

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // CSV format - implement based on model structure
    return this.convertToCSV(data);
  }

  // Helper methods
  protected buildWhereClause(filters: Filters): any {
    const where: any = {};
    const { search, ...otherFilters } = filters;

    // Add search functionality
    if (search && this.searchFields.length > 0) {
      where.OR = this.searchFields.map(field => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    // Add other filters (to be implemented by subclasses)
    Object.entries(otherFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all' && key !== 'page' && key !== 'limit' && key !== 'sortBy' && key !== 'sortOrder') {
        where[key] = value;
      }
    });

    return where;
  }

  protected buildSearchWhereClause(query: string): any {
    if (this.searchFields.length === 0) {
      return {};
    }

    return {
      OR: this.searchFields.map(field => ({
        [field]: { contains: query, mode: 'insensitive' },
      })),
    };
  }

  protected buildOrderByClause(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): any {
    if (!sortBy || !this.sortableFields.includes(sortBy)) {
      return { createdAt: sortOrder };
    }

    return { [sortBy]: sortOrder };
  }

  protected isPrismaUniqueConstraintError(error: any): boolean {
    return error?.code === 'P2002';
  }

  protected isPrismaForeignKeyError(error: any): boolean {
    return error?.code === 'P2003';
  }

  protected isPrismaNotFoundError(error: any): boolean {
    return error?.code === 'P2025';
  }

  protected convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      ),
    ];

    return csvRows.join('\n');
  }

  // Audit logging
  protected async logAuditEvent(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    recordId: string,
    newData?: any,
    oldData?: any
  ): Promise<void> {
    try {
      // Only log if audit service is available
      if (prisma.auditLog) {
        await prisma.auditLog.create({
          data: {
            action,
            resource: this.modelName,
            resourceId: recordId,
            userId: 'system', // Replace with actual user ID
            userName: 'System',
            details: {
              oldData: oldData ? JSON.stringify(oldData) : null,
              newData: newData ? JSON.stringify(newData) : null,
            },
            ipAddress: '127.0.0.1',
            timestamp: new Date(),
          },
        });
      }
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      console.error('Failed to log audit event:', error);
    }
  }

  // Validation helpers
  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected validateRequired(value: any, fieldName: string): string | null {
    if (value === undefined || value === null || value === '') {
      return `${fieldName} is required`;
    }
    return null;
  }

  protected validateLength(value: string, min: number, max: number, fieldName: string): string | null {
    if (value && (value.length < min || value.length > max)) {
      return `${fieldName} must be between ${min} and ${max} characters`;
    }
    return null;
  }

  protected validateEnum(value: any, allowedValues: any[], fieldName: string): string | null {
    if (value && !allowedValues.includes(value)) {
      return `${fieldName} must be one of: ${allowedValues.join(', ')}`;
    }
    return null;
  }

  protected async validateUnique(field: string, value: any, excludeId?: string): Promise<string | null> {
    const where: any = { [field]: value };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existing = await this.model.findFirst({ where });
    if (existing) {
      return `${field} already exists`;
    }
    return null;
  }
}
import { prisma } from "../prisma";
import { BaseService, ValidationResult } from "./base.service";
import { NotificationTemplate, NotificationType } from "../generated/prisma";

export interface NotificationTemplateData {
    name: string;
    subject: string;
    content: string;
    variables: string[];
    type: NotificationType;
    isActive: boolean;
}

export interface UpdateNotificationTemplateData {
    name?: string;
    subject?: string;
    content?: string;
    variables?: string[];
    type?: NotificationType;
    isActive?: boolean;
}

export interface NotificationTemplateFilters {
    page?: number;
    limit?: number;
    type?: NotificationType;
    isActive?: boolean;
    search?: string;
}

export class NotificationTemplateService extends BaseService<NotificationTemplate, NotificationTemplateData, UpdateNotificationTemplateData, NotificationTemplateFilters> {
    protected modelName = 'NotificationTemplate';
    protected model = prisma.notificationTemplate;
    protected defaultIncludes = {};
    protected searchFields = ['name', 'subject', 'content'];
    protected sortableFields = ['name', 'type', 'createdAt', 'updatedAt'];

    protected async validateCreate(data: NotificationTemplateData): Promise<ValidationResult> {
        const errors: string[] = [];

        // Required field validation
        const nameError = this.validateRequired(data.name, 'name');
        if (nameError) errors.push(nameError);

        const subjectError = this.validateRequired(data.subject, 'subject');
        if (subjectError) errors.push(subjectError);

        const contentError = this.validateRequired(data.content, 'content');
        if (contentError) errors.push(contentError);

        const typeError = this.validateRequired(data.type, 'type');
        if (typeError) errors.push(typeError);

        // Enum validation
        const typeEnumError = this.validateEnum(
            data.type,
            ['motivation', 'dailyReminder', 'marketing', 'system'],
            'type'
        );
        if (typeEnumError) errors.push(typeEnumError);

        // Check for duplicate template name
        const existingTemplate = await prisma.notificationTemplate.findFirst({
            where: { name: data.name }
        });
        if (existingTemplate) {
            errors.push('Template with this name already exists');
        }

        return {
            success: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
            data: errors.length === 0 ? data : undefined
        };
    }

    protected async validateUpdate(data: UpdateNotificationTemplateData): Promise<ValidationResult> {
        const errors: string[] = [];

        // Enum validation if type is provided
        if (data.type) {
            const typeEnumError = this.validateEnum(
                data.type,
                ['motivation', 'dailyReminder', 'marketing', 'system'],
                'type'
            );
            if (typeEnumError) errors.push(typeEnumError);
        }

        return {
            success: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
            data: errors.length === 0 ? data : undefined
        };
    }

    protected transformCreateData(data: NotificationTemplateData): Record<string, unknown> {
        return {
            name: data.name,
            subject: data.subject,
            content: data.content,
            variables: data.variables,
            type: data.type,
            isActive: data.isActive
        };
    }

    protected transformUpdateData(data: UpdateNotificationTemplateData): Record<string, unknown> {
        const updateData: Record<string, unknown> = {};
        
        if (data.name !== undefined) updateData.name = data.name;
        if (data.subject !== undefined) updateData.subject = data.subject;
        if (data.content !== undefined) updateData.content = data.content;
        if (data.variables !== undefined) updateData.variables = data.variables;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        return updateData;
    }

    protected buildWhereClause(filters: NotificationTemplateFilters): Record<string, unknown> {
        const where = super.buildWhereClause(filters);

        if (filters.type) {
            where.type = filters.type;
        }

        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        return where;
    }

    // Static methods for external API
    static async getNotificationTemplates(filters: NotificationTemplateFilters = {}) {
        const service = new NotificationTemplateService();
        return service.list(filters);
    }

    static async getNotificationTemplateById(id: string) {
        const service = new NotificationTemplateService();
        return service.getById(id);
    }

    static async createNotificationTemplate(data: NotificationTemplateData) {
        const service = new NotificationTemplateService();
        return service.create(data);
    }

    static async updateNotificationTemplate(id: string, data: UpdateNotificationTemplateData) {
        const service = new NotificationTemplateService();
        return service.update(id, data);
    }

    static async deleteNotificationTemplate(id: string) {
        const service = new NotificationTemplateService();
        return service.delete(id);
    }

    // Get default templates
    static async getDefaultTemplates() {
        return [
            {
                id: "motivation",
                name: "Motivasyon Mesajı",
                subject: "Günlük Motivasyon",
                content: "Bugün harika bir gün! Hedeflerine odaklan ve güçlü kal. 💪",
                variables: [],
                type: 'motivation' as NotificationType,
                isActive: true
            },
            {
                id: "milestone",
                name: "Milestone Kutlaması",
                subject: "Tebrikler!",
                content: "Tebrikler! {streak_days} günlük streak'ini tamamladın! 🎉",
                variables: ['streak_days'],
                type: 'system' as NotificationType,
                isActive: true
            },
            {
                id: "support",
                name: "Destek Mesajı",
                subject: "Sen Güçlüsün",
                content: "Zorlandığın anları hatırla - sen bundan daha güçlüsün. Topluluk seninle! 🤝",
                variables: [],
                type: 'motivation' as NotificationType,
                isActive: true
            },
            {
                id: "reminder",
                name: "Günlük Hatırlatma",
                subject: "Günlük Kontrol",
                content: "Bugün nasıl geçiyor? Hedeflerini unutma ve güçlü kal! 💪",
                variables: [],
                type: 'dailyReminder' as NotificationType,
                isActive: true
            },
            {
                id: "premium",
                name: "Premium Davet",
                subject: "Premium Özellikler",
                content: "Premium üyeliğin avantajlarını keşfet! İlk ay %50 indirimli. 🌟",
                variables: [],
                type: 'marketing' as NotificationType,
                isActive: true
            }
        ];
    }
}
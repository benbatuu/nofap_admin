import { NextRequest, NextResponse } from 'next/server';
import { NotificationTemplateService } from '@/lib/services/notification-template.service';

export async function POST(request: NextRequest) {
    try {
        const { templateId, variables } = await request.json();

        if (!templateId) {
            return NextResponse.json(
                { success: false, error: 'Template ID is required' },
                { status: 400 }
            );
        }

        if (!variables || typeof variables !== 'object') {
            return NextResponse.json(
                { success: false, error: 'Variables must be an object' },
                { status: 400 }
            );
        }

        const result = await NotificationTemplateService.renderTemplate(templateId, variables);

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Render template API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to render template' },
            { status: 500 }
        );
    }
}
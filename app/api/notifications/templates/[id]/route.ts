import { NextRequest, NextResponse } from 'next/server';
import { NotificationTemplateService } from '@/lib/services';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const template = await NotificationTemplateService.getNotificationTemplateById(params.id);

        if (!template) {
            return NextResponse.json(
                { success: false, error: 'Template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('Get notification template API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch notification template' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const data = await request.json();

        const result = await NotificationTemplateService.updateNotificationTemplate(params.id, data);

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Update notification template API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update notification template' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await NotificationTemplateService.deleteNotificationTemplate(params.id);

        return NextResponse.json({
            success: true,
            message: 'Template deleted successfully'
        });
    } catch (error) {
        console.error('Delete notification template API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete notification template' },
            { status: 500 }
        );
    }
}
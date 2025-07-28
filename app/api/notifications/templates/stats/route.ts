import { NextRequest, NextResponse } from 'next/server';
import { NotificationTemplateService } from '@/lib/services/notification-template.service';

export async function GET(request: NextRequest) {
    try {
        const stats = await NotificationTemplateService.getTemplateStats();

        return NextResponse.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Template stats API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch template stats' },
            { status: 500 }
        );
    }
}
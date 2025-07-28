import { NextRequest, NextResponse } from 'next/server';
import { ActivityAnalyticsService } from '@/lib/services/activity-analytics.service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || undefined;
        const type = searchParams.get('type') || undefined;
        const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
        const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;

        const stats = await ActivityAnalyticsService.getActivityStats({
            userId,
            type,
            dateFrom,
            dateTo
        });

        return NextResponse.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Activity stats API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch activity stats' },
            { status: 500 }
        );
    }
}
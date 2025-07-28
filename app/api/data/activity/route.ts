import { NextRequest, NextResponse } from 'next/server';
import { ActivityAnalyticsService } from '@/lib/services/activity-analytics.service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const userId = searchParams.get('userId') || undefined;
        const type = searchParams.get('type') || undefined;
        const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
        const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;

        // Validation
        if (page < 1) {
            return NextResponse.json(
                { success: false, error: 'Page must be greater than 0' },
                { status: 400 }
            );
        }

        if (limit < 1 || limit > 100) {
            return NextResponse.json(
                { success: false, error: 'Limit must be between 1 and 100' },
                { status: 400 }
            );
        }

        const result = await ActivityAnalyticsService.getActivities({
            page,
            limit,
            userId,
            type,
            dateFrom,
            dateTo
        });

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Activity API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch activities' },
            { status: 500 }
        );
    }
}
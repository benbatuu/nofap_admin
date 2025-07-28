import { NextRequest, NextResponse } from 'next/server';
import { StreakAnalyticsService } from '@/lib/services/streak-analytics.service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || undefined;
        const isActive = searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined;
        const minDays = searchParams.get('minDays') ? parseInt(searchParams.get('minDays')!) : undefined;
        const maxDays = searchParams.get('maxDays') ? parseInt(searchParams.get('maxDays')!) : undefined;

        const analytics = await StreakAnalyticsService.getStreakAnalytics({
            userId,
            isActive,
            minDays,
            maxDays
        });

        return NextResponse.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Streak analytics API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch streak analytics' },
            { status: 500 }
        );
    }
}
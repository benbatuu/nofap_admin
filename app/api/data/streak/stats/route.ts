import { NextRequest, NextResponse } from 'next/server';
import { StreakAnalyticsService } from '@/lib/services/streak-analytics.service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || undefined;
        const isActive = searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined;
        const minDays = searchParams.get('minDays') ? parseInt(searchParams.get('minDays')!) : undefined;
        const maxDays = searchParams.get('maxDays') ? parseInt(searchParams.get('maxDays')!) : undefined;

        const stats = await StreakAnalyticsService.getStreakStats({
            userId,
            isActive,
            minDays,
            maxDays
        });

        return NextResponse.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Streak stats API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch streak stats' },
            { status: 500 }
        );
    }
}
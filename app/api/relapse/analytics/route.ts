import { NextRequest, NextResponse } from 'next/server';
import { RelapseService } from '@/lib/services/relapse.service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || undefined;
        const timeFilter = searchParams.get('timeFilter') as 'all' | 'today' | 'week' | 'month' | undefined;
        const severityFilter = searchParams.get('severityFilter') as 'all' | 'low' | 'medium' | 'high' | undefined;

        const analytics = await RelapseService.getRelapseAnalytics({
            userId,
            timeFilter,
            severityFilter
        });

        return NextResponse.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Relapse analytics API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch relapse analytics' },
            { status: 500 }
        );
    }
}
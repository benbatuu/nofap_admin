import { NextRequest, NextResponse } from 'next/server';
import { RelapseService } from '@/lib/services';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || undefined;
        const timeFilter = searchParams.get('timeFilter') as 'all' | 'today' | 'week' | 'month' | undefined;
        const severityFilter = searchParams.get('severityFilter') as 'all' | 'low' | 'medium' | 'high' | undefined;

        const stats = await RelapseService.getRelapseStats({
            userId,
            timeFilter,
            severityFilter
        });

        return NextResponse.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Relapse stats API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch relapse statistics' },
            { status: 500 }
        );
    }
}
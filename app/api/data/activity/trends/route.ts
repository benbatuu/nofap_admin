import { NextRequest, NextResponse } from 'next/server';
import { ActivityAnalyticsService } from '@/lib/services/activity-analytics.service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        // Validation
        if (days < 1 || days > 365) {
            return NextResponse.json(
                { success: false, error: 'Days must be between 1 and 365' },
                { status: 400 }
            );
        }

        const trends = await ActivityAnalyticsService.getActivityTrends(days);

        return NextResponse.json({
            success: true,
            data: trends
        });
    } catch (error) {
        console.error('Activity trends API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch activity trends' },
            { status: 500 }
        );
    }
}
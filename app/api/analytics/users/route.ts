import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'growth'
        const days = parseInt(searchParams.get('days') || '30')

        // Validate parameters
        const validTypes = ['growth', 'activity', 'engagement', 'leaderboard']
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { success: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
                { status: 400 }
            )
        }

        if (days < 1 || days > 365) {
            return NextResponse.json(
                { success: false, error: 'Days must be between 1 and 365' },
                { status: 400 }
            )
        }

        let data

        switch (type) {
            case 'growth':
                data = await UserService.getUserGrowthStats(days)
                break
            case 'activity':
                data = await UserService.getUserActivityStats()
                break
            case 'engagement':
                data = await UserService.getUserEngagementMetrics()
                break
            case 'leaderboard':
                const limit = parseInt(searchParams.get('limit') || '10')
                data = await UserService.getStreakLeaderboard(limit)
                break
            default:
                data = await UserService.getUserStats()
        }

        return NextResponse.json({
            success: true,
            data: {
                type,
                period: type === 'leaderboard' ? 'current' : `${days} days`,
                generatedAt: new Date().toISOString(),
                analytics: data
            }
        })
    } catch (error) {
        console.error('User analytics API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user analytics' },
            { status: 500 }
        )
    }
}
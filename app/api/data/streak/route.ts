import { NextRequest, NextResponse } from 'next/server'
import { StreakService } from '@/lib/services/streak.service'

function logRequest(method: string, url: string, params?: any) {
    console.log(`[${new Date().toISOString()}] ${method} ${url}`, params ? { params } : '')
}

function logResponse(method: string, url: string, success: boolean, duration: number) {
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${success ? 'SUCCESS' : 'ERROR'} (${duration}ms)`)
}

export async function GET(request: NextRequest) {
    const startTime = Date.now()
    const url = request.url

    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId') || undefined
        const timeFilter = searchParams.get('timeFilter') as 'all' | 'today' | 'week' | 'month' | undefined
        const limit = parseInt(searchParams.get('limit') || '100')

        logRequest('GET', url, { userId, timeFilter, limit })

        const result = await StreakService.getStreakAnalytics({
            userId,
            timeFilter,
            limit
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Streak Analytics API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch streak analytics' },
            { status: 500 }
        )
    }
}
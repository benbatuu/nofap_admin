import { NextRequest, NextResponse } from 'next/server'
import { ScheduledNotificationService } from '@/lib/services'

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
        const timeFilter = searchParams.get('timeFilter') as 'today' | 'week' | 'month' | 'all' | null
        const status = searchParams.get('status') as 'active' | 'paused' | 'completed' | null

        logRequest('GET', url, { timeFilter, status })

        const result = await ScheduledNotificationService.getScheduledNotificationAnalytics({
            timeFilter: timeFilter || 'all',
            status: status || undefined
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Scheduled Notification Analytics API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch scheduled notification analytics' },
            { status: 500 }
        )
    }
}
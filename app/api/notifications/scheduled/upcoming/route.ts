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
        const hours = parseInt(searchParams.get('hours') || '24')
        const limit = parseInt(searchParams.get('limit') || '10')

        logRequest('GET', url, { hours, limit })

        const result = await ScheduledNotificationService.getUpcomingNotifications({
            hours,
            limit
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Upcoming Notifications API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch upcoming notifications' },
            { status: 500 }
        )
    }
}
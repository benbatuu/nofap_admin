import { NextRequest, NextResponse } from 'next/server'
import { NotificationLogService } from '@/lib/services'

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
        const dateRange = searchParams.get('dateRange')

        logRequest('GET', url, { dateRange })

        const filters = dateRange ? { dateRange: JSON.parse(dateRange) } : undefined
        const result = await NotificationLogService.getNotificationLogAnalytics(filters)

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Notification Log Analytics API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch notification log analytics' },
            { status: 500 }
        )
    }
} 
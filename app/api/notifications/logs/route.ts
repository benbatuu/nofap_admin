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
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const status = searchParams.get('status') as 'sent' | 'delivered' | 'read' | 'clicked' | 'failed' | null
        const type = searchParams.get('type') as 'motivation' | 'dailyReminder' | 'marketing' | 'system' | null
        const search = searchParams.get('search') || undefined
        const dateRange = searchParams.get('dateRange') || undefined

        logRequest('GET', url, { page, limit, status, type, search, dateRange })

        const result = await NotificationLogService.getNotificationLogs({
            page,
            limit,
            status: status || undefined,
            type: type || undefined,
            search,
            dateRange: dateRange ? JSON.parse(dateRange) : undefined
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Notification Logs API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch notification logs' },
            { status: 500 }
        )
    }
} 
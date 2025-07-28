import { NextRequest, NextResponse } from 'next/server'
import { NotificationSendService } from '@/lib/services'

function logRequest(method: string, url: string, params?: any) {
    console.log(`[${new Date().toISOString()}] ${method} ${url}`, params ? { params } : '')
}

function logResponse(method: string, url: string, success: boolean, duration: number) {
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${success ? 'SUCCESS' : 'ERROR'} (${duration}ms)`)
}

export async function GET(request: NextRequest) {
    const startTime = Date.now()
    const url = request.url

    console.log("Burası Çalıştı",`[${new Date().toISOString()}] GET ${url}`)
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const status = searchParams.get('status') as 'sent' | 'scheduled' | 'failed' | null
        const type = searchParams.get('type') as 'immediate' | 'scheduled' | 'targeted' | null
        const search = searchParams.get('search') || undefined

        logRequest('GET', url, { page, limit, status, type, search })

        const result = await NotificationSendService.getSentNotifications({
            page,
            limit,
            status: status || undefined,
            type: type || undefined,
            search
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Notification Send API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch sent notifications' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    const startTime = Date.now()
    const url = request.url

    try {
        const data = await request.json()

        logRequest('POST', url, data)

        const result = await NotificationSendService.sendNotification(data)

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Notification Send API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to send notification' },
            { status: 500 }
        )
    }
}
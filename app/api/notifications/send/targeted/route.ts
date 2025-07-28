import { NextRequest, NextResponse } from 'next/server'
import { NotificationSendService } from '@/lib/services'

function logRequest(method: string, url: string, params?: any) {
    console.log(`[${new Date().toISOString()}] ${method} ${url}`, params ? { params } : '')
}

function logResponse(method: string, url: string, success: boolean, duration: number) {
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${success ? 'SUCCESS' : 'ERROR'} (${duration}ms)`)
}

export async function POST(request: NextRequest) {
    const startTime = Date.now()
    const url = request.url

    try {
        const data = await request.json()

        logRequest('POST', url, data)

        const result = await NotificationSendService.sendTargetedNotification(data)

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Targeted Notification API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to send targeted notification' },
            { status: 500 }
        )
    }
}
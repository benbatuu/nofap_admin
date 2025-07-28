import { NextRequest, NextResponse } from 'next/server'
import { ScheduledNotificationService } from '@/lib/services'

function logRequest(method: string, url: string, params?: any) {
    console.log(`[${new Date().toISOString()}] ${method} ${url}`, params ? { params } : '')
}

function logResponse(method: string, url: string, success: boolean, duration: number) {
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${success ? 'SUCCESS' : 'ERROR'} (${duration}ms)`)
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const startTime = Date.now()
    const url = request.url

    try {
        const { id } = params

        logRequest('GET', url, { id })

        const result = await ScheduledNotificationService.getScheduledNotificationById(id)

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Scheduled Notification API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch scheduled notification' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const startTime = Date.now()
    const url = request.url

    try {
        const { id } = params
        const data = await request.json()

        logRequest('PUT', url, { id, data })

        const result = await ScheduledNotificationService.updateScheduledNotification(id, data)

        logResponse('PUT', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('PUT', url, false, Date.now() - startTime)
        console.error('Scheduled Notification API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update scheduled notification' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const startTime = Date.now()
    const url = request.url

    try {
        const { id } = params

        logRequest('DELETE', url, { id })

        await ScheduledNotificationService.deleteScheduledNotification(id)

        logResponse('DELETE', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: { message: 'Scheduled notification deleted successfully' }
        })
    } catch (error) {
        logResponse('DELETE', url, false, Date.now() - startTime)
        console.error('Scheduled Notification API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete scheduled notification' },
            { status: 500 }
        )
    }
}
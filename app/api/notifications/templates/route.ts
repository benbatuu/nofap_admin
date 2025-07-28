import { NextRequest, NextResponse } from 'next/server'
import { NotificationTemplateService } from '@/lib/services'

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
        const type = searchParams.get('type') as 'motivation' | 'dailyReminder' | 'marketing' | 'system' | null
        const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined
        const search = searchParams.get('search') || undefined

        logRequest('GET', url, { page, limit, type, isActive, search })

        const result = await NotificationTemplateService.getNotificationTemplates({
            page,
            limit,
            type: type || undefined,
            isActive,
            search
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Notification Templates API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch notification templates' },
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

        const result = await NotificationTemplateService.createNotificationTemplate(data)

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Notification Templates API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create notification template' },
            { status: 500 }
        )
    }
}
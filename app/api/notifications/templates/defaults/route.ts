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
        logRequest('GET', url)

        const result = await NotificationTemplateService.getDefaultTemplates()

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Default Notification Templates API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch default notification templates' },
            { status: 500 }
        )
    }
} 
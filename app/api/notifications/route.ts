import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/services'

// Request/Response logging
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
        const type = searchParams.get('type') as any
        const status = searchParams.get('status') as any
        const targetGroup = searchParams.get('targetGroup') || undefined
        const search = searchParams.get('search') || undefined

        // Validation
        if (page < 1) {
            return NextResponse.json(
                { success: false, error: 'Page must be greater than 0' },
                { status: 400 }
            )
        }

        if (limit < 1 || limit > 100) {
            return NextResponse.json(
                { success: false, error: 'Limit must be between 1 and 100' },
                { status: 400 }
            )
        }

        // Validate enum values
        const validTypes = ['motivation', 'dailyReminder', 'marketing', 'system']
        const validStatuses = ['active', 'paused', 'completed', 'cancelled']

        if (type && !validTypes.includes(type)) {
            return NextResponse.json(
                { success: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
                { status: 400 }
            )
        }

        if (status && !validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            )
        }

        logRequest('GET', url, { page, limit, type, status, targetGroup, search })

        const result = await NotificationService.getNotifications({
            page,
            limit,
            type,
            status,
            targetGroup,
            search
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Notifications API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    const startTime = Date.now()
    const url = request.url
    
    try {
        const data = await request.json()
        
        logRequest('POST', url, { title: data.title, type: data.type, targetGroup: data.targetGroup })

        // Validate input data
        const validationErrors = NotificationService.validateNotificationData(data)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        // Required fields validation
        const requiredFields = ['title', 'message', 'type', 'targetGroup', 'scheduledAt', 'frequency']
        const missingFields = requiredFields.filter(field => !data[field])
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            )
        }

        // Validate date format
        const scheduledAt = new Date(data.scheduledAt)
        if (isNaN(scheduledAt.getTime())) {
            return NextResponse.json(
                { success: false, error: 'Invalid scheduled date format' },
                { status: 400 }
            )
        }

        const notification = await NotificationService.createNotification({
            ...data,
            scheduledAt
        })

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: notification,
            message: 'Notification created successfully'
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Create notification API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create notification' },
            { status: 500 }
        )
    }
}
import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services'

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
        const userId = searchParams.get('userId') || undefined
        const search = searchParams.get('search') || undefined
        const category = searchParams.get('category') || undefined
        const priority = searchParams.get('priority') as any
        const isScheduled = searchParams.get('isScheduled') === 'true' ? true : searchParams.get('isScheduled') === 'false' ? false : undefined
        const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
        const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined
        const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined

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
        const validTypes = ['feedback', 'support', 'bug', 'system']
        const validStatuses = ['pending', 'read', 'replied']

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

        logRequest('GET', url, { page, limit, type, status, userId, search, category, priority, isScheduled })

        const result = await MessageService.getMessages({
            page,
            limit,
            type,
            status,
            userId,
            search,
            category,
            priority,
            isScheduled,
            dateFrom,
            dateTo,
            tags
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Messages API Error:', error)
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
        
        logRequest('POST', url, { sender: data.sender, type: data.type, title: data.title })

        // Validate input data
        const validationErrors = MessageService.validateMessageData(data)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        // Required fields validation
        if (!data.sender || !data.title || !data.message || !data.type) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: sender, title, message, type' },
                { status: 400 }
            )
        }

        const message = await MessageService.createMessage(data)

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: message,
            message: 'Message created successfully'
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Create message API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create message' },
            { status: 500 }
        )
    }
}
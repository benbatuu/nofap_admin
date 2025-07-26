import { NextRequest, NextResponse } from 'next/server'
import { AdService } from '@/lib/services'

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
        const placement = searchParams.get('placement') || undefined
        const search = searchParams.get('search') || undefined
        const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
        const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined

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
        const validTypes = ['banner', 'popup', 'native', 'video']
        const validStatuses = ['active', 'paused', 'completed', 'rejected']

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

        logRequest('GET', url, { page, limit, type, status, placement, search, dateFrom, dateTo })

        const result = await AdService.getAds({
            page,
            limit,
            type,
            status,
            placement,
            search,
            dateFrom,
            dateTo
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Ads API Error:', error)
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
        
        logRequest('POST', url, { title: data.title, type: data.type, placement: data.placement })

        // Validate input data
        const validationErrors = AdService.validateAdData(data)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        // Required fields validation
        const requiredFields = ['title', 'description', 'targetUrl', 'type', 'placement', 'targeting', 'startDate']
        const missingFields = requiredFields.filter(field => !data[field])
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            )
        }

        // Validate date format
        const startDate = new Date(data.startDate)
        if (isNaN(startDate.getTime())) {
            return NextResponse.json(
                { success: false, error: 'Invalid start date format' },
                { status: 400 }
            )
        }

        const endDate = data.endDate ? new Date(data.endDate) : undefined
        if (endDate && isNaN(endDate.getTime())) {
            return NextResponse.json(
                { success: false, error: 'Invalid end date format' },
                { status: 400 }
            )
        }

        const ad = await AdService.createAd({
            ...data,
            startDate,
            endDate
        })

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: ad,
            message: 'Ad created successfully'
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Create ad API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create ad' },
            { status: 500 }
        )
    }
}
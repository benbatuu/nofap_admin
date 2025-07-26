import { NextRequest, NextResponse } from 'next/server'
import { BillingService } from '@/lib/services'

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
        const status = searchParams.get('status') as any
        const userId = searchParams.get('userId') || undefined
        const paymentMethod = searchParams.get('paymentMethod') || undefined
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
        const validStatuses = ['success', 'pending', 'failed']

        if (status && !validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            )
        }

        // Validate date formats
        if (dateFrom && isNaN(dateFrom.getTime())) {
            return NextResponse.json(
                { success: false, error: 'Invalid dateFrom format' },
                { status: 400 }
            )
        }

        if (dateTo && isNaN(dateTo.getTime())) {
            return NextResponse.json(
                { success: false, error: 'Invalid dateTo format' },
                { status: 400 }
            )
        }

        logRequest('GET', url, { page, limit, status, userId, paymentMethod, search, dateFrom, dateTo })

        const result = await BillingService.getBillingLogs({
            page,
            limit,
            status,
            userId,
            paymentMethod,
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
        console.error('Billing API Error:', error)
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
        
        logRequest('POST', url, { userId: data.userId, amount: data.amount, paymentMethod: data.paymentMethod })

        // Validate input data
        const validationErrors = BillingService.validateBillingData(data)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        // Required fields validation
        const requiredFields = ['userId', 'userName', 'amount', 'currency', 'paymentMethod', 'description']
        const missingFields = requiredFields.filter(field => !data[field])
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            )
        }

        const billingLog = await BillingService.createBillingLog(data)

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: billingLog,
            message: 'Billing log created successfully'
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Create billing log API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create billing log' },
            { status: 500 }
        )
    }
}
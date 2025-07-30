import { NextRequest, NextResponse } from 'next/server'
import { BillingService } from '@/lib/services'
import { BillingStatus } from '@/lib/generated/prisma'

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
        const status = searchParams.get('status') as BillingStatus | null
        const userId = searchParams.get('userId') || undefined
        const paymentMethod = searchParams.get('paymentMethod') || undefined
        const search = searchParams.get('search') || undefined
        const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
        const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined

        logRequest('GET', url, { page, limit, status, userId, paymentMethod, search, dateFrom, dateTo })

        const result = await BillingService.getBillingLogs({
            page,
            limit,
            status: status || undefined,
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
        console.error('Billing Logs API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch billing logs' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    const startTime = Date.now()
    const url = request.url

    try {
        const body = await request.json()
        logRequest('POST', url, body)

        // Validate data
        const errors = BillingService.validateBillingData(body)
        if (errors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: errors },
                { status: 400 }
            )
        }

        const result = await BillingService.createBillingLog(body)

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Create Billing Log API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create billing log' },
            { status: 500 }
        )
    }
}
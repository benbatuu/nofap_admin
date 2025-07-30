import { NextRequest, NextResponse } from 'next/server'
import { BillingService } from '@/lib/services'

function logRequest(method: string, url: string, params?: any) {
    console.log(`[${new Date().toISOString()}] ${method} ${url}`, params ? { params } : '')
}

function logResponse(method: string, url: string, success: boolean, duration: number) {
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${success ? 'SUCCESS' : 'ERROR'} (${duration}ms)`)
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const startTime = Date.now()
    const url = request.url

    try {
        const { id } = await params
        logRequest('GET', url, { id })

        const billingLog = await BillingService.getBillingLogById(id)

        if (!billingLog) {
            logResponse('GET', url, false, Date.now() - startTime)
            return NextResponse.json(
                { success: false, error: 'Billing log not found' },
                { status: 404 }
            )
        }

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: billingLog
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Get Billing Log API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch billing log' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const startTime = Date.now()
    const url = request.url

    try {
        const { id } = await params
        const body = await request.json()
        logRequest('PUT', url, { id, ...body })

        // Validate data
        const errors = BillingService.validateBillingData(body)
        if (errors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: errors },
                { status: 400 }
            )
        }

        const billingLog = await BillingService.updateBillingLog(id, body)

        logResponse('PUT', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: billingLog
        })
    } catch (error) {
        logResponse('PUT', url, false, Date.now() - startTime)
        console.error('Update Billing Log API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update billing log' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const startTime = Date.now()
    const url = request.url

    try {
        const { id } = await params
        logRequest('DELETE', url, { id })

        await BillingService.deleteBillingLog(id)

        logResponse('DELETE', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            message: 'Billing log deleted successfully'
        })
    } catch (error) {
        logResponse('DELETE', url, false, Date.now() - startTime)
        console.error('Delete Billing Log API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete billing log' },
            { status: 500 }
        )
    }
}
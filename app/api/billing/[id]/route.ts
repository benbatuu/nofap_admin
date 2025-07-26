import { NextRequest, NextResponse } from 'next/server'
import { BillingService } from '@/lib/services'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const billingLog = await BillingService.getBillingLogById(params.id)

        if (!billingLog) {
            return NextResponse.json(
                { success: false, error: 'Billing log not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: billingLog
        })
    } catch (error) {
        console.error('Billing GET API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        
        // Validate input data
        const validationErrors = BillingService.validateBillingData(body)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        const updatedBillingLog = await BillingService.updateBillingLog(params.id, body)

        if (!updatedBillingLog) {
            return NextResponse.json(
                { success: false, error: 'Billing log not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: updatedBillingLog,
            message: 'Billing log updated successfully'
        })
    } catch (error) {
        console.error('Billing PUT API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const deletedBillingLog = await BillingService.deleteBillingLog(params.id)

        if (!deletedBillingLog) {
            return NextResponse.json(
                { success: false, error: 'Billing log not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: deletedBillingLog,
            message: 'Billing log deleted successfully'
        })
    } catch (error) {
        console.error('Billing DELETE API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
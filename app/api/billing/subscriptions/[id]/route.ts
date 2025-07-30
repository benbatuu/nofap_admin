import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/services'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const subscription = await SubscriptionService.getSubscriptionById(params.id)

        if (!subscription) {
            return NextResponse.json(
                { success: false, error: 'Abonelik bulunamadı' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: subscription
        })
    } catch (error) {
        console.error('Error fetching subscription:', error)
        return NextResponse.json(
            { success: false, error: 'Abonelik alınırken hata oluştu' },
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

        const subscription = await SubscriptionService.updateSubscription(params.id, body)

        return NextResponse.json({
            success: true,
            data: subscription
        })
    } catch (error) {
        console.error('Error updating subscription:', error)
        return NextResponse.json(
            { success: false, error: 'Abonelik güncellenirken hata oluştu' },
            { status: 500 }
        )
    }
}
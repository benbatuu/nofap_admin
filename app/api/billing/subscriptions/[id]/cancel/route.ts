import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/services'

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const subscription = await SubscriptionService.cancelSubscription(params.id)

        return NextResponse.json({
            success: true,
            data: subscription
        })
    } catch (error) {
        console.error('Error cancelling subscription:', error)
        return NextResponse.json(
            { success: false, error: 'Abonelik iptal edilirken hata oluştu' },
            { status: 500 }
        )
    }
}
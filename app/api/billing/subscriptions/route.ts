import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || undefined
        const status = searchParams.get('status') as 'active' | 'cancelled' | 'expired' | 'pending' | undefined
        const userId = searchParams.get('userId') || undefined

        const result = await SubscriptionService.getSubscriptions({
            page,
            limit,
            search,
            status: status && status !== 'all' ? status : undefined,
            userId
        })

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.error('Error fetching subscriptions:', error)
        return NextResponse.json(
            { success: false, error: 'Abonelikler alınırken hata oluştu' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, productId, paymentMethod, startDate, endDate } = body

        if (!userId || !productId || !paymentMethod) {
            return NextResponse.json(
                { success: false, error: 'Gerekli alanlar eksik' },
                { status: 400 }
            )
        }

        const subscription = await SubscriptionService.createSubscription({
            userId,
            productId,
            paymentMethod,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        })

        return NextResponse.json({
            success: true,
            data: subscription
        })
    } catch (error) {
        console.error('Error creating subscription:', error)
        return NextResponse.json(
            { success: false, error: 'Abonelik oluşturulurken hata oluştu' },
            { status: 500 }
        )
    }
}
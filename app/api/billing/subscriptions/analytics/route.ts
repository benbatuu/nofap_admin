import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const timeFilter = searchParams.get('timeFilter') || 'month'

        const analytics = await SubscriptionService.getSubscriptionAnalytics({ timeFilter })

        return NextResponse.json({
            success: true,
            data: analytics
        })
    } catch (error) {
        console.error('Error fetching subscription analytics:', error)
        return NextResponse.json(
            { success: false, error: 'Abonelik analizi alınırken hata oluştu' },
            { status: 500 }
        )
    }
}
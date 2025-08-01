import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const timeFilter = searchParams.get('timeFilter') || 'month'

        const analytics = await ProductService.getProductAnalytics()

        return NextResponse.json({
            success: true,
            data: analytics
        })
    } catch (error) {
        console.error('Error fetching product analytics:', error)
        return NextResponse.json(
            { success: false, error: 'Ürün analizi alınırken hata oluştu' },
            { status: 500 }
        )
    }
}
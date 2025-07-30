import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const suggestions = await ProductService.getProductSuggestions()

        return NextResponse.json({
            success: true,
            data: suggestions
        })
    } catch (error) {
        console.error('Error generating product suggestions:', error)
        return NextResponse.json(
            { success: false, error: 'Ürün önerileri oluşturulurken hata oluştu' },
            { status: 500 }
        )
    }
}
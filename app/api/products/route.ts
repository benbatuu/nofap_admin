import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const type = searchParams.get('type') as any
        const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined
        const search = searchParams.get('search') || undefined
        const priceMin = searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : undefined
        const priceMax = searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : undefined

        const result = await ProductService.getProducts({
            page,
            limit,
            type,
            isActive,
            search,
            priceMin,
            priceMax
        })

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.error('Products API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        
        const product = await ProductService.createProduct(data)

        return NextResponse.json({
            success: true,
            data: product,
            message: 'Product created successfully'
        })
    } catch (error) {
        console.error('Create product API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create product' },
            { status: 500 }
        )
    }
}
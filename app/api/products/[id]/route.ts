import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const product = await ProductService.getProductById(params.id)

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: product
        })
    } catch (error) {
        console.error('Product GET API Error:', error)
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

        const updatedProduct = await ProductService.updateProduct(params.id, body)

        if (!updatedProduct) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: updatedProduct,
            message: 'Product updated successfully'
        })
    } catch (error) {
        console.error('Product PUT API Error:', error)
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
        const deletedProduct = await ProductService.deleteProduct(params.id)

        if (!deletedProduct) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: deletedProduct,
            message: 'Product deleted successfully'
        })
    } catch (error) {
        console.error('Product DELETE API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
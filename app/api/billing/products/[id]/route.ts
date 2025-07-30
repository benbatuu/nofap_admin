import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services'

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

        const product = await ProductService.getProductById(id)

        if (!product) {
            logResponse('GET', url, false, Date.now() - startTime)
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            )
        }

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: product
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Get Product API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch product' },
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

        const product = await ProductService.updateProduct(id, body)

        logResponse('PUT', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: product
        })
    } catch (error) {
        logResponse('PUT', url, false, Date.now() - startTime)
        console.error('Update Product API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update product' },
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

        await ProductService.deleteProduct(id)

        logResponse('DELETE', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully'
        })
    } catch (error) {
        logResponse('DELETE', url, false, Date.now() - startTime)
        console.error('Delete Product API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete product' },
            { status: 500 }
        )
    }
}
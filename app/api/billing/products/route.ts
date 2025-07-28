import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services'

function logRequest(method: string, url: string, params?: any) {
    console.log(`[${new Date().toISOString()}] ${method} ${url}`, params ? { params } : '')
}

function logResponse(method: string, url: string, success: boolean, duration: number) {
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${success ? 'SUCCESS' : 'ERROR'} (${duration}ms)`)
}

export async function GET(request: NextRequest) {
    const startTime = Date.now()
    const url = request.url

    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || undefined
        const status = searchParams.get('status') as 'active' | 'inactive' | null

        logRequest('GET', url, { page, limit, search, status })

        const result = await ProductService.getProducts({
            page,
            limit,
            search,
            status: status || undefined
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Products API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    const startTime = Date.now()
    const url = request.url

    try {
        const body = await request.json()
        logRequest('POST', url, body)

        const result = await ProductService.createProduct(body)

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Create Product API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create product' },
            { status: 500 }
        )
    }
} 
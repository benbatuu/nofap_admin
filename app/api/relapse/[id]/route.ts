import { NextRequest, NextResponse } from 'next/server'
import { RelapseService } from '@/lib/services'

function logRequest(method: string, url: string, params?: any) {
    console.log(`[${new Date().toISOString()}] ${method} ${url}`, params ? { params } : '')
}

function logResponse(method: string, url: string, success: boolean, duration: number) {
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${success ? 'SUCCESS' : 'ERROR'} (${duration}ms)`)
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const startTime = Date.now()
    const url = request.url

    try {
        const { id } = params

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            )
        }

        logRequest('GET', url, { id })

        const result = await RelapseService.getRelapseById(id)

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Relapse API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch relapse' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const startTime = Date.now()
    const url = request.url

    try {
        const { id } = params
        const data = await request.json()

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            )
        }

        logRequest('PUT', url, { id, data })

        const result = await RelapseService.updateRelapse(id, data)

        logResponse('PUT', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('PUT', url, false, Date.now() - startTime)
        console.error('Relapse API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update relapse' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const startTime = Date.now()
    const url = request.url

    try {
        const { id } = params

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            )
        }

        logRequest('DELETE', url, { id })

        const result = await RelapseService.deleteRelapse(id)

        logResponse('DELETE', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('DELETE', url, false, Date.now() - startTime)
        console.error('Relapse API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete relapse' },
            { status: 500 }
        )
    }
}
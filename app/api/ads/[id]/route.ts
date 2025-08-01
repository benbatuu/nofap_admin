import { NextRequest, NextResponse } from 'next/server'
import { AdService } from '@/lib/services/ad.service'

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

        const ad = await AdService.getAdById(id)

        if (!ad) {
            logResponse('GET', url, false, Date.now() - startTime)
            return NextResponse.json(
                { success: false, error: 'Ad not found' },
                { status: 404 }
            )
        }

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: ad
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Get Ad API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch ad' },
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

        // Validate data
        const errors = AdService.validateAdData(body)
        if (errors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: errors },
                { status: 400 }
            )
        }

        const ad = await AdService.updateAd(id, body)

        logResponse('PUT', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: ad
        })
    } catch (error) {
        logResponse('PUT', url, false, Date.now() - startTime)
        console.error('Update Ad API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update ad' },
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

        await AdService.deleteAd(id)

        logResponse('DELETE', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            message: 'Ad deleted successfully'
        })
    } catch (error) {
        logResponse('DELETE', url, false, Date.now() - startTime)
        console.error('Delete Ad API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete ad' },
            { status: 500 }
        )
    }
}
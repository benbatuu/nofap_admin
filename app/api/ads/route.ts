import { NextRequest, NextResponse } from 'next/server'
import { AdService } from '@/lib/services/ad.service'
import { AdType, AdStatus } from '@/lib/generated/prisma'

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
        const status = searchParams.get('status') as AdStatus | null
        const type = searchParams.get('type') as AdType | null
        const placement = searchParams.get('placement') || undefined
        const search = searchParams.get('search') || undefined

        logRequest('GET', url, { page, limit, status, type, placement, search })

        const result = await AdService.getAds({
            page,
            limit,
            status: status || undefined,
            type: type || undefined,
            placement,
            search
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Ads API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch ads' },
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

        // Validate data
        const errors = AdService.validateAdData(body)
        if (errors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: errors },
                { status: 400 }
            )
        }

        const result = await AdService.createAd(body)

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Create Ad API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create ad' },
            { status: 500 }
        )
    }
}
import { NextRequest, NextResponse } from 'next/server'
import { AdService } from '@/lib/services/ad.service'

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
        logRequest('GET', url)

        const [analytics, performance, typeBreakdown, placementBreakdown] = await Promise.all([
            AdService.getAdAnalytics(),
            AdService.getAdPerformance(),
            AdService.getAdsByType(),
            AdService.getAdsByPlacement()
        ])

        const result = {
            overview: analytics,
            performance,
            breakdown: {
                byType: typeBreakdown.map(item => ({
                    type: item.type,
                    count: item._count.type,
                    impressions: item._sum.impressions || 0,
                    clicks: item._sum.clicks || 0,
                    spent: item._sum.spent || 0,
                    ctr: item._sum.impressions ? ((item._sum.clicks || 0) / item._sum.impressions) * 100 : 0
                })),
                byPlacement: placementBreakdown.map(item => ({
                    placement: item.placement,
                    count: item._count.placement,
                    impressions: item._sum.impressions || 0,
                    clicks: item._sum.clicks || 0,
                    spent: item._sum.spent || 0,
                    ctr: item._sum.impressions ? ((item._sum.clicks || 0) / item._sum.impressions) * 100 : 0
                }))
            }
        }

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Ad Analytics API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch ad analytics' },
            { status: 500 }
        )
    }
}
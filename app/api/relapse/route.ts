import { NextRequest, NextResponse } from 'next/server'
import { RelapseService } from '@/lib/services'

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
        const timeFilter = searchParams.get('timeFilter') as 'all' | 'today' | 'week' | 'month' | null
        const severityFilter = searchParams.get('severityFilter') as 'all' | 'low' | 'medium' | 'high' | null

        // Validation
        if (page < 1) {
            return NextResponse.json(
                { success: false, error: 'Page must be greater than 0' },
                { status: 400 }
            )
        }

        if (limit < 1 || limit > 100) {
            return NextResponse.json(
                { success: false, error: 'Limit must be between 1 and 100' },
                { status: 400 }
            )
        }

        logRequest('GET', url, { page, limit, timeFilter, severityFilter })

        const result = await RelapseService.getRelapses({
            page,
            limit,
            timeFilter: timeFilter || undefined,
            severityFilter: severityFilter || undefined
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Relapses API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch relapses' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    const startTime = Date.now()
    const url = request.url

    try {
        const data = await request.json()

        logRequest('POST', url, data)

        const result = await RelapseService.createRelapse(data)

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Relapses API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create relapse' },
            { status: 500 }
        )
    }
}

// PUT method removed from main route - use /relapse/[id] endpoint instead

// DELETE method removed from main route - use /relapse/[id] endpoint instead
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

        const suggestions = await AdService.getAdSuggestions()

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: suggestions
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Ad Suggestions API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch ad suggestions' },
            { status: 500 }
        )
    }
}
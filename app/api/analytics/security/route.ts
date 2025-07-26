import { NextRequest, NextResponse } from 'next/server'
import { SecurityService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'overview'
        const days = parseInt(searchParams.get('days') || '30')

        // Validate parameters
        const validTypes = ['overview', 'trends', 'threats', 'events']
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { success: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
                { status: 400 }
            )
        }

        if (days < 1 || days > 365) {
            return NextResponse.json(
                { success: false, error: 'Days must be between 1 and 365' },
                { status: 400 }
            )
        }

        let data

        switch (type) {
            case 'overview':
                data = await SecurityService.getSecurityStats()
                break
            case 'trends':
                data = await SecurityService.getSecurityAnalytics(days)
                break
            case 'threats':
                const limit = parseInt(searchParams.get('limit') || '10')
                data = await SecurityService.getTopThreatIPs(limit)
                break
            case 'events':
                data = await SecurityService.getEventTypeDistribution()
                break
            default:
                data = await SecurityService.getSecurityStats()
        }

        return NextResponse.json({
            success: true,
            data: {
                type,
                period: `${days} days`,
                generatedAt: new Date().toISOString(),
                analytics: data
            }
        })
    } catch (error) {
        console.error('Security analytics API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch security analytics' },
            { status: 500 }
        )
    }
}
import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')

        if (days < 1 || days > 365) {
            return NextResponse.json(
                { success: false, error: 'Days must be between 1 and 365' },
                { status: 400 }
            )
        }

        const analytics = await MessageService.getDetailedMessageAnalytics(days)

        return NextResponse.json({
            success: true,
            data: analytics
        })
    } catch (error) {
        console.error('Message analytics API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get analytics' },
            { status: 500 }
        )
    }
}
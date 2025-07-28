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

        const deliveryStats = await MessageService.getDeliveryStats(days)

        return NextResponse.json({
            success: true,
            data: deliveryStats
        })
    } catch (error) {
        console.error('Get delivery stats API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get delivery stats' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const { messageId } = await request.json()

        if (!messageId) {
            return NextResponse.json(
                { success: false, error: 'messageId is required' },
                { status: 400 }
            )
        }

        const updatedMessage = await MessageService.markMessageAsDelivered(messageId)

        return NextResponse.json({
            success: true,
            data: updatedMessage,
            message: 'Message marked as delivered'
        })
    } catch (error) {
        console.error('Mark message as delivered API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to mark message as delivered' },
            { status: 500 }
        )
    }
}
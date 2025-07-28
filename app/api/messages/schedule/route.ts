import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services'

export async function GET() {
    try {
        const scheduledMessages = await MessageService.getScheduledMessages()

        return NextResponse.json({
            success: true,
            data: scheduledMessages
        })
    } catch (error) {
        console.error('Get scheduled messages API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get scheduled messages' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        if (!data.scheduledAt) {
            return NextResponse.json(
                { success: false, error: 'scheduledAt is required for scheduling' },
                { status: 400 }
            )
        }

        // Validate input data
        const validationErrors = MessageService.validateMessageData(data)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        const scheduledMessage = await MessageService.scheduleMessage({
            ...data,
            scheduledAt: new Date(data.scheduledAt)
        })

        return NextResponse.json({
            success: true,
            data: scheduledMessage,
            message: 'Message scheduled successfully'
        })
    } catch (error) {
        console.error('Schedule message API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to schedule message' },
            { status: 500 }
        )
    }
}
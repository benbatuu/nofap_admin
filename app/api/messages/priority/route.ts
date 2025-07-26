import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const priority = searchParams.get('priority') as 'low' | 'medium' | 'high' | 'urgent'

        if (!priority || !['low', 'medium', 'high', 'urgent'].includes(priority)) {
            return NextResponse.json(
                { success: false, error: 'Invalid priority. Must be: low, medium, high, or urgent' },
                { status: 400 }
            )
        }

        const messages = await MessageService.getMessagesByPriority(priority)

        return NextResponse.json({
            success: true,
            data: messages
        })
    } catch (error) {
        console.error('Get messages by priority API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get messages by priority' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const { messageId, priority } = await request.json()

        if (!messageId || !priority || !['low', 'medium', 'high', 'urgent'].includes(priority)) {
            return NextResponse.json(
                { success: false, error: 'Invalid messageId or priority' },
                { status: 400 }
            )
        }

        const updatedMessage = await MessageService.setPriority(messageId, priority)

        return NextResponse.json({
            success: true,
            data: updatedMessage,
            message: 'Priority updated successfully'
        })
    } catch (error) {
        console.error('Set priority API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to set priority' },
            { status: 500 }
        )
    }
}
import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services'

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        
        const updatedMessage = await MessageService.markAsRead(id)

        if (!updatedMessage) {
            return NextResponse.json(
                { success: false, error: 'Message not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: updatedMessage,
            message: 'Message marked as read successfully'
        })
    } catch (error) {
        console.error('Mark as read API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to mark message as read' },
            { status: 500 }
        )
    }
}
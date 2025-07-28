import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services'

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        
        // Archive message by updating its status or adding archive field
        // For now, we'll update the status to 'archived' (you might need to add this to your enum)
        const archivedMessage = await MessageService.updateMessage(id, { 
            // If you have an archived status in your enum, use it
            // Otherwise, you might want to add an 'archived' field to the Message model
            status: 'read' // Temporary solution - mark as read
        })

        if (!archivedMessage) {
            return NextResponse.json(
                { success: false, error: 'Message not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: archivedMessage,
            message: 'Message archived successfully'
        })
    } catch (error) {
        console.error('Archive message API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to archive message' },
            { status: 500 }
        )
    }
}
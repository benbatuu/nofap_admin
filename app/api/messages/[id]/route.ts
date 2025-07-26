import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const message = await MessageService.getMessageById(params.id)

        if (!message) {
            return NextResponse.json(
                { success: false, error: 'Message not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: message
        })
    } catch (error) {
        console.error('Message GET API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        
        // Validate input data
        const validationErrors = MessageService.validateMessageData(body)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        const updatedMessage = await MessageService.updateMessage(params.id, body)

        if (!updatedMessage) {
            return NextResponse.json(
                { success: false, error: 'Message not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: updatedMessage,
            message: 'Message updated successfully'
        })
    } catch (error) {
        console.error('Message PUT API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const deletedMessage = await MessageService.deleteMessage(params.id)

        if (!deletedMessage) {
            return NextResponse.json(
                { success: false, error: 'Message not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: deletedMessage,
            message: 'Message deleted successfully'
        })
    } catch (error) {
        console.error('Message DELETE API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
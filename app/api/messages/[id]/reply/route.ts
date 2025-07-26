import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const data = await request.json()

        if (!data.replyText || !data.adminId || !data.adminName) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: replyText, adminId, adminName' },
                { status: 400 }
            )
        }

        const reply = await MessageService.createMessageReply({
            messageId: id,
            replyText: data.replyText,
            adminId: data.adminId,
            adminName: data.adminName
        })

        return NextResponse.json({
            success: true,
            data: reply,
            message: 'Reply sent successfully'
        })
    } catch (error) {
        console.error('Message reply API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to send reply' },
            { status: 500 }
        )
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const replies = await MessageService.getMessageReplies(id)

        return NextResponse.json({
            success: true,
            data: replies
        })
    } catch (error) {
        console.error('Get message replies API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get replies' },
            { status: 500 }
        )
    }
}
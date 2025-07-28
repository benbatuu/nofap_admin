import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services'

export async function GET() {
    try {
        const tags = await MessageService.getAllTags()

        return NextResponse.json({
            success: true,
            data: tags
        })
    } catch (error) {
        console.error('Get tags API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get tags' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const { messageId, tags, action = 'add' } = await request.json()

        if (!messageId || !Array.isArray(tags)) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: messageId, tags (array)' },
                { status: 400 }
            )
        }

        if (!['add', 'remove'].includes(action)) {
            return NextResponse.json(
                { success: false, error: 'Action must be either "add" or "remove"' },
                { status: 400 }
            )
        }

        const updatedMessage = action === 'add' 
            ? await MessageService.addTagsToMessage(messageId, tags)
            : await MessageService.removeTagsFromMessage(messageId, tags)

        return NextResponse.json({
            success: true,
            data: updatedMessage,
            message: `Tags ${action}ed successfully`
        })
    } catch (error) {
        console.error(`${action} tags API error:`, error)
        return NextResponse.json(
            { success: false, error: `Failed to ${action} tags` },
            { status: 500 }
        )
    }
}

// Get tags for a specific message
export async function PUT(request: NextRequest) {
    try {
        const { messageId } = await request.json()

        if (!messageId) {
            return NextResponse.json(
                { success: false, error: 'messageId is required' },
                { status: 400 }
            )
        }

        const tags = await MessageService.getMessageTags(messageId)

        return NextResponse.json({
            success: true,
            data: tags
        })
    } catch (error) {
        console.error('Get message tags API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get message tags' },
            { status: 500 }
        )
    }
}
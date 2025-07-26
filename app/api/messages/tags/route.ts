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
        const { messageId, tags } = await request.json()

        if (!messageId || !Array.isArray(tags)) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: messageId, tags (array)' },
                { status: 400 }
            )
        }

        const updatedMessage = await MessageService.addTagsToMessage(messageId, tags)

        return NextResponse.json({
            success: true,
            data: updatedMessage,
            message: 'Tags added successfully'
        })
    } catch (error) {
        console.error('Add tags API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to add tags' },
            { status: 500 }
        )
    }
}
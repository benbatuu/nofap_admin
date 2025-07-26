import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services'

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, messageIds, data } = body

        if (!action || !messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Action and messageIds array are required' },
                { status: 400 }
            )
        }

        let result

        switch (action) {
            case 'updateStatus':
                if (!data?.status) {
                    return NextResponse.json(
                        { success: false, error: 'Status is required for updateStatus action' },
                        { status: 400 }
                    )
                }
                result = await MessageService.bulkUpdateMessageStatus(messageIds, data.status)
                break

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action. Supported actions: updateStatus' },
                    { status: 400 }
                )
        }

        return NextResponse.json({
            success: true,
            data: result,
            message: `Bulk ${action} completed successfully for ${messageIds.length} messages`
        })
    } catch (error) {
        console.error('Bulk messages API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to perform bulk operation' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json()
        const { messageIds } = body

        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'messageIds array is required' },
                { status: 400 }
            )
        }

        const result = await MessageService.bulkDeleteMessages(messageIds)

        return NextResponse.json({
            success: true,
            data: result,
            message: `Successfully deleted ${messageIds.length} messages`
        })
    } catch (error) {
        console.error('Bulk delete messages API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete messages' },
            { status: 500 }
        )
    }
}
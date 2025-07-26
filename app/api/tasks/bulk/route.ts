import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/services'

export async function POST(request: NextRequest) {
    try {
        const { action, taskIds, data } = await request.json()

        if (!action || !Array.isArray(taskIds) || taskIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: action, taskIds (array)' },
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
                result = await TaskService.bulkUpdateTaskStatus(taskIds, data.status)
                break

            case 'assign':
                if (!data?.userId) {
                    return NextResponse.json(
                        { success: false, error: 'userId is required for assign action' },
                        { status: 400 }
                    )
                }
                result = await TaskService.bulkAssignTasks(taskIds, data.userId)
                break

            case 'delete':
                result = await TaskService.bulkDeleteTasks(taskIds)
                break

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action. Must be: updateStatus, assign, or delete' },
                    { status: 400 }
                )
        }

        return NextResponse.json({
            success: true,
            data: result,
            message: `Bulk ${action} completed successfully`
        })
    } catch (error) {
        console.error('Bulk task operation API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to perform bulk operation' },
            { status: 500 }
        )
    }
}
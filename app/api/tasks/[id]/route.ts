import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/services'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const task = await TaskService.getTaskById(params.id)

        if (!task) {
            return NextResponse.json(
                { success: false, error: 'Task not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: task
        })
    } catch (error) {
        console.error('Task GET API Error:', error)
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
        const validationErrors = TaskService.validateTaskData(body)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        const updatedTask = await TaskService.updateTask(params.id, body)

        if (!updatedTask) {
            return NextResponse.json(
                { success: false, error: 'Task not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: updatedTask,
            message: 'Task updated successfully'
        })
    } catch (error) {
        console.error('Task PUT API Error:', error)
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
        const deletedTask = await TaskService.deleteTask(params.id)

        if (!deletedTask) {
            return NextResponse.json(
                { success: false, error: 'Task not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: deletedTask,
            message: 'Task deleted successfully'
        })
    } catch (error) {
        console.error('Task DELETE API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
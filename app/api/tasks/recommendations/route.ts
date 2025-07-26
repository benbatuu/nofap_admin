import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const limit = parseInt(searchParams.get('limit') || '5')

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId is required' },
                { status: 400 }
            )
        }

        if (limit < 1 || limit > 20) {
            return NextResponse.json(
                { success: false, error: 'Limit must be between 1 and 20' },
                { status: 400 }
            )
        }

        const recommendations = await TaskService.getTaskRecommendations(userId, limit)

        return NextResponse.json({
            success: true,
            data: recommendations
        })
    } catch (error) {
        console.error('Task recommendations API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get recommendations' },
            { status: 500 }
        )
    }
}
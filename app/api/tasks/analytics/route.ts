import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')
        const userId = searchParams.get('userId') || undefined

        if (days < 1 || days > 365) {
            return NextResponse.json(
                { success: false, error: 'Days must be between 1 and 365' },
                { status: 400 }
            )
        }

        const [completionAnalytics, categoryPerformance, difficultyStats, productivityAnalytics] = await Promise.all([
            TaskService.getTaskCompletionAnalytics(days),
            TaskService.getTaskPerformanceByCategory(),
            TaskService.getTaskDifficultyStats(),
            TaskService.getTaskProductivityAnalytics(userId, days)
        ])

        return NextResponse.json({
            success: true,
            data: {
                completionAnalytics,
                categoryPerformance,
                difficultyStats,
                productivityAnalytics
            }
        })
    } catch (error) {
        console.error('Task analytics API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get analytics' },
            { status: 500 }
        )
    }
}
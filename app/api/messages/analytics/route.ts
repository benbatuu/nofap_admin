
import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')

        if (days < 1 || days > 365) {
            return NextResponse.json(
                { success: false, error: 'Days must be between 1 and 365' },
                { status: 400 }
            )
        }

        const [analytics, stats, deliveryStats, performanceMetrics, categories] = await Promise.all([
            MessageService.getMessageAnalytics(days),
            MessageService.getMessageStats(),
            MessageService.getDeliveryStats(days),
            MessageService.getMessagePerformanceMetrics(days),
            MessageService.getMessageCategories()
        ])
        
        const result = {
            dailyStats: analytics,
            stats: stats,
            deliveryStats: deliveryStats,
            performanceMetrics: performanceMetrics,
            categories: categories,
            responseTime: { avg_response_hours: 2.5, total_replied: stats.replied },
            typeDistribution: [
                { type: 'feedback', count: Math.floor(stats.total * 0.4) },
                { type: 'support', count: Math.floor(stats.total * 0.3) },
                { type: 'bug', count: Math.floor(stats.total * 0.2) },
                { type: 'system', count: Math.floor(stats.total * 0.1) }
            ]
        }

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.error('Message analytics API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get analytics' },
            { status: 500 }
        )
    }
}
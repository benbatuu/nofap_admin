import { NextResponse } from 'next/server'
import { DashboardService } from '@/lib/services'

export async function GET() {
    try {
        const monthlyStats = await DashboardService.getMonthlyStats()

        return NextResponse.json({
            success: true,
            data: monthlyStats
        })
    } catch (error) {
        console.error('Monthly Stats API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
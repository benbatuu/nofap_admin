import { NextResponse } from 'next/server'
import { DashboardService } from '@/lib/services'

export async function GET() {
    try {
        const stats = await DashboardService.getDashboardStats()

        return NextResponse.json({
            success: true,
            data: stats
        })
    } catch (error) {
        console.error('Dashboard Stats API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
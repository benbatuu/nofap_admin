import { NextResponse } from 'next/server'
import { DashboardService } from '@/lib/services'

export async function GET() {
    try {
        const systemStatus = await DashboardService.getSystemStatus()

        return NextResponse.json({
            success: true,
            data: systemStatus
        })
    } catch (error) {
        console.error('System Status API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
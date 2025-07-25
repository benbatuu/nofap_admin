import { NextResponse } from 'next/server'
import { getStatisticsData } from '@/lib/db'

export async function GET() {
    try {
        const statistics = await getStatisticsData()

        return NextResponse.json({
            success: true,
            data: statistics
        })
    } catch (error) {
        console.error('Statistics API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
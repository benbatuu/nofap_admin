import { NextResponse } from 'next/server'
import { getMonthlyStats } from '@/lib/db'

export async function GET() {
    try {
        const stats = await getMonthlyStats()

        return NextResponse.json({
            success: true,
            data: stats
        })
    } catch (error) {
        console.error('Monthly Stats API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
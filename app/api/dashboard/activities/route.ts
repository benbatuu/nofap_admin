import { NextResponse } from 'next/server'
import { getRecentActivities } from '@/lib/db'

export async function GET() {
    try {
        const activities = await getRecentActivities()

        return NextResponse.json({
            success: true,
            data: activities
        })
    } catch (error) {
        console.error('Activities API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
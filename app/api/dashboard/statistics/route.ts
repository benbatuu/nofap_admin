import { NextResponse } from 'next/server'
import { DashboardService } from '@/lib/services'

export async function GET() {
    try {
        // Get comprehensive statistics data
        const [
            dashboardStats,
            userGrowthData,
            revenueData,
            taskCompletionData,
            topUsers,
            popularCategories
        ] = await Promise.all([
            DashboardService.getDashboardStats(),
            DashboardService.getUserGrowthData(12),
            DashboardService.getRevenueData(12),
            DashboardService.getTaskCompletionData(30),
            DashboardService.getTopUsers(10),
            DashboardService.getPopularCategories(10)
        ])

        const statistics = {
            keyMetrics: [
                { 
                    title: "Total Users", 
                    value: dashboardStats.users.total.toString(), 
                    change: "+12.5%", 
                    icon: "Users", 
                    trend: "up", 
                    color: "text-blue-500" 
                },
                { 
                    title: "Active Users", 
                    value: dashboardStats.users.active.toString(), 
                    change: "+18.2%", 
                    icon: "UserCheck", 
                    trend: "up", 
                    color: "text-green-500" 
                },
                { 
                    title: "Total Revenue", 
                    value: `${dashboardStats.billing.totalRevenue} TRY`, 
                    change: "+24.1%", 
                    icon: "DollarSign", 
                    trend: "up", 
                    color: "text-purple-500" 
                },
                { 
                    title: "Completed Tasks", 
                    value: dashboardStats.tasks.completed.toString(), 
                    change: "+8.3%", 
                    icon: "CheckCircle", 
                    trend: "up", 
                    color: "text-orange-500" 
                }
            ],
            userGrowthData,
            revenueData,
            taskCompletionData,
            topUsers,
            popularCategories
        }

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
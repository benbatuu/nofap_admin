import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function logRequest(method: string, url: string, params?: any) {
    console.log(`[${new Date().toISOString()}] ${method} ${url}`, params ? { params } : '')
}

function logResponse(method: string, url: string, success: boolean, duration: number) {
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${success ? 'SUCCESS' : 'ERROR'} (${duration}ms)`)
}

export async function GET(request: NextRequest) {
    const startTime = Date.now()
    const url = request.url

    try {
        logRequest('GET', url)

        // Get subscriber analytics
        const [
            totalUsers,
            premiumUsers,
            activeUsers,
            trialUsers,
            recentSubscribers,
            totalRevenue,
            monthlyRevenue
        ] = await Promise.all([
            // Total users
            prisma.user.count(),

            // Premium users
            prisma.user.count({
                where: { isPremium: true, status: 'active' }
            }),

            // Active users (logged in last 30 days)
            prisma.user.count({
                where: {
                    isPremium: true,
                    status: 'active',
                    lastActivity: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            }),

            // Trial users (premium users created in last 7 days)
            prisma.user.count({
                where: {
                    isPremium: true,
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            }),

            // Recent subscribers (this month)
            prisma.user.count({
                where: {
                    isPremium: true,
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            }),

            // Total revenue from successful payments
            prisma.billingLog.aggregate({
                where: { status: 'success' },
                _sum: { amount: true }
            }),

            // This month's revenue
            prisma.billingLog.aggregate({
                where: {
                    status: 'success',
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                },
                _sum: { amount: true }
            })
        ])

        // Calculate subscription plans distribution
        const planDistribution = [
            {
                plan: "Premium Aylık",
                count: Math.floor(premiumUsers * 0.7), // 70% monthly
                revenue: Math.floor((monthlyRevenue._sum.amount || 0) * 0.6)
            },
            {
                plan: "Premium Yıllık",
                count: Math.floor(premiumUsers * 0.25), // 25% yearly
                revenue: Math.floor((monthlyRevenue._sum.amount || 0) * 0.35)
            },
            {
                plan: "Deneme",
                count: trialUsers,
                revenue: 0
            }
        ]

        // Calculate churn rate (simplified)
        const lastMonthUsers = await prisma.user.count({
            where: {
                isPremium: true,
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                    lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }
        })

        const churnRate = lastMonthUsers > 0 ?
            Math.max(0, ((lastMonthUsers - recentSubscribers) / lastMonthUsers) * 100) : 0

        // Calculate growth rate
        const growthRate = lastMonthUsers > 0 ?
            ((recentSubscribers - lastMonthUsers) / lastMonthUsers) * 100 : 0

        const result = {
            overview: {
                totalSubscribers: totalUsers,
                activeSubscribers: premiumUsers,
                trialUsers: trialUsers,
                churnRate: Math.round(churnRate * 10) / 10,
                growthRate: Math.round(growthRate * 10) / 10,
                conversionRate: totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100 * 10) / 10 : 0
            },
            revenue: {
                totalRevenue: totalRevenue._sum.amount || 0,
                monthlyRevenue: monthlyRevenue._sum.amount || 0,
                averageRevenuePerUser: premiumUsers > 0 ?
                    Math.round(((totalRevenue._sum.amount || 0) / premiumUsers) * 100) / 100 : 0
            },
            planDistribution,
            insights: {
                activeRate: premiumUsers > 0 ? Math.round((activeUsers / premiumUsers) * 100 * 10) / 10 : 0,
                trialConversionRate: 78, // Mock data - would need more complex calculation
                yearlyPlanPreference: planDistribution[1].count > 0 ?
                    Math.round((planDistribution[1].count / premiumUsers) * 100) : 0
            }
        }

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Subscribers Analytics API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch subscriber analytics' },
            { status: 500 }
        )
    }
}
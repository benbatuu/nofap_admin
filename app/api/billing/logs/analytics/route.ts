import { NextRequest, NextResponse } from 'next/server'
import { BillingService } from '@/lib/services'

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
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')
        const period = searchParams.get('period') as 'day' | 'week' | 'month' | 'year' || 'month'

        logRequest('GET', url, { days, period })

        // Get comprehensive analytics
        const [
            billingStats,
            revenueByPeriod,
            revenueAnalytics,
            paymentMethodStats,
            topPayingUsers,
            subscriptionMetrics
        ] = await Promise.all([
            BillingService.getBillingStats(),
            BillingService.getRevenueByPeriod(period),
            BillingService.getRevenueAnalytics(days),
            BillingService.getPaymentMethodStats(),
            BillingService.getTopPayingUsers(10),
            BillingService.getSubscriptionMetrics()
        ])

        // Calculate additional metrics
        const successRate = billingStats.total > 0 ?
            (billingStats.success / billingStats.total) * 100 : 0

        const pendingRate = billingStats.total > 0 ?
            (billingStats.pending / billingStats.total) * 100 : 0

        const failureRate = billingStats.total > 0 ?
            (billingStats.failed / billingStats.total) * 100 : 0

        // Calculate average transaction value
        const avgTransactionValue = billingStats.success > 0 ?
            billingStats.totalRevenue / billingStats.success : 0

        // Get today's stats
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const todayStats = await BillingService.getBillingLogs({
            dateFrom: today,
            dateTo: tomorrow,
            limit: 1000
        })

        const todayRevenue = todayStats.billingLogs
            .filter(log => log.status === 'success')
            .reduce((sum, log) => sum + log.amount, 0)

        const result = {
            overview: {
                totalTransactions: billingStats.total,
                successfulTransactions: billingStats.success,
                pendingTransactions: billingStats.pending,
                failedTransactions: billingStats.failed,
                totalRevenue: billingStats.totalRevenue,
                successRate: Math.round(successRate * 10) / 10,
                pendingRate: Math.round(pendingRate * 10) / 10,
                failureRate: Math.round(failureRate * 10) / 10,
                avgTransactionValue: Math.round(avgTransactionValue * 100) / 100
            },
            today: {
                transactions: todayStats.pagination.total,
                revenue: todayRevenue,
                successfulTransactions: todayStats.billingLogs.filter(log => log.status === 'success').length,
                failedTransactions: todayStats.billingLogs.filter(log => log.status === 'failed').length,
                pendingTransactions: todayStats.billingLogs.filter(log => log.status === 'pending').length
            },
            period: {
                ...revenueByPeriod,
                period
            },
            trends: revenueAnalytics,
            paymentMethods: paymentMethodStats,
            topUsers: topPayingUsers,
            subscriptions: subscriptionMetrics
        }

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Billing Analytics API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch billing analytics' },
            { status: 500 }
        )
    }
}
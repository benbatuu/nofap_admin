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
        logRequest('GET', url)

        // Get comprehensive data for analysis
        const [
            billingStats,
            revenueAnalytics,
            paymentMethodStats,
            subscriptionMetrics,
            monthlyReport
        ] = await Promise.all([
            BillingService.getBillingStats(),
            BillingService.getRevenueAnalytics(30),
            BillingService.getPaymentMethodStats(),
            BillingService.getSubscriptionMetrics(),
            BillingService.getMonthlyRevenueReport(new Date().getFullYear())
        ])

        // Analyze trends
        const recentTrends = revenueAnalytics.slice(-7) // Last 7 days
        const avgDailyRevenue = recentTrends.reduce((sum, day) => sum + day.revenue, 0) / recentTrends.length
        const avgSuccessRate = recentTrends.reduce((sum, day) => sum + day.successRate, 0) / recentTrends.length

        // Calculate growth rates
        const currentMonth = monthlyReport[new Date().getMonth()]
        const previousMonth = monthlyReport[new Date().getMonth() - 1] || { revenue: 0, transactions: 0 }

        const revenueGrowth = previousMonth.revenue > 0 ?
            ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 : 0

        const transactionGrowth = previousMonth.transactions > 0 ?
            ((currentMonth.transactions - previousMonth.transactions) / previousMonth.transactions) * 100 : 0

        // Identify issues and opportunities
        const issues = []
        const opportunities = []
        const recommendations = []

        // Analyze failure rate
        const failureRate = billingStats.total > 0 ? (billingStats.failed / billingStats.total) * 100 : 0
        if (failureRate > 10) {
            issues.push({
                type: 'high_failure_rate',
                severity: 'high',
                title: 'Yüksek Başarısızlık Oranı',
                description: `%${failureRate.toFixed(1)} başarısızlık oranı sektör ortalamasının üzerinde`,
                impact: 'Gelir kaybı ve müşteri memnuniyetsizliği',
                suggestion: 'Ödeme gateway\'lerini gözden geçirin ve alternatif ödeme yöntemleri ekleyin'
            })
            recommendations.push({
                priority: 'high',
                category: 'payment_optimization',
                title: 'Ödeme Başarı Oranını Artırın',
                description: 'Başarısız ödemelerin nedenlerini analiz edin ve çözümler uygulayın',
                expectedImpact: 'Gelirde %15-25 artış beklenir'
            })
        }

        // Analyze pending transactions
        const pendingRate = billingStats.total > 0 ? (billingStats.pending / billingStats.total) * 100 : 0
        if (pendingRate > 5) {
            issues.push({
                type: 'high_pending_rate',
                severity: 'medium',
                title: 'Yüksek Bekleyen İşlem Oranı',
                description: `%${pendingRate.toFixed(1)} işlem manuel onay bekliyor`,
                impact: 'Nakit akışı gecikmesi ve operasyonel yük',
                suggestion: 'Otomatik onay sistemleri kurun'
            })
        }

        // Analyze payment method diversity
        const dominantMethod = paymentMethodStats[0]
        if (dominantMethod && (dominantMethod.transactions / billingStats.success) > 0.8) {
            opportunities.push({
                type: 'payment_diversification',
                title: 'Ödeme Yöntemi Çeşitlendirme',
                description: `İşlemlerin %${((dominantMethod.transactions / billingStats.success) * 100).toFixed(1)}'i tek yöntemle yapılıyor`,
                potential: 'Alternatif ödeme yöntemleri ekleyerek erişilebilirliği artırın',
                expectedGain: 'Dönüşüm oranında %10-15 artış'
            })
        }

        // Analyze revenue trends
        if (revenueGrowth < 0) {
            issues.push({
                type: 'declining_revenue',
                severity: 'high',
                title: 'Azalan Gelir Trendi',
                description: `Geçen aya göre %${Math.abs(revenueGrowth).toFixed(1)} azalma`,
                impact: 'Sürdürülebilir büyüme riski',
                suggestion: 'Pazarlama stratejilerini gözden geçirin ve müşteri tutma programları başlatın'
            })
        } else if (revenueGrowth > 20) {
            opportunities.push({
                type: 'high_growth',
                title: 'Güçlü Büyüme Trendi',
                description: `Geçen aya göre %${revenueGrowth.toFixed(1)} büyüme`,
                potential: 'Bu momentumu sürdürmek için kapasite artırımı yapın',
                expectedGain: 'Sürdürülebilir büyüme'
            })
        }

        // Subscription analysis
        if (subscriptionMetrics.churnRate > 5) {
            issues.push({
                type: 'high_churn',
                severity: 'medium',
                title: 'Yüksek Churn Oranı',
                description: `%${subscriptionMetrics.churnRate} müşteri kaybı oranı`,
                impact: 'Uzun vadeli gelir kaybı',
                suggestion: 'Müşteri memnuniyeti anketleri yapın ve iyileştirmeler uygulayın'
            })
        }

        // Generate insights
        const insights = {
            performance: {
                rating: avgSuccessRate > 90 ? 'excellent' : avgSuccessRate > 80 ? 'good' : avgSuccessRate > 70 ? 'fair' : 'poor',
                score: Math.round(avgSuccessRate),
                trend: revenueGrowth > 0 ? 'positive' : revenueGrowth < -5 ? 'negative' : 'stable'
            },
            predictions: {
                nextMonthRevenue: Math.round(avgDailyRevenue * 30),
                growthForecast: revenueGrowth > 0 ? 'positive' : 'negative',
                riskLevel: issues.length > 2 ? 'high' : issues.length > 0 ? 'medium' : 'low'
            },
            benchmarks: {
                industryAvgSuccessRate: 85,
                industryAvgChurnRate: 3,
                yourSuccessRate: Math.round(avgSuccessRate),
                yourChurnRate: subscriptionMetrics.churnRate
            }
        }

        const result = {
            summary: {
                totalRevenue: billingStats.totalRevenue,
                totalTransactions: billingStats.total,
                avgDailyRevenue: Math.round(avgDailyRevenue),
                avgSuccessRate: Math.round(avgSuccessRate * 10) / 10,
                revenueGrowth: Math.round(revenueGrowth * 10) / 10,
                transactionGrowth: Math.round(transactionGrowth * 10) / 10
            },
            insights,
            issues,
            opportunities,
            recommendations,
            trends: {
                daily: revenueAnalytics,
                monthly: monthlyReport
            },
            paymentAnalysis: {
                methods: paymentMethodStats,
                dominantMethod: dominantMethod?.method || 'N/A',
                diversityScore: paymentMethodStats.length
            },
            subscriptionHealth: subscriptionMetrics
        }

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Billing Analysis API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to analyze billing data' },
            { status: 500 }
        )
    }
}
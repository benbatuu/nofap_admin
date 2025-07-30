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
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || undefined
        const status = searchParams.get('status') || undefined
        const plan = searchParams.get('plan') || undefined

        logRequest('GET', url, { page, limit, search, status, plan })

        // Build where clause
        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        }

        // For now, we'll use isPremium as a proxy for subscription status
        if (status === 'active') {
            where.isPremium = true
            where.status = 'active'
        } else if (status === 'cancelled') {
            where.isPremium = false
            where.status = 'active'
        } else if (status === 'trial') {
            // We'll simulate trial users as premium users created in last 7 days
            where.isPremium = true
            where.createdAt = {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
        }

        const [subscribers, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    isPremium: true,
                    status: true,
                    createdAt: true,
                    billingLogs: {
                        select: {
                            amount: true,
                            currency: true,
                            status: true,
                            paymentMethod: true,
                            createdAt: true
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            }),
            prisma.user.count({ where })
        ])

        // Transform data to match expected format
        const transformedSubscribers = subscribers.map(user => {
            const lastPayment = user.billingLogs[0]
            const isTrialUser = user.isPremium &&
                new Date(user.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000

            return {
                id: user.id,
                username: user.name,
                email: user.email,
                avatar: user.avatar,
                plan: user.isPremium ? (isTrialUser ? 'Trial' : 'Premium') : 'Free',
                status: isTrialUser ? 'trial' : (user.isPremium ? 'active' : 'cancelled'),
                startDate: user.createdAt.toISOString().split('T')[0],
                nextBilling: user.isPremium && !isTrialUser ?
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
                    isTrialUser ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '-',
                amount: lastPayment?.amount || 0,
                paymentMethod: lastPayment?.paymentMethod || 'N/A',
                totalPaid: user.billingLogs.reduce((sum, log) =>
                    log.status === 'success' ? sum + log.amount : sum, 0),
                lastPaymentStatus: lastPayment?.status || 'none',
                country: 'N/A' // We don't have country data in our schema
            }
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: {
                subscribers: transformedSubscribers,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Subscribers API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch subscribers' },
            { status: 500 }
        )
    }
}
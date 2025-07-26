import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma';
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''

        // Prisma ile filtreli ve paginated sorgu
        const where = search
            ? {
                OR: [
                    { username: { contains: search } },
                    { email: { contains: search } },
                    { reason: { contains: search } },
                ],
            }
            : undefined;

        const [users, total, active, temporary, permanent] = await Promise.all([
            prisma.blockedUser.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { blockedDate: 'desc' },
            }),
            prisma.blockedUser.count({ where }),
            prisma.blockedUser.count({ where: { ...(where || {}), status: 'active' } }),
            prisma.blockedUser.count({ where: { ...(where || {}), status: 'temporary' } }),
            prisma.blockedUser.count({ where: { ...(where || {}), status: 'permanent' } }),
        ]);

        const result = {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                total,
                active,
                temporary,
                permanent,
            },
        };

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Blocked users API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch blocked users' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { username, email, reason, status, blockedUntil } = body

        if (!username || !email || !reason || !status) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const newUser = await prisma.blockedUser.create({
            data: {
                username,
                email,
                reason,
                status,
                blockedUntil: status === 'temporary' ? (blockedUntil ? new Date(blockedUntil) : null) : null,
                blockedDate: new Date(),
                blockedBy: 'admin', // In real app, get from auth context
            },
        });

        return NextResponse.json({
            success: true,
            data: newUser,
        });
    } catch (error) {
        console.error('Create blocked user error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create blocked user' },
            { status: 500 }
        )
    }
}
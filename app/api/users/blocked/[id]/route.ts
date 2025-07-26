import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma';
const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await prisma.blockedUser.findUnique({ where: { id: params.id } });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: user
        })
    } catch (error) {
        console.error('Get blocked user error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch blocked user' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const updatedUser = await prisma.blockedUser.update({
            where: { id: params.id },
            data: {
                ...body,
                blockedUntil: body.status === 'temporary' ? (body.blockedUntil ? new Date(body.blockedUntil) : null) : null
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedUser
        })
    } catch (error) {
        console.error('Update blocked user error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update blocked user' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.blockedUser.delete({ where: { id: params.id } });
        return NextResponse.json({
            success: true,
            data: { message: 'User deleted successfully' }
        })
    } catch (error) {
        console.error('Delete blocked user error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete blocked user' },
            { status: 500 }
        )
    }
}
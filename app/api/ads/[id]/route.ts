import { NextRequest, NextResponse } from 'next/server'
import { AdService } from '@/lib/services'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ad = await AdService.getAdById(params.id)

        if (!ad) {
            return NextResponse.json(
                { success: false, error: 'Ad not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: ad
        })
    } catch (error) {
        console.error('Ad GET API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
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
        
        // Validate input data
        const validationErrors = AdService.validateAdData(body)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        const updatedAd = await AdService.updateAd(params.id, body)

        if (!updatedAd) {
            return NextResponse.json(
                { success: false, error: 'Ad not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: updatedAd,
            message: 'Ad updated successfully'
        })
    } catch (error) {
        console.error('Ad PUT API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const deletedAd = await AdService.deleteAd(params.id)

        if (!deletedAd) {
            return NextResponse.json(
                { success: false, error: 'Ad not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: deletedAd,
            message: 'Ad deleted successfully'
        })
    } catch (error) {
        console.error('Ad DELETE API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
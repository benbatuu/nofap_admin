import { NextRequest, NextResponse } from 'next/server'
import { FAQService } from '@/lib/services/faq.service'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'FAQ ID is required' },
                { status: 400 }
            )
        }

        const faq = await FAQService.getFAQById(id)

        if (!faq) {
            return NextResponse.json(
                { success: false, error: 'FAQ not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: faq
        })
    } catch (error) {
        console.error('Get FAQ API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch FAQ' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const data = await request.json()

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'FAQ ID is required' },
                { status: 400 }
            )
        }

        // Validate input data
        const validationErrors = FAQService.validateFAQData(data)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        // Check if FAQ exists
        const existingFAQ = await FAQService.getFAQById(id)
        if (!existingFAQ) {
            return NextResponse.json(
                { success: false, error: 'FAQ not found' },
                { status: 404 }
            )
        }

        // Check for duplicates if question or language is being updated
        if (data.question || data.language) {
            const question = data.question || existingFAQ.question
            const language = data.language || existingFAQ.language
            
            const duplicates = await FAQService.findDuplicateFAQs(question, language, id)
            if (duplicates.length > 0) {
                return NextResponse.json(
                    { success: false, error: 'Duplicate question found for this language' },
                    { status: 409 }
                )
            }
        }

        const updatedFAQ = await FAQService.updateFAQ(id, data)

        return NextResponse.json({
            success: true,
            data: updatedFAQ,
            message: 'FAQ updated successfully'
        })
    } catch (error) {
        console.error('Update FAQ API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update FAQ' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'FAQ ID is required' },
                { status: 400 }
            )
        }

        // Check if FAQ exists
        const existingFAQ = await FAQService.getFAQById(id)
        if (!existingFAQ) {
            return NextResponse.json(
                { success: false, error: 'FAQ not found' },
                { status: 404 }
            )
        }

        await FAQService.deleteFAQ(id)

        return NextResponse.json({
            success: true,
            message: 'FAQ deleted successfully'
        })
    } catch (error) {
        console.error('Delete FAQ API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete FAQ' },
            { status: 500 }
        )
    }
}
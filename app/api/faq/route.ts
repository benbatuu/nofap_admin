import { NextRequest, NextResponse } from 'next/server'
import { FAQService } from '@/lib/services/faq.service'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const category = searchParams.get('category') || undefined
        const language = searchParams.get('language') || undefined
        const isPublished = searchParams.get('isPublished') === 'true' ? true : 
                           searchParams.get('isPublished') === 'false' ? false : undefined
        const search = searchParams.get('search') || undefined
        if (page < 1) {
            return NextResponse.json(
                { success: false, error: 'Page must be greater than 0' },
                { status: 400 }
            )
        }

        if (limit < 1 || limit > 100) {
            return NextResponse.json(
                { success: false, error: 'Limit must be between 1 and 100' },
                { status: 400 }
            )
        }

        const result = await FAQService.getFAQs({
            page,
            limit,
            category,
            language,
            isPublished,
            search
        })

        return NextResponse.json({
            success: true,
            data: result.faqs,
            pagination: result.pagination
        })
    } catch (error) {
        console.error('FAQ API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        // Validate input data
        const validationErrors = FAQService.validateFAQData(data)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        // Required fields validation
        if (!data.question || !data.answer || !data.category || !data.language) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: question, answer, category, language' },
                { status: 400 }
            )
        }

        // Check for duplicates
        const duplicates = await FAQService.findDuplicateFAQs(data.question, data.language)
        if (duplicates.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Duplicate question found for this language' },
                { status: 409 }
            )
        }

        const faq = await FAQService.createFAQ(data)

        return NextResponse.json({
            success: true,
            data: faq,
            message: 'FAQ created successfully'
        })
    } catch (error) {
        console.error('Create FAQ API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create FAQ' },
            { status: 500 }
        )
    }
}
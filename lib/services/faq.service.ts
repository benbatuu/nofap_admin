import { prisma } from '../prisma'

export interface CreateFAQData {
  question: string
  answer: string
  category: string
  language: string
  isPublished?: boolean
  order?: number
  tags?: string[]
}

export interface UpdateFAQData {
  question?: string
  answer?: string
  category?: string
  language?: string
  isPublished?: boolean
  order?: number
  tags?: string[]
}

export interface FAQFilters {
  page?: number
  limit?: number
  category?: string
  language?: string
  isPublished?: boolean
  search?: string
  tags?: string[]
}

export class FAQService {
  static async getFAQs(filters: FAQFilters = {}) {
    const { page = 1, limit = 10, category, language, isPublished, search, tags } = filters

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (language) {
      where.language = language
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished
    }

    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (tags && tags.length > 0) {
      // This would need proper tag implementation
      where.answer = {
        contains: tags.map(tag => `#${tag}`).join('|')
      }
    }

    const [faqs, total] = await Promise.all([
      prisma.fAQ.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.fAQ.count({ where })
    ])

    return {
      faqs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getFAQById(id: string) {
    return prisma.fAQ.findUnique({
      where: { id }
    })
  }

  static async createFAQ(data: CreateFAQData) {
    return prisma.fAQ.create({
      data: {
        ...data,
        isPublished: data.isPublished ?? true,
        order: data.order ?? 0
      }
    })
  }

  static async updateFAQ(id: string, data: UpdateFAQData) {
    return prisma.fAQ.update({
      where: { id },
      data
    })
  }

  static async deleteFAQ(id: string) {
    return prisma.fAQ.delete({
      where: { id }
    })
  }

  static async getFAQStats() {
    const [total, published, unpublished] = await Promise.all([
      prisma.fAQ.count(),
      prisma.fAQ.count({ where: { isPublished: true } }),
      prisma.fAQ.count({ where: { isPublished: false } })
    ])

    return { total, published, unpublished }
  }

  // Category management
  static async getFAQCategories() {
    const categories = await prisma.fAQ.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    })

    return categories.map(cat => ({
      name: cat.category,
      count: cat._count.category
    }))
  }

  static async getFAQsByCategory(category: string, language?: string) {
    const where: any = { category, isPublished: true }
    if (language) where.language = language

    return prisma.fAQ.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })
  }

  // Language management
  static async getSupportedLanguages() {
    const languages = await prisma.fAQ.groupBy({
      by: ['language'],
      _count: {
        language: true
      }
    })

    return languages.map(lang => ({
      code: lang.language,
      count: lang._count.language
    }))
  }

  static async getFAQsByLanguage(language: string, isPublished = true) {
    return prisma.fAQ.findMany({
      where: { language, isPublished },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })
  }

  // Publishing workflow
  static async publishFAQ(id: string) {
    return this.updateFAQ(id, { isPublished: true })
  }

  static async unpublishFAQ(id: string) {
    return this.updateFAQ(id, { isPublished: false })
  }

  static async bulkPublish(faqIds: string[]) {
    return prisma.fAQ.updateMany({
      where: { id: { in: faqIds } },
      data: { isPublished: true }
    })
  }

  static async bulkUnpublish(faqIds: string[]) {
    return prisma.fAQ.updateMany({
      where: { id: { in: faqIds } },
      data: { isPublished: false }
    })
  }

  // Ordering
  static async reorderFAQs(faqOrders: { id: string; order: number }[]) {
    const updatePromises = faqOrders.map(({ id, order }) =>
      this.updateFAQ(id, { order })
    )

    return Promise.all(updatePromises)
  }

  // Search and analytics
  static async searchFAQs(query: string, language?: string, limit = 10) {
    const where: any = {
      OR: [
        { question: { contains: query, mode: 'insensitive' } },
        { answer: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } }
      ],
      isPublished: true
    }

    if (language) where.language = language

    return prisma.fAQ.findMany({
      where,
      take: limit,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })
  }

  static async getFAQAnalytics(days = 30) {
    // This would require view tracking - for now return basic stats
    const [totalFAQs, publishedFAQs, categories, languages] = await Promise.all([
      prisma.fAQ.count(),
      prisma.fAQ.count({ where: { isPublished: true } }),
      this.getFAQCategories(),
      this.getSupportedLanguages()
    ])

    return {
      totalFAQs,
      publishedFAQs,
      unpublishedFAQs: totalFAQs - publishedFAQs,
      categories,
      languages,
      publishRate: totalFAQs > 0 ? (publishedFAQs / totalFAQs) * 100 : 0
    }
  }

  // Bulk operations
  static async bulkDeleteFAQs(faqIds: string[]) {
    return prisma.fAQ.deleteMany({
      where: { id: { in: faqIds } }
    })
  }

  static async bulkUpdateCategory(faqIds: string[], category: string) {
    return prisma.fAQ.updateMany({
      where: { id: { in: faqIds } },
      data: { category }
    })
  }

  static async bulkUpdateLanguage(faqIds: string[], language: string) {
    return prisma.fAQ.updateMany({
      where: { id: { in: faqIds } },
      data: { language }
    })
  }

  // Export functionality
  static async exportFAQs(format: 'csv' | 'json' = 'csv', filters?: FAQFilters) {
    const { faqs } = await this.getFAQs({ ...filters, limit: 10000 })
    
    if (format === 'json') {
      return JSON.stringify(faqs, null, 2)
    }

    // CSV format
    const headers = ['ID', 'Question', 'Answer', 'Category', 'Language', 'Published', 'Order', 'Created At']
    const rows = faqs.map(faq => [
      faq.id,
      faq.question,
      faq.answer.replace(/"/g, '""'), // Escape quotes
      faq.category,
      faq.language,
      faq.isPublished ? 'Yes' : 'No',
      faq.order,
      faq.createdAt.toISOString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }

  // Validation
  static validateFAQData(data: CreateFAQData | UpdateFAQData) {
    const errors: string[] = []

    if ('question' in data && data.question) {
      if (data.question.length < 5) {
        errors.push('Question must be at least 5 characters long')
      }
      if (data.question.length > 500) {
        errors.push('Question must be less than 500 characters')
      }
    }

    if ('answer' in data && data.answer) {
      if (data.answer.length < 10) {
        errors.push('Answer must be at least 10 characters long')
      }
      if (data.answer.length > 5000) {
        errors.push('Answer must be less than 5000 characters')
      }
    }

    if ('category' in data && data.category) {
      if (data.category.length < 2) {
        errors.push('Category must be at least 2 characters long')
      }
      if (data.category.length > 100) {
        errors.push('Category must be less than 100 characters')
      }
    }

    if ('language' in data && data.language) {
      const validLanguages = ['tr', 'en', 'es', 'fr', 'de']
      if (!validLanguages.includes(data.language)) {
        errors.push(`Language must be one of: ${validLanguages.join(', ')}`)
      }
    }

    if ('order' in data && data.order !== undefined) {
      if (data.order < 0) {
        errors.push('Order must be a positive number')
      }
    }

    return errors
  }

  // Duplicate detection
  static async findDuplicateFAQs(question: string, language: string, excludeId?: string) {
    const where: any = {
      question: { contains: question, mode: 'insensitive' },
      language
    }

    if (excludeId) {
      where.id = { not: excludeId }
    }

    return prisma.fAQ.findMany({
      where,
      select: {
        id: true,
        question: true,
        category: true
      }
    })
  }

  // Import functionality
  static async importFAQs(faqData: CreateFAQData[]) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const data of faqData) {
      try {
        const validationErrors = this.validateFAQData(data)
        if (validationErrors.length > 0) {
          results.failed++
          results.errors.push(`FAQ "${data.question}": ${validationErrors.join(', ')}`)
          continue
        }

        // Check for duplicates
        const duplicates = await this.findDuplicateFAQs(data.question, data.language)
        if (duplicates.length > 0) {
          results.failed++
          results.errors.push(`FAQ "${data.question}": Duplicate question found`)
          continue
        }

        await this.createFAQ(data)
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`FAQ "${data.question}": ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return results
  }
}
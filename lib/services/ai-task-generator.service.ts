// OpenAI import sadece server-side için - dynamic import kullan
let OpenAI: any = null

interface User {
    id: string
    name?: string
    email: string
    streak?: number
    isPremium?: boolean
    lastActivity?: Date
    preferences?: any
    language?: string
    timezone?: string
    age?: number
    plan?: 'free' | 'premium' | 'pro'
    goals?: string[]
    completedTasks?: number
    failedTasks?: number
    averageTaskDuration?: number
    preferredCategories?: string[]
    avoidedCategories?: string[]
    bestTimeOfDay?: string
    worstTimeOfDay?: string
    motivationLevel?: 'low' | 'medium' | 'high'
    stressLevel?: 'low' | 'medium' | 'high'
    socialSupport?: 'none' | 'low' | 'medium' | 'high'
}

interface SlipData {
    id: string
    reason?: string
    triggers?: string[]
    mood?: string
    location?: string
    timeOfDay?: string
    duration?: number
    intensity?: number
    thoughts?: string
    emotions?: string[]
    physicalSensations?: string[]
    environmentalFactors?: string[]
    socialContext?: string
    previousActions?: string[]
    cravingLevel?: number
    stressLevel?: number
    sleepQuality?: number
    energyLevel?: number
    createdAt: Date
}

interface UserPlan {
    id: string
    type: 'free' | 'premium' | 'pro'
    features: string[]
    dailyTaskLimit?: number
    aiGenerationLimit?: number
    customCategories?: boolean
    advancedAnalytics?: boolean
    personalCoaching?: boolean
}

interface ExistingTaskContext {
    category: string
    difficulty: string
    previousTitle: string
    previousDescription: string
    completionRate?: number
    userFeedback?: string
    timeSpent?: number
}

interface GenerateTasksParams {
    user: User
    userPlan?: UserPlan
    slipData?: SlipData | null
    recentSlips?: SlipData[]
    taskType: 'single' | 'bulk' | 'personalized' | 'regenerate'
    count?: number
    existingTask?: ExistingTaskContext
    recentTasks?: any[]
    completedTasks?: any[]
    failedTasks?: any[]
    userGoals?: string[]
    currentMood?: string
    currentStressLevel?: number
    currentEnergyLevel?: number
    timeOfDay?: string
    dayOfWeek?: string
    season?: string
    weather?: string
    socialContext?: string
}

interface GeneratedTask {
    title: string
    description: string
    category: string
    difficulty: 'easy' | 'medium' | 'hard'
    dueDate: Date
    aiConfidence: number
    estimatedDuration?: number
    tags?: string[]
    motivationalMessage?: string
    tips?: string[]
    expectedBenefits?: string[]
    potentialChallenges?: string[]
    successMetrics?: string[]
    relatedResources?: string[]
}

// OpenAI client initialization - sadece server-side'da
let openai: any = null

async function getOpenAIClient() {
    if (typeof window !== 'undefined') {
        throw new Error('OpenAI client can only be used on server-side')
    }

    if (!openai) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is not set')
        }

        // Dynamic import to avoid client-side loading
        if (!OpenAI) {
            const openaiModule = await import('openai')
            OpenAI = openaiModule.default
        }

        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })
    }

    return openai
}

export class AITaskGenerator {
    // Available task categories
    private static readonly CATEGORIES = [
        'Mindfulness', 'Physical', 'Mental', 'Social', 'Digital',
        'Productivity', 'Health', 'Learning', 'Creative', 'Spiritual'
    ]

    // Language mappings for multilingual support
    private static readonly LANGUAGE_PROMPTS = {
        'tr': {
            systemPrompt: 'Sen NoFap uygulaması için kişiselleştirilmiş görevler oluşturan bir AI asistanısın. Kullanıcının verilerine göre etkili, motivasyonel ve gerçekçi görevler oluştur.',
            categories: {
                'Mindfulness': 'Zihinsel farkındalık ve meditasyon',
                'Physical': 'Fiziksel aktivite ve egzersiz',
                'Mental': 'Zihinsel güçlendirme ve öz-disiplin',
                'Social': 'Sosyal bağlantı ve ilişkiler',
                'Digital': 'Dijital detoks ve teknoloji yönetimi',
                'Productivity': 'Verimlilik ve zaman yönetimi',
                'Health': 'Sağlık ve beslenme',
                'Learning': 'Öğrenme ve kişisel gelişim',
                'Creative': 'Yaratıcılık ve sanat',
                'Spiritual': 'Manevi gelişim ve iç huzur'
            }
        },
        'en': {
            systemPrompt: 'You are an AI assistant that creates personalized tasks for a NoFap application. Create effective, motivational, and realistic tasks based on user data.',
            categories: {
                'Mindfulness': 'Mental awareness and meditation',
                'Physical': 'Physical activity and exercise',
                'Mental': 'Mental strengthening and self-discipline',
                'Social': 'Social connection and relationships',
                'Digital': 'Digital detox and technology management',
                'Productivity': 'Productivity and time management',
                'Health': 'Health and nutrition',
                'Learning': 'Learning and personal development',
                'Creative': 'Creativity and arts',
                'Spiritual': 'Spiritual development and inner peace'
            }
        }
    }

    static async generateTasks(params: GenerateTasksParams): Promise<GeneratedTask[]> {
        // Server-side kontrolü
        if (typeof window !== 'undefined') {
            throw new Error('AI task generation can only be called from server-side')
        }

        try {
            console.log('🤖 AI Task Generation Started:', { userId: params.user.id, taskType: params.taskType })

            const client = await getOpenAIClient()
            if (!client) {
                throw new Error('OpenAI client is not available')
            }

            const { user, slipData, taskType, count = 1, existingTask } = params
            const userLanguage = user.language || 'tr'
            const languageConfig = this.LANGUAGE_PROMPTS[userLanguage] || this.LANGUAGE_PROMPTS['tr']

            // Build comprehensive user context
            const userContext = this.buildUserContext(params)

            // Generate AI prompt
            const prompt = this.buildPrompt(userContext, taskType, count, languageConfig, existingTask)

            console.log('📝 Generated Prompt Length:', prompt.length)
            console.log('🎯 User Context Summary:', {
                streak: user.streak,
                hasSlipData: !!slipData,
                taskType,
                count
            })

            // Call OpenAI API
            console.log('🚀 Calling OpenAI API...')
            const completion = await client.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [
                    {
                        role: "system",
                        content: languageConfig.systemPrompt + " Her seferinde farklı ve yaratıcı görevler oluştur. Tekrar etme!"
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 1.2, // Maximum creativity
                max_tokens: 2000,
                response_format: { type: "json_object" },
                seed: Math.floor(Math.random() * 1000000) // Random seed for variety
            })

            console.log('✅ OpenAI API Response received')
            console.log('📊 Usage:', completion.usage)

            const response = completion.choices[0]?.message?.content
            if (!response) {
                throw new Error('No response from OpenAI')
            }

            console.log('📄 Raw Response Length:', response.length)
            console.log('📄 Raw Response Preview:', response.substring(0, 200) + '...')

            // Parse and validate response
            const parsedTasks = JSON.parse(response)
            console.log('🎯 Parsed Tasks Count:', parsedTasks.tasks?.length || 0)

            const tasks = this.validateAndFormatTasks(parsedTasks, user)

            console.log('✨ AI Task Generation Successful:', tasks.map(t => ({ title: t.title, category: t.category, confidence: t.aiConfidence })))

            return tasks
        } catch (error) {
            console.error('❌ AI Task Generation Error:', error)
            console.log('🔄 Falling back to template-based generation')

            // Fallback to template-based generation if AI fails
            return this.generateFallbackTasks(params)
        }
    }

    private static buildUserContext(params: GenerateTasksParams): string {
        const { user, slipData, recentSlips, recentTasks, completedTasks, failedTasks } = params

        let context = `Kullanıcı Profili:
- ID: ${user.id}
- İsim: ${user.name || 'Bilinmiyor'}
- Streak: ${user.streak || 0} gün
- Plan: ${user.plan || (user.isPremium ? 'premium' : 'free')}
- Dil: ${user.language || 'tr'}
- Yaş: ${user.age || 'Belirtilmemiş'}
- Motivasyon Seviyesi: ${user.motivationLevel || 'orta'}
- Stres Seviyesi: ${user.stressLevel || 'orta'}
- Sosyal Destek: ${user.socialSupport || 'orta'}
`

        if (user.goals && user.goals.length > 0) {
            context += `- Hedefler: ${user.goals.join(', ')}\n`
        }

        if (user.preferredCategories && user.preferredCategories.length > 0) {
            context += `- Tercih Edilen Kategoriler: ${user.preferredCategories.join(', ')}\n`
        }

        if (user.avoidedCategories && user.avoidedCategories.length > 0) {
            context += `- Kaçınılan Kategoriler: ${user.avoidedCategories.join(', ')}\n`
        }

        // Add performance statistics
        if (user.completedTasks || user.failedTasks) {
            const totalTasks = (user.completedTasks || 0) + (user.failedTasks || 0)
            const successRate = totalTasks > 0 ? ((user.completedTasks || 0) / totalTasks * 100).toFixed(1) : '0'
            context += `- Görev Başarı Oranı: %${successRate} (${user.completedTasks || 0}/${totalTasks})\n`
        }

        if (user.averageTaskDuration) {
            context += `- Ortalama Görev Süresi: ${user.averageTaskDuration} dakika\n`
        }

        // Add slip information if available
        if (slipData) {
            const daysSinceSlip = Math.floor((Date.now() - new Date(slipData.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            context += `\nSon Slip Bilgisi (${daysSinceSlip} gün önce):
- Sebep: ${slipData.reason || 'Belirtilmemiş'}
- Tetikleyiciler: ${slipData.triggers?.join(', ') || 'Belirtilmemiş'}
- Ruh Hali: ${slipData.mood || 'Belirtilmemiş'}
- Zaman: ${slipData.timeOfDay || 'Belirtilmemiş'}
- Lokasyon: ${slipData.location || 'Belirtilmemiş'}
- Yoğunluk: ${slipData.intensity || 'Belirtilmemiş'}/10
- Düşünceler: ${slipData.thoughts || 'Belirtilmemiş'}
- Duygular: ${slipData.emotions?.join(', ') || 'Belirtilmemiş'}
`

            if (slipData.stressLevel) {
                context += `- Stres Seviyesi: ${slipData.stressLevel}/10\n`
            }
            if (slipData.energyLevel) {
                context += `- Enerji Seviyesi: ${slipData.energyLevel}/10\n`
            }
            if (slipData.sleepQuality) {
                context += `- Uyku Kalitesi: ${slipData.sleepQuality}/10\n`
            }
        }

        // Add recent slips pattern analysis
        if (recentSlips && recentSlips.length > 0) {
            const commonTriggers = this.analyzeCommonTriggers(recentSlips)
            const commonTimes = this.analyzeCommonTimes(recentSlips)

            context += `\nSon Slip Kalıpları:
- Yaygın Tetikleyiciler: ${commonTriggers.join(', ')}
- Yaygın Zamanlar: ${commonTimes.join(', ')}
`
        }

        // Add recent task performance
        if (recentTasks && recentTasks.length > 0) {
            const recentCategories = recentTasks.map(t => t.category).slice(0, 5)
            context += `\nSon Görevler: ${recentCategories.join(', ')}\n`
        }

        if (completedTasks && completedTasks.length > 0) {
            const successfulCategories = completedTasks.map(t => t.category).slice(0, 5)
            context += `Son Başarılı Görevler: ${successfulCategories.join(', ')}\n`
        }

        if (failedTasks && failedTasks.length > 0) {
            const failedCategories = failedTasks.map(t => t.category).slice(0, 5)
            context += `Son Başarısız Görevler: ${failedCategories.join(', ')}\n`
        }

        // Add current context
        const now = new Date()
        const timeOfDay = this.getTimeOfDay(now)
        const dayOfWeek = now.toLocaleDateString('tr-TR', { weekday: 'long' })
        const season = this.getSeason(now)

        context += `\nMevcut Durum:
- Zaman Dilimi: ${timeOfDay}
- Gün: ${dayOfWeek}
- Mevsim: ${season}
`

        return context
    }

    private static buildPrompt(
        userContext: string,
        taskType: string,
        count: number,
        languageConfig: any,
        existingTask?: ExistingTaskContext
    ): string {
        let prompt = `${userContext}

Görev Türü: ${taskType}
İstenen Görev Sayısı: ${count}

Mevcut Kategoriler: ${this.CATEGORIES.join(', ')}

`

        if (existingTask) {
            prompt += `YENIDEN OLUŞTURMA MODU:
Eski Görev:
- Kategori: ${existingTask.category}
- Başlık: ${existingTask.previousTitle}
- Açıklama: ${existingTask.previousDescription}
- Tamamlanma Oranı: ${existingTask.completionRate || 'Bilinmiyor'}%

ÖNEMLI: Bu görevden TAMAMEN FARKLI bir görev oluştur!
- Farklı kategori tercih et (mümkünse)
- Farklı aktivite türü seç
- Farklı zorluk seviyesi dene
- Tamamen yeni bir başlık kullan
- Önceki görevle hiçbir benzerlik olmasın

`
        }

        prompt += `ÖNEMLI: Her seferinde FARKLI ve ÇEŞİTLİ görevler oluştur. Aynı görevleri tekrarlama!

Lütfen yukarıdaki kullanıcı verilerine göre ${count} adet TAMAMEN FARKLI ve kişiselleştirilmiş görev oluştur. 

GÖREV ÇEŞİTLİLİĞİ KURALLARI:
- Her görev farklı bir kategoriden olmalı
- Aynı başlıkları kullanma
- Yaratıcı ve özgün görevler oluştur
- Kullanıcının durumuna göre sürpriz aktiviteler ekle

Her görev şunları içermeli:
1. Kullanıcının streak durumuna uygun zorluk seviyesi
2. Slip tetikleyicilerini ele alan içerik (varsa)
3. Kullanıcının tercihlerine uygun kategori seçimi
4. Motivasyonel ve kişiselleştirilmiş açıklama
5. Gerçekçi süre tahmini
6. Pratik ipuçları

Zorluk Seviyeleri:
- easy: 5-15 dakika, basit görevler
- medium: 15-45 dakika, orta düzey odaklanma
- hard: 45+ dakika, yüksek disiplin gerektiren

YARATICI GÖREV ÖRNEKLERİ:
- "Gün batımında 15 dakikalık fotoğraf çekimi"
- "Yabancı biriyle 5 dakikalık sohbet"
- "Evdeki bir eşyayı yeniden düzenle"
- "Sevdiğin bir şarkıyı dans ederek dinle"
- "Bugün öğrendiğin bir şeyi birine anlat"
- "10 dakikalık soğuk duş meditasyonu"
- "Çocukluk anılarını 15 dakika yaz"

JSON formatında yanıt ver:
{
  "tasks": [
    {
      "title": "Özgün ve yaratıcı görev başlığı",
      "description": "Detaylı açıklama ve kişiselleştirilmiş motivasyon",
      "category": "Kategori adı",
      "difficulty": "easy/medium/hard",
      "estimatedDuration": 30,
      "aiConfidence": 85,
      "motivationalMessage": "Kişiselleştirilmiş motivasyon mesajı",
      "tips": ["İpucu 1", "İpucu 2"],
      "expectedBenefits": ["Fayda 1", "Fayda 2"],
      "tags": ["etiket1", "etiket2"]
    }
  ]
}

TEKRAR: Her seferinde FARKLI görevler oluştur! Aynı görevleri tekrarlama!`

        return prompt
    }

    private static validateAndFormatTasks(parsedTasks: any, user: User): GeneratedTask[] {
        if (!parsedTasks.tasks || !Array.isArray(parsedTasks.tasks)) {
            throw new Error('Invalid task format from AI')
        }

        return parsedTasks.tasks.map((task: any) => {
            // Validate required fields
            if (!task.title || !task.description || !task.category || !task.difficulty) {
                throw new Error('Missing required task fields')
            }

            // Calculate due date based on difficulty
            const daysToAdd = task.difficulty === 'easy' ? 1 :
                task.difficulty === 'medium' ? 3 : 7
            const dueDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000)

            // Ensure AI confidence is within bounds
            const aiConfidence = Math.max(50, Math.min(100, task.aiConfidence || 75))

            return {
                title: task.title,
                description: task.description,
                category: task.category,
                difficulty: task.difficulty,
                dueDate,
                aiConfidence,
                estimatedDuration: task.estimatedDuration || 30,
                tags: task.tags || [],
                motivationalMessage: task.motivationalMessage || '',
                tips: task.tips || [],
                expectedBenefits: task.expectedBenefits || [],
                potentialChallenges: task.potentialChallenges || [],
                successMetrics: task.successMetrics || [],
                relatedResources: task.relatedResources || []
            }
        })
    }

    private static generateFallbackTasks(params: GenerateTasksParams): GeneratedTask[] {
        const { user, slipData, count = 1, taskType, existingTask } = params
        const tasks: GeneratedTask[] = []

        // Expanded fallback task pool with more variety
        const fallbackTasks = [
            // Mindfulness
            {
                title: '5 Dakikalık Nefes Egzersizi',
                description: 'Derin nefes alarak zihnini sakinleştir. Bu egzersiz stres seviyeni düşürmeye yardımcı olacak.',
                category: 'Mindfulness',
                difficulty: 'easy' as const
            },
            {
                title: 'Şükür Meditasyonu',
                description: 'Bugün minnettar olduğun 3 şeyi düşün ve bu pozitif duyguları hisset.',
                category: 'Mindfulness',
                difficulty: 'easy' as const
            },
            {
                title: 'Farkındalık Yürüyüşü',
                description: '10 dakika yavaş yürüyüş yap, çevrene ve hislerine odaklan.',
                category: 'Mindfulness',
                difficulty: 'easy' as const
            },

            // Physical
            {
                title: '15 Dakikalık Yürüyüş',
                description: 'Dışarı çık ve temiz hava al. Fiziksel aktivite ruh halini iyileştirecek.',
                category: 'Physical',
                difficulty: 'easy' as const
            },
            {
                title: 'Basit Esneme Egzersizleri',
                description: '10 dakika boyunca vücudunu esnet. Boyun, omuz ve sırt kaslarına odaklan.',
                category: 'Physical',
                difficulty: 'easy' as const
            },
            {
                title: '20 Şınav Challenge',
                description: 'Günde 20 şınav yap. Başlangıç için mükemmel bir hedef.',
                category: 'Physical',
                difficulty: 'medium' as const
            },

            // Mental
            {
                title: 'Günlük Hedef Belirleme',
                description: 'Yarın için 3 küçük, ulaşılabilir hedef belirle ve bunları yaz.',
                category: 'Mental',
                difficulty: 'easy' as const
            },
            {
                title: 'Pozitif Afirmasyon',
                description: 'Aynada kendine bakarak 5 pozitif cümle söyle.',
                category: 'Mental',
                difficulty: 'easy' as const
            },
            {
                title: 'Günlük Journaling',
                description: '15 dakika boyunca düşüncelerini ve duygularını yaz.',
                category: 'Mental',
                difficulty: 'medium' as const
            },

            // Social
            {
                title: 'Aile ile Kaliteli Zaman',
                description: 'Ailenle en az 30 dakika telefonsuz kaliteli zaman geçir.',
                category: 'Social',
                difficulty: 'easy' as const
            },
            {
                title: 'Arkadaşa Mesaj At',
                description: 'Uzun zamandır konuşmadığın bir arkadaşına mesaj at.',
                category: 'Social',
                difficulty: 'easy' as const
            },

            // Digital
            {
                title: '1 Saatlik Telefon Detox',
                description: 'Telefonunu 1 saat kapalı tut ve bu süreyi başka aktivitelerle geçir.',
                category: 'Digital',
                difficulty: 'easy' as const
            },
            {
                title: 'Sosyal Medya Sınırlaması',
                description: 'Bugün sosyal medyada maksimum 30 dakika geçir.',
                category: 'Digital',
                difficulty: 'medium' as const
            },

            // Health
            {
                title: 'Su İçme Takibi',
                description: 'Bugün en az 8 bardak su iç ve miktarı takip et.',
                category: 'Health',
                difficulty: 'easy' as const
            },
            {
                title: 'Sağlıklı Atıştırmalık',
                description: 'Meyve, kuruyemiş gibi sağlıklı atıştırmalıklar tercih et.',
                category: 'Health',
                difficulty: 'easy' as const
            },

            // Learning
            {
                title: '15 Dakikalık Okuma',
                description: 'Gelişim odaklı bir kitaptan 15 dakika oku ve notlar al.',
                category: 'Learning',
                difficulty: 'easy' as const
            },
            {
                title: 'Yeni Kelime Öğren',
                description: 'Bugün 5 yeni kelime öğren ve cümle içinde kullan.',
                category: 'Learning',
                difficulty: 'easy' as const
            },

            // Creative
            {
                title: 'Yaratıcı Yazma',
                description: '10 dakika boyunca özgürce yaz. Konu sınırı yok, sadece yaz.',
                category: 'Creative',
                difficulty: 'easy' as const
            },
            {
                title: 'Basit Çizim',
                description: 'Çevrende gördüğün bir şeyi çiz. Mükemmel olması gerekmiyor.',
                category: 'Creative',
                difficulty: 'easy' as const
            },

            // Productivity
            {
                title: 'Günlük To-Do Listesi',
                description: 'Yarın için basit bir yapılacaklar listesi hazırla.',
                category: 'Productivity',
                difficulty: 'easy' as const
            },
            {
                title: 'Çalışma Alanı Düzenleme',
                description: 'Masanı ve çalışma alanını düzenle, gereksiz eşyaları kaldır.',
                category: 'Productivity',
                difficulty: 'easy' as const
            }
        ]

        // Filter out existing task if regenerating
        let availableTasks = fallbackTasks
        if (taskType === 'regenerate' && existingTask) {
            availableTasks = fallbackTasks.filter(task =>
                task.title !== existingTask.previousTitle &&
                !task.title.includes(existingTask.previousTitle.split(' ')[0])
            )
        }

        // Shuffle tasks for variety
        const shuffledTasks = availableTasks.sort(() => Math.random() - 0.5)

        for (let i = 0; i < count && i < shuffledTasks.length; i++) {
            const template = shuffledTasks[i]
            const dueDate = new Date(Date.now() + (template.difficulty === 'easy' ? 1 : template.difficulty === 'medium' ? 3 : 7) * 24 * 60 * 60 * 1000)

            tasks.push({
                title: template.title,
                description: `${template.description} ${user.name ? `${user.name}, ` : ''}bu görev senin için özel olarak seçildi!`,
                category: template.category,
                difficulty: template.difficulty,
                dueDate,
                aiConfidence: Math.floor(Math.random() * 20) + 60, // 60-80 range for variety
                estimatedDuration: template.difficulty === 'easy' ? 15 : template.difficulty === 'medium' ? 30 : 45,
                tags: ['fallback', template.category.toLowerCase()],
                motivationalMessage: this.getRandomMotivationalMessage(user),
                tips: this.getRandomTips(template.category),
                expectedBenefits: this.getRandomBenefits(template.category),
                potentialChallenges: [],
                successMetrics: [],
                relatedResources: []
            })
        }

        return tasks
    }

    private static getRandomMotivationalMessage(user: User): string {
        const messages = [
            `${user.name || 'Arkadaş'}, küçük adımlar büyük değişimler yaratır!`,
            `Sen bunu başarabilirsin ${user.name || 'dostum'}!`,
            `Her gün biraz daha güçleniyorsun!`,
            `Bu görev seni bir adım daha ileriye taşıyacak!`,
            `Kendine olan güvenin artıyor, devam et!`,
            `Bugün kendine yatırım yapmanın zamanı!`,
            `Sen gerçek bir savaşçısın, bunu kanıtla!`
        ]
        return messages[Math.floor(Math.random() * messages.length)]
    }

    private static getRandomTips(category: string): string[] {
        const tipsByCategory = {
            'Mindfulness': ['Sessiz bir ortam seç', 'Nefesine odaklan', 'Düşünceleri yargılamadan gözlemle'],
            'Physical': ['Yavaş başla', 'Vücudunu dinle', 'Düzenli ol'],
            'Mental': ['Dürüst ol', 'Küçük hedefler koy', 'Kendini takdir et'],
            'Social': ['Samimi ol', 'Aktif dinle', 'Empati göster'],
            'Digital': ['Alternatif aktivite planla', 'Bildirimleri kapat', 'Zamanı takip et'],
            'Health': ['Küçük değişiklikler yap', 'Tutarlı ol', 'Kendini zorla'],
            'Learning': ['Notlar al', 'Pratik yap', 'Meraklı ol'],
            'Creative': ['Mükemmeliyetçi olma', 'Eğlen', 'Deneme yanılma yap'],
            'Productivity': ['Öncelik belirle', 'Dikkat dağıtıcıları kaldır', 'Mola ver']
        }

        const tips = tipsByCategory[category] || ['Sabırlı ol', 'Tutarlı ol', 'Kendine güven']
        return tips.slice(0, 2) // Return 2 random tips
    }

    private static getRandomBenefits(category: string): string[] {
        const benefitsByCategory = {
            'Mindfulness': ['Stres azalması', 'Mental netlik', 'Duygusal denge'],
            'Physical': ['Enerji artışı', 'Daha iyi uyku', 'Güçlü vücut'],
            'Mental': ['Öz güven artışı', 'Mental dayanıklılık', 'Hedef odaklılık'],
            'Social': ['Güçlü ilişkiler', 'Sosyal destek', 'Mutluluk artışı'],
            'Digital': ['Daha fazla zaman', 'Gerçek bağlantılar', 'Mental huzur'],
            'Health': ['Daha iyi sağlık', 'Enerji artışı', 'Yaşam kalitesi'],
            'Learning': ['Yeni beceriler', 'Mental stimülasyon', 'Kişisel gelişim'],
            'Creative': ['Yaratıcılık artışı', 'Stres azalması', 'Kendini ifade'],
            'Productivity': ['Daha fazla başarı', 'Zaman yönetimi', 'Hedeflere ulaşma']
        }

        const benefits = benefitsByCategory[category] || ['Kişisel gelişim', 'Motivasyon artışı', 'Pozitif momentum']
        return benefits.slice(0, 2) // Return 2 random benefits
    }

    // Helper methods
    private static analyzeCommonTriggers(slips: SlipData[]): string[] {
        const triggerCounts: { [key: string]: number } = {}

        slips.forEach(slip => {
            slip.triggers?.forEach(trigger => {
                triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1
            })
        })

        return Object.entries(triggerCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([trigger]) => trigger)
    }

    private static analyzeCommonTimes(slips: SlipData[]): string[] {
        const timeCounts: { [key: string]: number } = {}

        slips.forEach(slip => {
            if (slip.timeOfDay) {
                timeCounts[slip.timeOfDay] = (timeCounts[slip.timeOfDay] || 0) + 1
            }
        })

        return Object.entries(timeCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([time]) => time)
    }

    private static getTimeOfDay(date: Date): string {
        const hour = date.getHours()
        if (hour < 6) return 'gece'
        if (hour < 12) return 'sabah'
        if (hour < 18) return 'öğleden sonra'
        return 'akşam'
    }

    private static getSeason(date: Date): string {
        const month = date.getMonth()
        if (month >= 2 && month <= 4) return 'ilkbahar'
        if (month >= 5 && month <= 7) return 'yaz'
        if (month >= 8 && month <= 10) return 'sonbahar'
        return 'kış'
    }
}
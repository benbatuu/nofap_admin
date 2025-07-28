# AI Görev Oluşturucu Sistemi

Bu sistem, NoFap uygulaması için OpenAI GPT-4 kullanarak kişiselleştirilmiş görevler oluşturur.

## 🚀 Kurulum

### 1. OpenAI API Key Alma

1. [OpenAI Platform](https://platform.openai.com/) hesabı oluşturun
2. API Keys bölümünden yeni bir key oluşturun
3. Key'i güvenli bir yerde saklayın

### 2. Environment Variables

`.env.local` dosyasına OpenAI API key'inizi ekleyin:

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. Paket Kurulumu

```bash
npm install openai
```

## 🤖 AI Nasıl Çalışır?

### Kullanıcı Analizi
- **Streak Durumu**: 0-7 gün (Yeni), 7-30 gün (Orta), 30+ gün (İleri)
- **Plan Türü**: Free, Premium, Pro
- **Performans Metrikleri**: Tamamlama oranı, ortalama süre
- **Tercihler**: Başarılı/başarısız kategoriler

### Slip Analizi
- **Tetikleyiciler**: Stress, boredom, loneliness, vb.
- **Zaman Kalıpları**: Sabah, akşam, hafta sonu
- **Duygusal Durum**: Mood, stres seviyesi, enerji
- **Çevresel Faktörler**: Lokasyon, sosyal bağlam

### Kişiselleştirme
- **Dil Desteği**: Türkçe ve İngilizce
- **Zorluk Seviyesi**: Kullanıcının durumuna göre otomatik
- **Kategori Seçimi**: Slip tetikleyicilerine göre
- **Motivasyonel Mesajlar**: Kişiye özel

## 📊 Görev Türleri

### 1. Tekli Görev (`single`)
- Belirli bir kullanıcı için tek görev
- Mevcut duruma göre optimize edilmiş

### 2. Çoklu Görev (`bulk`)
- Bir kullanıcı için 5 farklı kategoride görev
- Çeşitlilik odaklı

### 3. Kişiselleştirilmiş Paket (`personalized`)
- Kullanıcının geçmişine göre özel paket
- En yüksek başarı oranı için optimize

### 4. Yeniden Oluşturma (`regenerate`)
- Mevcut görevi AI ile yenileme
- Önceki deneyimlerden öğrenme

## 🎯 Kategoriler

1. **Mindfulness** - Zihinsel farkındalık ve meditasyon
2. **Physical** - Fiziksel aktivite ve egzersiz
3. **Mental** - Zihinsel güçlendirme ve öz-disiplin
4. **Social** - Sosyal bağlantı ve ilişkiler
5. **Digital** - Dijital detoks ve teknoloji yönetimi
6. **Productivity** - Verimlilik ve zaman yönetimi
7. **Health** - Sağlık ve beslenme
8. **Learning** - Öğrenme ve kişisel gelişim
9. **Creative** - Yaratıcılık ve sanat
10. **Spiritual** - Manevi gelişim ve iç huzur

## 🔧 API Endpoints

### Tekli/Çoklu Görev Oluşturma
```http
POST /api/tasks/ai-generate
Content-Type: application/json

{
  "userId": "user_123",
  "slipId": "slip_001", // Opsiyonel
  "taskType": "single" // single, bulk, personalized
}
```

### Toplu Görev Oluşturma
```http
PUT /api/tasks/ai-generate
Content-Type: application/json

{
  "userIds": ["user_1", "user_2"], // Opsiyonel, boş ise tüm kullanıcılar
  "excludeUserIds": ["user_3"] // Hariç tutulacak kullanıcılar
}
```

### Görev Yenileme
```http
POST /api/tasks/{taskId}/regenerate
```

## 📈 AI Güven Oranı

AI, her görev için %50-100 arası güven oranı hesaplar:

- **90-100%**: Kullanıcının geçmişine mükemmel uyum
- **80-89%**: Yüksek başarı olasılığı
- **70-79%**: Orta düzey uygunluk
- **60-69%**: Deneysel görev
- **50-59%**: Fallback görev

## 🛡️ Güvenlik ve Gizlilik

- API key'ler server-side'da saklanır
- Kullanıcı verileri OpenAI'ya gönderilmez (sadece analiz sonuçları)
- Tüm veriler şifrelenir
- GDPR uyumlu

## 🔄 Fallback Sistemi

OpenAI API'si çalışmazsa:
- Otomatik template-based görev oluşturma
- Kullanıcı deneyimi kesintisiz devam eder
- Düşük güven oranı ile işaretlenir

## 📝 Örnek Çıktı

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "title": "10 Dakikalık Sabah Meditasyonu",
        "description": "Ahmet, 15 günlük streak'in harika! Bu sabah meditasyonu stres seviyeni düşürecek...",
        "category": "Mindfulness",
        "difficulty": "easy",
        "aiConfidence": 87,
        "estimatedDuration": 10,
        "motivationalMessage": "Küçük adımlar büyük değişimler yaratır!",
        "tips": ["Sessiz bir ortam seç", "Nefesine odaklan"],
        "expectedBenefits": ["Stres azalması", "Mental netlik"]
      }
    ],
    "count": 1
  },
  "message": "1 AI görev(i) başarıyla oluşturuldu"
}
```

## 🚨 Hata Yönetimi

- OpenAI API limiti aşılırsa fallback sistemi devreye girer
- Geçersiz kullanıcı verileri için hata mesajları
- Rate limiting koruması
- Detaylı error logging

## 📊 Performans İzleme

- AI görev başarı oranları
- Kullanıcı memnuniyeti metrikleri
- API response süreleri
- Maliyet analizi

## 🔮 Gelecek Özellikler

- [ ] Görüntü analizi ile mood detection
- [ ] Sesli görev açıklamaları
- [ ] Grup görevleri
- [ ] Gamification elementleri
- [ ] Makine öğrenmesi ile sürekli iyileştirme
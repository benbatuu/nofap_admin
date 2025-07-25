"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Calendar, Scale, Shield, Users, AlertTriangle } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kullanım Şartları</h2>
          <p className="text-muted-foreground">
            NoFap Tracker uygulaması kullanım şartları ve koşulları
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Yürürlük: 25 Ocak 2024
          </Badge>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            PDF İndir
          </Button>
        </div>
      </div>

      {/* Genel Bakış */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Genel Bakış
          </CardTitle>
          <CardDescription>
            Bu kullanım şartları, NoFap Tracker uygulamasını kullanırken uymanız gereken kuralları belirler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Kabul Etme</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Uygulamayı kullanarak bu şartları kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız uygulamayı kullanmayınız.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Güncelleme Hakkı</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Bu şartları önceden bildirimde bulunarak değiştirme hakkımızı saklı tutarız. Değişiklikler uygulama içinde duyurulacaktır.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kullanıcı Sorumlulukları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kullanıcı Sorumlulukları
          </CardTitle>
          <CardDescription>
            Uygulama kullanırken uymanız gereken kurallar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Hesap Güvenliği</h4>
              <div className="space-y-2 ml-4">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                  <p className="text-sm">Hesap bilgilerinizi güvenli tutmakla yükümlüsünüz</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                  <p className="text-sm">Şifrenizi başkalarıyla paylaşmamalısınız</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                  <p className="text-sm">Hesabınızda gerçekleşen tüm aktivitelerden sorumlusunuz</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Kabul Edilebilir Kullanım</h4>
              <div className="space-y-2 ml-4">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-sm">Uygulamayı kişisel gelişim amacıyla kullanabilirsiniz</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-sm">Verilerinizi yedekleyebilir ve dışa aktarabilirsiniz</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-sm">Topluluk özelliklerini saygılı bir şekilde kullanabilirsiniz</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3 text-red-600">Yasaklanan Kullanımlar</h4>
              <div className="space-y-2 ml-4">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-sm">Uygulamayı yasadışı amaçlarla kullanmak</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-sm">Diğer kullanıcıları rahatsız etmek veya taciz etmek</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-sm">Uygulamanın güvenlik sistemlerini aşmaya çalışmak</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-sm">Sahte bilgiler paylaşmak veya spam göndermek</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hizmet Koşulları */}
      <Card>
        <CardHeader>
          <CardTitle>Hizmet Koşulları</CardTitle>
          <CardDescription>
            Sunduğumuz hizmetlerle ilgili koşullar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Hizmet Kapsamı</h4>
              <p className="text-sm text-muted-foreground mb-3">
                NoFap Tracker, bağımlılıkla mücadele eden kişiler için destek ve takip araçları sunar:
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="p-3 border rounded-lg">
                  <h5 className="font-medium text-sm">Ücretsiz Özellikler</h5>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    <li>• Streak takibi</li>
                    <li>• Temel istatistikler</li>
                    <li>• Günlük motivasyon</li>
                    <li>• Topluluk erişimi</li>
                  </ul>
                </div>
                <div className="p-3 border rounded-lg">
                  <h5 className="font-medium text-sm">Premium Özellikler</h5>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    <li>• Gelişmiş analitik</li>
                    <li>• Reklamsız deneyim</li>
                    <li>• Özel rozetler</li>
                    <li>• Öncelikli destek</li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Hizmet Kesintileri</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Planlı bakım çalışmaları önceden duyurulacaktır.
                </p>
                <p className="text-sm text-muted-foreground">
                  Acil durum kesintilerinde en kısa sürede hizmet restore edilecektir.
                </p>
                <p className="text-sm text-muted-foreground">
                  Kesintiler sırasında veri kaybı yaşanmayacağını garanti ederiz.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ödeme ve İptal */}
      <Card>
        <CardHeader>
          <CardTitle>Ödeme ve İptal Koşulları</CardTitle>
          <CardDescription>
            Premium abonelik ile ilgili ödeme ve iptal şartları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Ödeme Koşulları</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ödemeler aylık veya yıllık olarak alınır</li>
                <li>• Tüm ödemeler önceden tahsil edilir</li>
                <li>• Fiyat değişiklikleri mevcut aboneleri etkilemez</li>
                <li>• Ödemeler güvenli ödeme sistemleri ile işlenir</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">İptal ve İade</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Aboneliğinizi istediğiniz zaman iptal edebilirsiniz</li>
                <li>• İptal sonrası mevcut dönem sonuna kadar erişim devam eder</li>
                <li>• İlk 7 gün içinde tam iade hakkınız vardır</li>
                <li>• İade talepleri 5-10 iş günü içinde işlenir</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sorumluluk Reddi */}
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <AlertTriangle className="h-5 w-5" />
            Sorumluluk Reddi
          </CardTitle>
          <CardDescription>
            Önemli yasal uyarılar ve sorumluluk sınırları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Tıbbi Tavsiye Değildir</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Bu uygulama tıbbi tavsiye, teşhis veya tedavi sağlamaz. Ciddi sorunlar için profesyonel yardım alınız.
              </p>
            </div>
            <div className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Hizmet Garantisi</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Hizmetlerimiz &quot;olduğu gibi&quot; sunulur. Kesintisiz çalışma garantisi vermiyoruz.
              </p>
            </div>
            <div className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Veri Kaybı</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Düzenli yedekleme yaparız ancak veri kaybına karşı tam garanti veremeyiz. Kendi yedeklerinizi alınız.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İletişim ve Uyuşmazlık */}
      <Card>
        <CardHeader>
          <CardTitle>İletişim ve Uyuşmazlık Çözümü</CardTitle>
          <CardDescription>
            Sorunlarınız için iletişim bilgileri ve çözüm yolları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">İletişim Bilgileri</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>E-posta: legal@nofaptracker.com</p>
                <p>Telefon: +90 (212) 555-0123</p>
                <p>Adres: İstanbul, Türkiye</p>
                <p>Çalışma Saatleri: 09:00-18:00 (Hafta içi)</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Uyuşmazlık Çözümü</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>1. Önce müşteri hizmetleri ile iletişime geçin</p>
                <p>2. Çözüm bulunamazsa arabuluculuk önerebiliriz</p>
                <p>3. Son çare olarak İstanbul mahkemeleri yetkilidir</p>
                <p>4. Türk hukuku uygulanır</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yürürlük */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Şartların Yürürlüğü</h4>
              <p className="text-sm text-muted-foreground">
                Bu kullanım şartları 25 Ocak 2024 tarihinden itibaren yürürlüktedir.
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20">
              v1.2
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
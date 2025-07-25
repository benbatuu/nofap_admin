"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Eye, Lock, Database, Globe, Users, FileText, Calendar } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gizlilik Politikası</h2>
          <p className="text-muted-foreground">
            NoFap Tracker uygulaması gizlilik politikası ve veri koruma bilgileri
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Son Güncelleme: 25 Ocak 2024
          </Badge>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            PDF İndir
          </Button>
        </div>
      </div>

      {/* Özet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gizlilik Özeti
          </CardTitle>
          <CardDescription>
            Kişisel verilerinizi nasıl koruduğumuzun kısa özeti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-800 dark:text-green-200">Güvenli Saklama</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Tüm verileriniz şifrelenmiş olarak saklanır ve güvenli sunucularda tutulur.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Minimal Veri</h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Sadece uygulamanın çalışması için gerekli olan minimum veriyi topluyoruz.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <h4 className="font-medium text-purple-800 dark:text-purple-200">Paylaşım Yok</h4>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Kişisel verilerinizi üçüncü taraflarla paylaşmıyoruz veya satmıyoruz.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-orange-600" />
                <h4 className="font-medium text-orange-800 dark:text-orange-200">Tam Kontrol</h4>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Verilerinizi istediğiniz zaman görüntüleyebilir, düzenleyebilir veya silebilirsiniz.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toplanan Veriler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Toplanan Veriler
          </CardTitle>
          <CardDescription>
            Uygulamada topladığımız veri türleri ve kullanım amaçları
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Hesap Bilgileri</h4>
            <div className="space-y-2 ml-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">• E-posta adresi</span>
                <Badge variant="outline">Gerekli</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">• Kullanıcı adı</span>
                <Badge variant="outline">Gerekli</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">• Şifre (şifrelenmiş)</span>
                <Badge variant="outline">Gerekli</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">• Hesap oluşturma tarihi</span>
                <Badge variant="outline">Gerekli</Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Uygulama Kullanım Verileri</h4>
            <div className="space-y-2 ml-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">• Streak bilgileri</span>
                <Badge variant="outline">Temel Özellik</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">• Relapse kayıtları</span>
                <Badge variant="outline">Temel Özellik</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">• Uygulama kullanım istatistikleri</span>
                <Badge variant="secondary">İyileştirme</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">• Cihaz bilgileri (model, işletim sistemi)</span>
                <Badge variant="secondary">Destek</Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">İsteğe Bağlı Veriler</h4>
            <div className="space-y-2 ml-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">• Profil fotoğrafı</span>
                <Badge variant="secondary">İsteğe Bağlı</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">• Kişisel notlar</span>
                <Badge variant="secondary">İsteğe Bağlı</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">• Hedefler ve motivasyon mesajları</span>
                <Badge variant="secondary">İsteğe Bağlı</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Veri Kullanımı */}
      <Card>
        <CardHeader>
          <CardTitle>Veri Kullanım Amaçları</CardTitle>
          <CardDescription>
            Toplanan verileri nasıl ve neden kullandığımız
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Temel Uygulama İşlevselliği</h4>
              <p className="text-sm text-muted-foreground">
                Streak takibi, relapse kayıtları, istatistikler ve kişiselleştirilmiş deneyim sağlamak için kullanılır.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Hesap Güvenliği</h4>
              <p className="text-sm text-muted-foreground">
                Hesabınızı korumak, yetkisiz erişimi önlemek ve güvenlik ihlallerini tespit etmek için kullanılır.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Uygulama İyileştirme</h4>
              <p className="text-sm text-muted-foreground">
                Anonim kullanım istatistikleri ile uygulamayı geliştirmek ve hataları düzeltmek için kullanılır.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">İletişim</h4>
              <p className="text-sm text-muted-foreground">
                Önemli güncellemeler, güvenlik bildirimleri ve destek mesajları göndermek için kullanılır.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Veri Güvenliği */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Veri Güvenliği
          </CardTitle>
          <CardDescription>
            Verilerinizi nasıl koruduğumuz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Şifreleme</h4>
                <p className="text-sm text-muted-foreground">
                  Tüm veriler AES-256 şifreleme ile korunur. Şifreler bcrypt ile hash&apos;lenir.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Güvenli Sunucular</h4>
                <p className="text-sm text-muted-foreground">
                  Veriler ISO 27001 sertifikalı veri merkezlerinde saklanır.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Erişim Kontrolü</h4>
                <p className="text-sm text-muted-foreground">
                  Sadece yetkili personel, gerekli durumlarda verilerinize erişebilir.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Düzenli Denetim</h4>
                <p className="text-sm text-muted-foreground">
                  Güvenlik sistemleri düzenli olarak test edilir ve güncellenir.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kullanıcı Hakları */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Hakları</CardTitle>
          <CardDescription>
            Verileriniz üzerindeki haklarınız
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Erişim Hakkı</h4>
                <p className="text-sm text-muted-foreground">
                  Hangi kişisel verilerinizi işlediğimizi öğrenme hakkınız vardır.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Düzeltme Hakkı</h4>
                <p className="text-sm text-muted-foreground">
                  Yanlış veya eksik kişisel verilerinizi düzeltme hakkınız vardır.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Silme Hakkı</h4>
                <p className="text-sm text-muted-foreground">
                  Kişisel verilerinizin silinmesini talep etme hakkınız vardır.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Taşınabilirlik Hakkı</h4>
                <p className="text-sm text-muted-foreground">
                  Verilerinizi yapılandırılmış bir formatta alma hakkınız vardır.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">İtiraz Hakkı</h4>
                <p className="text-sm text-muted-foreground">
                  Veri işleme faaliyetlerine itiraz etme hakkınız vardır.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İletişim */}
      <Card>
        <CardHeader>
          <CardTitle>İletişim</CardTitle>
          <CardDescription>
            Gizlilik ile ilgili sorularınız için iletişim bilgileri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Veri Koruma Sorumlusu</h4>
              <p className="text-sm text-muted-foreground">
                E-posta: privacy@nofaptracker.com<br />
                Telefon: +90 (212) 555-0123<br />
                Adres: İstanbul, Türkiye
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Yanıt Süresi</h4>
              <p className="text-sm text-muted-foreground">
                Gizlilik ile ilgili taleplerinizi 30 gün içinde yanıtlıyoruz.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Son Güncelleme */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Politika Güncellemeleri</h4>
              <p className="text-sm text-muted-foreground">
                Bu gizlilik politikası son olarak 25 Ocak 2024 tarihinde güncellenmiştir.
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20">
              v2.1
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
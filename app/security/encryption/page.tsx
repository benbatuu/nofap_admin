"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Shield, Lock, Key, Database, Globe, RefreshCw, AlertTriangle, CheckCircle, Settings } from "lucide-react"

export default function SecurityEncryptionPage() {
  const [encryptionSettings, setEncryptionSettings] = useState({
    // Veri Şifreleme
    databaseEncryption: {
      enabled: true,
      algorithm: "AES-256-GCM",
      keyRotationDays: 90,
      lastRotation: "2024-01-15"
    },

    // İletişim Şifreleme
    apiEncryption: {
      enabled: true,
      tlsVersion: "1.3",
      cipherSuite: "TLS_AES_256_GCM_SHA384",
      hsts: true
    },

    // Dosya Şifreleme
    fileEncryption: {
      enabled: true,
      algorithm: "AES-256-CBC",
      profileImages: true,
      backups: true,
      logs: false
    },

    // Şifre Güvenliği
    passwordSecurity: {
      algorithm: "bcrypt",
      saltRounds: 12,
      minLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true
    },

    // Token Güvenliği
    tokenSecurity: {
      jwtAlgorithm: "RS256",
      accessTokenExpiry: 15, // dakika
      refreshTokenExpiry: 7, // gün
      tokenRotation: true
    }
  })

  const [keyManagement, setKeyManagement] = useState({
    masterKey: {
      status: "active",
      created: "2023-12-01",
      lastRotation: "2024-01-15",
      nextRotation: "2024-04-15"
    },
    encryptionKeys: [
      {
        id: "key_001",
        purpose: "Database Encryption",
        algorithm: "AES-256",
        status: "active",
        created: "2024-01-15",
        expires: "2024-04-15"
      },
      {
        id: "key_002",
        purpose: "API Communication",
        algorithm: "RSA-2048",
        status: "active",
        created: "2024-01-10",
        expires: "2025-01-10"
      },
      {
        id: "key_003",
        purpose: "File Encryption",
        algorithm: "AES-256",
        status: "active",
        created: "2024-01-12",
        expires: "2024-04-12"
      }
    ]
  })

  const handleSettingChange = (category, key, value) => {
    setEncryptionSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const handleKeyRotation = (keyId) => {
    console.log(`Rotating key: ${keyId}`)
    // API çağrısı yapılacak
  }

  const getSecurityScore = () => {
    let score = 0
    if (encryptionSettings.databaseEncryption.enabled) score += 25
    if (encryptionSettings.apiEncryption.enabled) score += 25
    if (encryptionSettings.fileEncryption.enabled) score += 20
    if (encryptionSettings.passwordSecurity.saltRounds >= 12) score += 15
    if (encryptionSettings.tokenSecurity.tokenRotation) score += 15
    return score
  }

  const securityScore = getSecurityScore()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Veri Şifreleme</h2>
          <p className="text-muted-foreground">
            Sistem genelindeki şifreleme ayarlarını yönetin
          </p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Ayarları Kaydet
        </Button>
      </div>

      {/* Güvenlik Skoru */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Güvenlik Skoru
          </CardTitle>
          <CardDescription>
            Mevcut şifreleme ayarlarınızın güvenlik seviyesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{securityScore}/100</span>
              <Badge variant={securityScore >= 80 ? "default" : securityScore >= 60 ? "secondary" : "destructive"}>
                {securityScore >= 80 ? "Yüksek" : securityScore >= 60 ? "Orta" : "Düşük"}
              </Badge>
            </div>
            <Progress value={securityScore} className="h-2" />
            <div className="grid gap-2 md:grid-cols-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Veritabanı şifreleme aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>API iletişimi güvenli</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Dosya şifreleme aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Güçlü şifre politikası</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="database" className="space-y-4">
        <TabsList>
          <TabsTrigger value="database">Veritabanı</TabsTrigger>
          <TabsTrigger value="communication">İletişim</TabsTrigger>
          <TabsTrigger value="files">Dosyalar</TabsTrigger>
          <TabsTrigger value="passwords">Şifreler</TabsTrigger>
          <TabsTrigger value="keys">Anahtar Yönetimi</TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Veritabanı Şifreleme
              </CardTitle>
              <CardDescription>
                Veritabanında saklanan verilerin şifreleme ayarları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">Veritabanı Şifreleme</div>
                  <div className="text-sm text-muted-foreground">
                    Tüm veritabanı verilerini şifreler
                  </div>
                </div>
                <Switch
                  checked={encryptionSettings.databaseEncryption.enabled}
                  onCheckedChange={(checked) => handleSettingChange('databaseEncryption', 'enabled', checked)}
                />
              </div>

              <Separator />

              {encryptionSettings.databaseEncryption.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Şifreleme Algoritması</label>
                    <Select
                      value={encryptionSettings.databaseEncryption.algorithm}
                      onValueChange={(value) => handleSettingChange('databaseEncryption', 'algorithm', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AES-256-GCM">AES-256-GCM (Önerilen)</SelectItem>
                        <SelectItem value="AES-256-CBC">AES-256-CBC</SelectItem>
                        <SelectItem value="AES-192-GCM">AES-192-GCM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Anahtar Rotasyon Süresi (gün)</label>
                    <Input
                      type="number"
                      value={encryptionSettings.databaseEncryption.keyRotationDays}
                      onChange={(e) => handleSettingChange('databaseEncryption', 'keyRotationDays', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Anahtar Durumu</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Son Rotasyon:</span>
                        <span>{encryptionSettings.databaseEncryption.lastRotation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sonraki Rotasyon:</span>
                        <span>2024-04-15</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Durum:</span>
                        <Badge className="bg-green-500">Aktif</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API İletişim Güvenliği
              </CardTitle>
              <CardDescription>
                Sunucu-istemci arası iletişim şifreleme ayarları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">HTTPS Şifreleme</div>
                  <div className="text-sm text-muted-foreground">
                    Tüm API iletişimini şifreler
                  </div>
                </div>
                <Switch
                  checked={encryptionSettings.apiEncryption.enabled}
                  onCheckedChange={(checked) => handleSettingChange('apiEncryption', 'enabled', checked)}
                />
              </div>

              <Separator />

              {encryptionSettings.apiEncryption.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">TLS Sürümü</label>
                    <Select
                      value={encryptionSettings.apiEncryption.tlsVersion}
                      onValueChange={(value) => handleSettingChange('apiEncryption', 'tlsVersion', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.3">TLS 1.3 (Önerilen)</SelectItem>
                        <SelectItem value="1.2">TLS 1.2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cipher Suite</label>
                    <Select
                      value={encryptionSettings.apiEncryption.cipherSuite}
                      onValueChange={(value) => handleSettingChange('apiEncryption', 'cipherSuite', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TLS_AES_256_GCM_SHA384">TLS_AES_256_GCM_SHA384</SelectItem>
                        <SelectItem value="TLS_CHACHA20_POLY1305_SHA256">TLS_CHACHA20_POLY1305_SHA256</SelectItem>
                        <SelectItem value="TLS_AES_128_GCM_SHA256">TLS_AES_128_GCM_SHA256</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-base font-medium">HSTS (HTTP Strict Transport Security)</div>
                      <div className="text-sm text-muted-foreground">
                        Tarayıcıları HTTPS kullanmaya zorlar
                      </div>
                    </div>
                    <Switch
                      checked={encryptionSettings.apiEncryption.hsts}
                      onCheckedChange={(checked) => handleSettingChange('apiEncryption', 'hsts', checked)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Dosya Şifreleme
              </CardTitle>
              <CardDescription>
                Sunucuda saklanan dosyaların şifreleme ayarları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">Dosya Şifreleme</div>
                  <div className="text-sm text-muted-foreground">
                    Yüklenen dosyaları şifreler
                  </div>
                </div>
                <Switch
                  checked={encryptionSettings.fileEncryption.enabled}
                  onCheckedChange={(checked) => handleSettingChange('fileEncryption', 'enabled', checked)}
                />
              </div>

              <Separator />

              {encryptionSettings.fileEncryption.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Şifreleme Algoritması</label>
                    <Select
                      value={encryptionSettings.fileEncryption.algorithm}
                      onValueChange={(value) => handleSettingChange('fileEncryption', 'algorithm', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AES-256-CBC">AES-256-CBC</SelectItem>
                        <SelectItem value="AES-256-GCM">AES-256-GCM</SelectItem>
                        <SelectItem value="ChaCha20-Poly1305">ChaCha20-Poly1305</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Şifrelenecek Dosya Türleri</h4>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Profil Fotoğrafları</div>
                        <div className="text-xs text-muted-foreground">
                          Kullanıcı profil resimlerini şifreler
                        </div>
                      </div>
                      <Switch
                        checked={encryptionSettings.fileEncryption.profileImages}
                        onCheckedChange={(checked) => handleSettingChange('fileEncryption', 'profileImages', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Yedek Dosyalar</div>
                        <div className="text-xs text-muted-foreground">
                          Sistem yedeklerini şifreler
                        </div>
                      </div>
                      <Switch
                        checked={encryptionSettings.fileEncryption.backups}
                        onCheckedChange={(checked) => handleSettingChange('fileEncryption', 'backups', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Log Dosyları</div>
                        <div className="text-xs text-muted-foreground">
                          Sistem loglarını şifreler
                        </div>
                      </div>
                      <Switch
                        checked={encryptionSettings.fileEncryption.logs}
                        onCheckedChange={(checked) => handleSettingChange('fileEncryption', 'logs', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passwords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Şifre Güvenliği
              </CardTitle>
              <CardDescription>
                Kullanıcı şifrelerinin hash ve saklama ayarları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Hash Algoritması</label>
                <Select
                  value={encryptionSettings.passwordSecurity.algorithm}
                  onValueChange={(value) => handleSettingChange('passwordSecurity', 'algorithm', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bcrypt">bcrypt (Önerilen)</SelectItem>
                    <SelectItem value="scrypt">scrypt</SelectItem>
                    <SelectItem value="argon2">Argon2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Salt Rounds</label>
                <Input
                  type="number"
                  min="10"
                  max="15"
                  value={encryptionSettings.passwordSecurity.saltRounds}
                  onChange={(e) => handleSettingChange('passwordSecurity', 'saltRounds', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Yüksek değer daha güvenli ancak daha yavaş
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Şifre Politikası</h4>

                <div>
                  <label className="text-sm font-medium">Minimum Uzunluk</label>
                  <Input
                    type="number"
                    min="6"
                    max="20"
                    value={encryptionSettings.passwordSecurity.minLength}
                    onChange={(e) => handleSettingChange('passwordSecurity', 'minLength', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Özel Karakter Zorunlu</div>
                    <div className="text-xs text-muted-foreground">
                      !@#$%^&* gibi karakterler
                    </div>
                  </div>
                  <Switch
                    checked={encryptionSettings.passwordSecurity.requireSpecialChars}
                    onCheckedChange={(checked) => handleSettingChange('passwordSecurity', 'requireSpecialChars', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Rakam Zorunlu</div>
                    <div className="text-xs text-muted-foreground">
                      En az bir rakam içermeli
                    </div>
                  </div>
                  <Switch
                    checked={encryptionSettings.passwordSecurity.requireNumbers}
                    onCheckedChange={(checked) => handleSettingChange('passwordSecurity', 'requireNumbers', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Büyük Harf Zorunlu</div>
                    <div className="text-xs text-muted-foreground">
                      En az bir büyük harf içermeli
                    </div>
                  </div>
                  <Switch
                    checked={encryptionSettings.passwordSecurity.requireUppercase}
                    onCheckedChange={(checked) => handleSettingChange('passwordSecurity', 'requireUppercase', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Şifreleme Anahtarları
              </CardTitle>
              <CardDescription>
                Sistem şifreleme anahtarlarının yönetimi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keyManagement.encryptionKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{key.purpose}</div>
                      <div className="text-sm text-muted-foreground">
                        {key.algorithm} • Oluşturulma: {key.created}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {key.id} • Bitiş: {key.expires}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={key.status === "active" ? "default" : "secondary"}>
                        {key.status === "active" ? "Aktif" : "Pasif"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleKeyRotation(key.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Yenile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anahtar Rotasyon Ayarları</CardTitle>
              <CardDescription>
                Otomatik anahtar yenileme ayarları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Dikkat</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Anahtar rotasyonu kritik bir işlemdir. Yedekleme aldığınızdan emin olun.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sonraki otomatik rotasyon:</span>
                  <span className="font-medium">15 Nisan 2024</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rotasyon sıklığı:</span>
                  <span className="font-medium">90 gün</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
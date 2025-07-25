"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, DollarSign, Target, Shield, BarChart3, Globe, Users, Clock } from "lucide-react"

export default function AdsSettingsPage() {
  const [settings, setSettings] = useState({
    // Genel Ayarlar
    adsEnabled: true,
    showAdsToFreeUsers: true,
    showAdsToNewUsers: false,
    adFrequency: "medium",

    // Reklam Ağları
    admob: {
      enabled: true,
      appId: "ca-app-pub-1234567890123456~1234567890",
      bannerUnitId: "ca-app-pub-1234567890123456/1234567890",
      interstitialUnitId: "ca-app-pub-1234567890123456/0987654321",
      rewardedUnitId: "ca-app-pub-1234567890123456/1122334455"
    },
    facebook: {
      enabled: false,
      placementId: "123456789012345_123456789012345"
    },
    unity: {
      enabled: true,
      gameId: "1234567",
      testMode: false
    },

    // Reklam Türleri
    bannerAds: {
      enabled: true,
      position: "bottom",
      refreshRate: 30
    },
    interstitialAds: {
      enabled: true,
      frequency: 3, // Her 3 sayfa geçişinde
      cooldown: 60 // 60 saniye bekleme
    },
    rewardedAds: {
      enabled: true,
      rewards: {
        streakBoost: 1,
        premiumFeatures: 24 // 24 saat
      }
    },
    nativeAds: {
      enabled: false,
      feedIntegration: true
    },

    // Hedefleme
    targeting: {
      ageMin: 18,
      ageMax: 65,
      genders: ["male", "female"],
      interests: ["health", "fitness", "self-improvement"],
      locations: ["TR", "US", "GB", "DE"]
    },

    // Gelir Paylaşımı
    revenueShare: {
      developerShare: 70,
      platformShare: 30
    }
  })

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const handleSave = () => {
    console.log("Ayarlar kaydedildi:", settings)
    // API çağrısı yapılacak
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reklam Ayarları</h2>
          <p className="text-muted-foreground">
            Reklam ağlarını ve görüntüleme ayarlarını yönetin
          </p>
        </div>
        <Button onClick={handleSave}>
          <Settings className="mr-2 h-4 w-4" />
          Ayarları Kaydet
        </Button>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$156.78</div>
            <p className="text-xs text-muted-foreground">+12% dünden</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Reklam</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 reklam ağı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR Oranı</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4%</div>
            <p className="text-xs text-muted-foreground">+0.3% artış</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Gösterim</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2K</div>
            <p className="text-xs text-muted-foreground">+8% artış</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="networks">Reklam Ağları</TabsTrigger>
          <TabsTrigger value="types">Reklam Türleri</TabsTrigger>
          <TabsTrigger value="targeting">Hedefleme</TabsTrigger>
          <TabsTrigger value="revenue">Gelir</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genel Reklam Ayarları</CardTitle>
              <CardDescription>
                Temel reklam görüntüleme ayarları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">Reklamları Etkinleştir</div>
                  <div className="text-sm text-muted-foreground">
                    Uygulamada reklam gösterimini açar/kapatır
                  </div>
                </div>
                <Switch
                  checked={settings.adsEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, adsEnabled: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">Ücretsiz Kullanıcılara Reklam Göster</div>
                  <div className="text-sm text-muted-foreground">
                    Premium olmayan kullanıcılara reklam gösterir
                  </div>
                </div>
                <Switch
                  checked={settings.showAdsToFreeUsers}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showAdsToFreeUsers: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">Yeni Kullanıcılara Reklam Göster</div>
                  <div className="text-sm text-muted-foreground">
                    İlk 7 gün içindeki kullanıcılara reklam gösterir
                  </div>
                </div>
                <Switch
                  checked={settings.showAdsToNewUsers}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showAdsToNewUsers: checked }))}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-base font-medium">Reklam Sıklığı</div>
                <div className="text-sm text-muted-foreground mb-3">
                  Reklamların ne sıklıkla gösterileceğini belirler
                </div>
                <Select value={settings.adFrequency} onValueChange={(value) => setSettings(prev => ({ ...prev, adFrequency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük (Az reklam)</SelectItem>
                    <SelectItem value="medium">Orta (Dengeli)</SelectItem>
                    <SelectItem value="high">Yüksek (Çok reklam)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="networks" className="space-y-4">
          {/* Google AdMob */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
                Google AdMob
                <Badge variant={settings.admob.enabled ? "default" : "secondary"}>
                  {settings.admob.enabled ? "Aktif" : "Pasif"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Google'ın mobil reklam ağı
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Etkinleştir</span>
                <Switch
                  checked={settings.admob.enabled}
                  onCheckedChange={(checked) => handleSettingChange('admob', 'enabled', checked)}
                />
              </div>

              {settings.admob.enabled && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">App ID</label>
                    <Input
                      value={settings.admob.appId}
                      onChange={(e) => handleSettingChange('admob', 'appId', e.target.value)}
                      placeholder="ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Banner Unit ID</label>
                    <Input
                      value={settings.admob.bannerUnitId}
                      onChange={(e) => handleSettingChange('admob', 'bannerUnitId', e.target.value)}
                      placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Interstitial Unit ID</label>
                    <Input
                      value={settings.admob.interstitialUnitId}
                      onChange={(e) => handleSettingChange('admob', 'interstitialUnitId', e.target.value)}
                      placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Facebook Audience Network */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
                Facebook Audience Network
                <Badge variant={settings.facebook.enabled ? "default" : "secondary"}>
                  {settings.facebook.enabled ? "Aktif" : "Pasif"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Facebook'un reklam ağı
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Etkinleştir</span>
                <Switch
                  checked={settings.facebook.enabled}
                  onCheckedChange={(checked) => handleSettingChange('facebook', 'enabled', checked)}
                />
              </div>

              {settings.facebook.enabled && (
                <div>
                  <label className="text-sm font-medium">Placement ID</label>
                  <Input
                    value={settings.facebook.placementId}
                    onChange={(e) => handleSettingChange('facebook', 'placementId', e.target.value)}
                    placeholder="xxxxxxxxxxxxxxx_xxxxxxxxxxxxxxx"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unity Ads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 bg-black rounded"></div>
                Unity Ads
                <Badge variant={settings.unity.enabled ? "default" : "secondary"}>
                  {settings.unity.enabled ? "Aktif" : "Pasif"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Unity'nin reklam ağı
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Etkinleştir</span>
                <Switch
                  checked={settings.unity.enabled}
                  onCheckedChange={(checked) => handleSettingChange('unity', 'enabled', checked)}
                />
              </div>

              {settings.unity.enabled && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Game ID</label>
                    <Input
                      value={settings.unity.gameId}
                      onChange={(e) => handleSettingChange('unity', 'gameId', e.target.value)}
                      placeholder="1234567"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Test Modu</span>
                    <Switch
                      checked={settings.unity.testMode}
                      onCheckedChange={(checked) => handleSettingChange('unity', 'testMode', checked)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          {/* Banner Reklamlar */}
          <Card>
            <CardHeader>
              <CardTitle>Banner Reklamlar</CardTitle>
              <CardDescription>
                Sayfanın üst veya altında gösterilen reklamlar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Etkinleştir</span>
                <Switch
                  checked={settings.bannerAds.enabled}
                  onCheckedChange={(checked) => handleSettingChange('bannerAds', 'enabled', checked)}
                />
              </div>

              {settings.bannerAds.enabled && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Konum</label>
                    <Select
                      value={settings.bannerAds.position}
                      onValueChange={(value) => handleSettingChange('bannerAds', 'position', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Üst</SelectItem>
                        <SelectItem value="bottom">Alt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Yenileme Süresi (saniye)</label>
                    <Input
                      type="number"
                      value={settings.bannerAds.refreshRate}
                      onChange={(e) => handleSettingChange('bannerAds', 'refreshRate', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interstitial Reklamlar */}
          <Card>
            <CardHeader>
              <CardTitle>Interstitial Reklamlar</CardTitle>
              <CardDescription>
                Tam ekran reklamlar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Etkinleştir</span>
                <Switch
                  checked={settings.interstitialAds.enabled}
                  onCheckedChange={(checked) => handleSettingChange('interstitialAds', 'enabled', checked)}
                />
              </div>

              {settings.interstitialAds.enabled && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Gösterim Sıklığı (sayfa geçişi)</label>
                    <Input
                      type="number"
                      value={settings.interstitialAds.frequency}
                      onChange={(e) => handleSettingChange('interstitialAds', 'frequency', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bekleme Süresi (saniye)</label>
                    <Input
                      type="number"
                      value={settings.interstitialAds.cooldown}
                      onChange={(e) => handleSettingChange('interstitialAds', 'cooldown', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rewarded Reklamlar */}
          <Card>
            <CardHeader>
              <CardTitle>Ödüllü Reklamlar</CardTitle>
              <CardDescription>
                Kullanıcıya ödül veren reklamlar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Etkinleştir</span>
                <Switch
                  checked={settings.rewardedAds.enabled}
                  onCheckedChange={(checked) => handleSettingChange('rewardedAds', 'enabled', checked)}
                />
              </div>

              {settings.rewardedAds.enabled && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Streak Boost Ödülü (gün)</label>
                    <Input
                      type="number"
                      value={settings.rewardedAds.rewards.streakBoost}
                      onChange={(e) => handleSettingChange('rewardedAds', 'rewards', {
                        ...settings.rewardedAds.rewards,
                        streakBoost: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Premium Erişim (saat)</label>
                    <Input
                      type="number"
                      value={settings.rewardedAds.rewards.premiumFeatures}
                      onChange={(e) => handleSettingChange('rewardedAds', 'rewards', {
                        ...settings.rewardedAds.rewards,
                        premiumFeatures: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targeting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Hedef Kitle Ayarları
              </CardTitle>
              <CardDescription>
                Reklamların hangi kullanıcılara gösterileceğini belirleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Minimum Yaş</label>
                  <Input
                    type="number"
                    value={settings.targeting.ageMin}
                    onChange={(e) => handleSettingChange('targeting', 'ageMin', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Maksimum Yaş</label>
                  <Input
                    type="number"
                    value={settings.targeting.ageMax}
                    onChange={(e) => handleSettingChange('targeting', 'ageMax', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">İlgi Alanları</label>
                <div className="flex flex-wrap gap-2">
                  {["health", "fitness", "self-improvement", "wellness", "mental-health", "productivity"].map((interest) => (
                    <Badge
                      key={interest}
                      variant={settings.targeting.interests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newInterests = settings.targeting.interests.includes(interest)
                          ? settings.targeting.interests.filter(i => i !== interest)
                          : [...settings.targeting.interests, interest]
                        handleSettingChange('targeting', 'interests', newInterests)
                      }}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Hedef Ülkeler</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { code: "TR", name: "Türkiye" },
                    { code: "US", name: "ABD" },
                    { code: "GB", name: "İngiltere" },
                    { code: "DE", name: "Almanya" },
                    { code: "FR", name: "Fransa" },
                    { code: "ES", name: "İspanya" }
                  ].map((country) => (
                    <Badge
                      key={country.code}
                      variant={settings.targeting.locations.includes(country.code) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newLocations = settings.targeting.locations.includes(country.code)
                          ? settings.targeting.locations.filter(l => l !== country.code)
                          : [...settings.targeting.locations, country.code]
                        handleSettingChange('targeting', 'locations', newLocations)
                      }}
                    >
                      {country.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Gelir Paylaşımı
              </CardTitle>
              <CardDescription>
                Reklam gelirlerinin nasıl paylaşılacağını belirleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Geliştirici Payı (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.revenueShare.developerShare}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      handleSettingChange('revenueShare', 'developerShare', value)
                      handleSettingChange('revenueShare', 'platformShare', 100 - value)
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Platform Payı (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.revenueShare.platformShare}
                    disabled
                  />
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Gelir Dağılımı Özeti</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Günlük Tahmini Gelir:</span>
                    <span className="font-medium">$156.78</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Geliştirici Payı ({settings.revenueShare.developerShare}%):</span>
                    <span className="font-medium text-green-600">
                      ${(156.78 * settings.revenueShare.developerShare / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Payı ({settings.revenueShare.platformShare}%):</span>
                    <span className="font-medium text-blue-600">
                      ${(156.78 * settings.revenueShare.platformShare / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ödeme Ayarları</CardTitle>
              <CardDescription>
                Gelir ödemelerinin nasıl yapılacağını belirleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Minimum Ödeme Tutarı</label>
                  <Input
                    type="number"
                    placeholder="100"
                    defaultValue="100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ödeme Sıklığı</label>
                  <Select defaultValue="monthly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Haftalık</SelectItem>
                      <SelectItem value="monthly">Aylık</SelectItem>
                      <SelectItem value="quarterly">3 Aylık</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
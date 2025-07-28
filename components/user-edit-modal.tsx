'use client'

import { useState, useEffect } from "react"
import { useUpdateUser } from "@/hooks/use-api"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, X, User, Bell, Shield, Settings } from "lucide-react"
import { toast } from "sonner"

interface UserEditModalProps {
  user: any | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function UserEditModal({ user, isOpen, onClose, onSuccess }: UserEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'active',
    isPremium: false,
    streak: 0,
    globalEnabled: true,
    notifications: {
      daily: true,
      motivation: true,
      system: true,
      marketing: false
    }
  })

  const updateUserMutation = useUpdateUser()

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        status: user.status || 'active',
        isPremium: user.isPremium || false,
        streak: user.streak || 0,
        globalEnabled: user.globalEnabled ?? true,
        notifications: {
          daily: user.notifications?.daily ?? true,
          motivation: user.notifications?.motivation ?? true,
          system: user.notifications?.system ?? true,
          marketing: user.notifications?.marketing ?? false
        }
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) return

    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        data: formData
      })
      
      toast.success('Kullanıcı başarıyla güncellendi')
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error('Kullanıcı güncellenirken bir hata oluştu')
      console.error('Update user error:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationChange = (type: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Aktif</Badge>
      case 'banned':
        return <Badge variant="destructive">Yasaklı</Badge>
      case 'inactive':
        return <Badge variant="secondary">Pasif</Badge>
      default:
        return <Badge variant="secondary">Bilinmiyor</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Kullanıcı Düzenle
          </DialogTitle>
          <DialogDescription>
            {user?.name} kullanıcısının bilgilerini düzenleyin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Genel</TabsTrigger>
              <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
              <TabsTrigger value="permissions">İzinler</TabsTrigger>
              <TabsTrigger value="advanced">Gelişmiş</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Temel Bilgiler</CardTitle>
                  <CardDescription>Kullanıcının temel bilgilerini düzenleyin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ad Soyad *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Kullanıcı adı"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Durum</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Durum seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="inactive">Pasif</SelectItem>
                          <SelectItem value="banned">Yasaklı</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-1">{getStatusBadge(formData.status)}</div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="streak">Streak (Gün)</Label>
                      <Input
                        id="streak"
                        type="number"
                        min="0"
                        value={formData.streak}
                        onChange={(e) => handleInputChange('streak', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPremium"
                      checked={formData.isPremium}
                      onCheckedChange={(checked) => handleInputChange('isPremium', checked)}
                    />
                    <Label htmlFor="isPremium" className="flex items-center gap-2">
                      Premium üyelik
                      {formData.isPremium && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Premium
                        </Badge>
                      )}
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Bildirim Ayarları
                  </CardTitle>
                  <CardDescription>Kullanıcının bildirim tercihlerini yönetin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="globalEnabled"
                      checked={formData.globalEnabled}
                      onCheckedChange={(checked) => handleInputChange('globalEnabled', checked)}
                    />
                    <Label htmlFor="globalEnabled" className="font-medium">
                      Tüm bildirimleri etkinleştir
                    </Label>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Günlük Hatırlatıcılar</Label>
                        <p className="text-sm text-muted-foreground">Günlük motivasyon ve hatırlatıcı mesajları</p>
                      </div>
                      <Checkbox
                        checked={formData.notifications.daily}
                        onCheckedChange={(checked) => handleNotificationChange('daily', checked as boolean)}
                        disabled={!formData.globalEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Motivasyon Mesajları</Label>
                        <p className="text-sm text-muted-foreground">İlham verici ve motive edici içerikler</p>
                      </div>
                      <Checkbox
                        checked={formData.notifications.motivation}
                        onCheckedChange={(checked) => handleNotificationChange('motivation', checked as boolean)}
                        disabled={!formData.globalEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Sistem Bildirimleri</Label>
                        <p className="text-sm text-muted-foreground">Önemli sistem güncellemeleri ve duyurular</p>
                      </div>
                      <Checkbox
                        checked={formData.notifications.system}
                        onCheckedChange={(checked) => handleNotificationChange('system', checked as boolean)}
                        disabled={!formData.globalEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Pazarlama Mesajları</Label>
                        <p className="text-sm text-muted-foreground">Promosyonlar ve özel teklifler</p>
                      </div>
                      <Checkbox
                        checked={formData.notifications.marketing}
                        onCheckedChange={(checked) => handleNotificationChange('marketing', checked as boolean)}
                        disabled={!formData.globalEnabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    İzinler ve Roller
                  </CardTitle>
                  <CardDescription>Kullanıcının erişim izinlerini yönetin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Rol ve izin yönetimi yakında eklenecek
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Gelişmiş Ayarlar
                  </CardTitle>
                  <CardDescription>İleri düzey kullanıcı ayarları</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Kullanıcı ID</h4>
                      <p className="text-sm text-muted-foreground font-mono">{user?.id}</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Oluşturulma Tarihi</h4>
                      <p className="text-sm text-muted-foreground">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Bilinmiyor'}
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Son Aktivite</h4>
                      <p className="text-sm text-muted-foreground">
                        {user?.lastActivity ? new Date(user.lastActivity).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Bilinmiyor'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              İptal
            </Button>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
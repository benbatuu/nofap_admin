"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Users, Target, Bell, Clock, CheckCircle } from "lucide-react"

const targetGroups = [
  { id: "all", name: "Tüm Kullanıcılar", count: 45231 },
  { id: "premium", name: "Premium Üyeler", count: 2350 },
  { id: "active", name: "Aktif Kullanıcılar", count: 38492 },
  { id: "struggling", name: "Zorlanıyor (Streak < 7)", count: 5678 },
  { id: "champions", name: "Şampiyonlar (Streak > 90)", count: 1234 }
]

const notificationTemplates = [
  {
    id: "motivation",
    title: "Motivasyon Mesajı",
    content: "Bugün harika bir gün! Hedeflerine odaklan ve güçlü kal. 💪"
  },
  {
    id: "milestone",
    title: "Milestone Kutlaması",
    content: "Tebrikler! {streak_days} günlük streak'ini tamamladın! 🎉"
  },
  {
    id: "support",
    title: "Destek Mesajı",
    content: "Zorlandığın anları hatırla - sen bundan daha güçlüsün. Topluluk seninle! 🤝"
  }
]

export default function SendNotificationPage() {
  const [selectedTargets, setSelectedTargets] = useState<string[]>([])
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationContent, setNotificationContent] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [sendImmediate, setSendImmediate] = useState(true)
  const [scheduledTime, setScheduledTime] = useState("")

  const handleTargetChange = (targetId: string, checked: boolean) => {
    if (checked) {
      setSelectedTargets([...selectedTargets, targetId])
    } else {
      setSelectedTargets(selectedTargets.filter(id => id !== targetId))
    }
  }

  const getTotalRecipients = () => {
    return selectedTargets.reduce((total, targetId) => {
      const group = targetGroups.find(g => g.id === targetId)
      return total + (group?.count || 0)
    }, 0)
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = notificationTemplates.find(t => t.id === templateId)
    if (template) {
      setNotificationTitle(template.title)
      setNotificationContent(template.content)
      setSelectedTemplate(templateId)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bildirim Gönder</h2>
          <p className="text-muted-foreground">
            Kullanıcılara anlık veya zamanlanmış bildirim gönderin
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sol Panel - Bildirim Oluşturma */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Bildirim İçeriği
              </CardTitle>
              <CardDescription>
                Gönderilecek bildirimin içeriğini oluşturun
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="custom" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="custom">Özel Mesaj</TabsTrigger>
                  <TabsTrigger value="template">Şablon</TabsTrigger>
                </TabsList>

                <TabsContent value="custom" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Başlık</label>
                    <Input
                      placeholder="Bildirim başlığı..."
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">İçerik</label>
                    <Textarea
                      placeholder="Bildirim içeriği..."
                      value={notificationContent}
                      onChange={(e) => setNotificationContent(e.target.value)}
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="template" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Şablon Seç</label>
                    <Select onValueChange={handleTemplateSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Bir şablon seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedTemplate && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{notificationContent}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Zamanlama */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Gönderim Zamanı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="immediate"
                  checked={sendImmediate}
                  onCheckedChange={(checked) => setSendImmediate(checked as boolean)}
                />
                <label htmlFor="immediate" className="text-sm font-medium">
                  Hemen gönder
                </label>
              </div>

              {!sendImmediate && (
                <div>
                  <label className="text-sm font-medium">Zamanlanmış Gönderim</label>
                  <Input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sağ Panel - Hedef Kitle */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Hedef Kitle
              </CardTitle>
              <CardDescription>
                Bildirimi alacak kullanıcı gruplarını seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {targetGroups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={group.id}
                      checked={selectedTargets.includes(group.id)}
                      onCheckedChange={(checked) => handleTargetChange(group.id, checked as boolean)}
                    />
                    <div>
                      <label htmlFor={group.id} className="text-sm font-medium cursor-pointer">
                        {group.name}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {group.count.toLocaleString()} kullanıcı
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{group.count.toLocaleString()}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Özet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gönderim Özeti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Toplam Alıcı:</span>
                <Badge className="bg-blue-500 dark:bg-blue-600">
                  {getTotalRecipients().toLocaleString()}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Gönderim Türü:</span>
                <Badge variant={sendImmediate ? "default" : "secondary"}>
                  {sendImmediate ? "Anlık" : "Zamanlanmış"}
                </Badge>
              </div>

              {!sendImmediate && scheduledTime && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Gönderim Zamanı:</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(scheduledTime).toLocaleString('tr-TR')}
                  </span>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  className="w-full"
                  disabled={!notificationTitle || !notificationContent || selectedTargets.length === 0}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {sendImmediate ? "Hemen Gönder" : "Zamanla"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Son Gönderilen Bildirimler */}
      <Card>
        <CardHeader>
          <CardTitle>Son Gönderilen Bildirimler</CardTitle>
          <CardDescription>
            Yakın zamanda gönderilen bildirimlerin durumu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium">Günlük Motivasyon</p>
                  <p className="text-xs text-muted-foreground">2 dakika önce - 45,231 alıcı</p>
                </div>
              </div>
              <Badge className="bg-green-500 dark:bg-green-600">Gönderildi</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium">Haftalık Özet</p>
                  <p className="text-xs text-muted-foreground">Yarın 09:00 - 38,492 alıcı</p>
                </div>
              </div>
              <Badge variant="secondary">Zamanlandı</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
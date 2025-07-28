'use client'

import { useState } from "react"
import { useUser } from "@/hooks/use-api"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  User, 
  Crown, 
  Calendar, 
  Activity, 
  MessageSquare, 
  CheckSquare, 
  CreditCard, 
  Smartphone,
  TrendingUp,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Clock
} from "lucide-react"

interface UserDetailModalProps {
  userId: string | null
  isOpen: boolean
  onClose: () => void
}

export function UserDetailModal({ userId, isOpen, onClose }: UserDetailModalProps) {
  const { data: user, isLoading, error } = useUser(userId || '')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500 dark:bg-green-600">Aktif</Badge>
      case 'banned':
        return <Badge variant="destructive">Yasaklı</Badge>
      case 'inactive':
        return <Badge variant="secondary">Pasif</Badge>
      default:
        return <Badge variant="secondary">Bilinmiyor</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Kullanıcı Detayları
          </DialogTitle>
          <DialogDescription>
            {user?.name || 'Kullanıcı'} kullanıcısının detaylı bilgileri
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Veri Yüklenemedi</h3>
            <p className="text-muted-foreground">Kullanıcı bilgileri yüklenirken bir hata oluştu.</p>
          </div>
        ) : user ? (
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">Genel</TabsTrigger>
              <TabsTrigger value="activity">Aktivite</TabsTrigger>
              <TabsTrigger value="tasks">Görevler</TabsTrigger>
              <TabsTrigger value="messages">Mesajlar</TabsTrigger>
              <TabsTrigger value="billing">Faturalama</TabsTrigger>
              <TabsTrigger value="devices">Cihazlar</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              {/* User Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Kullanıcı Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                          {user.avatar || user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{user.name}</h3>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Durum</Label>
                          <div className="mt-1">{getStatusBadge(user.status)}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Üyelik Türü</Label>
                          <div className="mt-1">
                            {user.isPremium ? (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                <Crown className="w-3 h-3 mr-1" />
                                Premium
                              </Badge>
                            ) : (
                              <Badge variant="outline">Ücretsiz</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Streak</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Activity className="h-4 w-4 text-green-500" />
                            <span className="text-lg font-semibold">{user.streak} gün</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Katılım Tarihi</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{formatDate(user.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Son Aktivite</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">{formatDate(user.lastActivity)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Görev</CardTitle>
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user._count?.tasks || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mesajlar</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user._count?.messages || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Aktiviteler</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user._count?.activities || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fatura Kayıtları</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user._count?.billingLogs || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Bildirim Ayarları</CardTitle>
                  <CardDescription>Kullanıcının bildirim tercihleri</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Günlük Bildirimler</span>
                        <Badge variant={user.notifications?.daily ? "default" : "secondary"}>
                          {user.notifications?.daily ? "Açık" : "Kapalı"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Motivasyon Mesajları</span>
                        <Badge variant={user.notifications?.motivation ? "default" : "secondary"}>
                          {user.notifications?.motivation ? "Açık" : "Kapalı"}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sistem Bildirimleri</span>
                        <Badge variant={user.notifications?.system ? "default" : "secondary"}>
                          {user.notifications?.system ? "Açık" : "Kapalı"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pazarlama</span>
                        <Badge variant={user.notifications?.marketing ? "default" : "secondary"}>
                          {user.notifications?.marketing ? "Açık" : "Kapalı"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Son Aktiviteler</CardTitle>
                  <CardDescription>Kullanıcının son aktivite geçmişi</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.activities && user.activities.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tip</TableHead>
                          <TableHead>Açıklama</TableHead>
                          <TableHead>Tarih</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {user.activities.map((activity: any) => (
                          <TableRow key={activity.id}>
                            <TableCell>
                              <Badge variant="outline">{activity.type}</Badge>
                            </TableCell>
                            <TableCell>{activity.description || 'Aktivite açıklaması'}</TableCell>
                            <TableCell>{formatDate(activity.timestamp)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Henüz aktivite kaydı bulunmuyor</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Son Görevler</CardTitle>
                  <CardDescription>Kullanıcının son görev geçmişi</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.tasks && user.tasks.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Başlık</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Oluşturulma</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {user.tasks.map((task: any) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.title}</TableCell>
                            <TableCell>
                              <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                                {task.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                              </Badge>
                            </TableCell>
                            <TableCell>{task.category || 'Genel'}</TableCell>
                            <TableCell>{formatDate(task.createdDate)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Henüz görev kaydı bulunmuyor</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Son Mesajlar</CardTitle>
                  <CardDescription>Kullanıcının son mesaj geçmişi</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.messages && user.messages.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Konu</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>Tip</TableHead>
                          <TableHead>Tarih</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {user.messages.map((message: any) => (
                          <TableRow key={message.id}>
                            <TableCell className="font-medium">{message.subject || 'Konu yok'}</TableCell>
                            <TableCell>
                              <Badge variant={message.isRead ? 'default' : 'secondary'}>
                                {message.isRead ? 'Okundu' : 'Okunmadı'}
                              </Badge>
                            </TableCell>
                            <TableCell>{message.type || 'Genel'}</TableCell>
                            <TableCell>{formatDate(message.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Henüz mesaj kaydı bulunmuyor</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Faturalama Geçmişi</CardTitle>
                  <CardDescription>Kullanıcının ödeme ve fatura geçmişi</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.billingLogs && user.billingLogs.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tutar</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>Açıklama</TableHead>
                          <TableHead>Tarih</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {user.billingLogs.map((log: any) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">₺{log.amount}</TableCell>
                            <TableCell>
                              <Badge variant={log.status === 'completed' ? 'default' : 'secondary'}>
                                {log.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                              </Badge>
                            </TableCell>
                            <TableCell>{log.description || 'Açıklama yok'}</TableCell>
                            <TableCell>{formatDate(log.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Henüz faturalama kaydı bulunmuyor</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devices" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Kayıtlı Cihazlar</CardTitle>
                  <CardDescription>Kullanıcının kayıtlı cihaz listesi</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.devices && user.devices.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cihaz Adı</TableHead>
                          <TableHead>Platform</TableHead>
                          <TableHead>Son Görülme</TableHead>
                          <TableHead>Durum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {user.devices.map((device: any) => (
                          <TableRow key={device.id}>
                            <TableCell className="font-medium">{device.deviceName || 'Bilinmeyen Cihaz'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4" />
                                {device.platform || 'Bilinmeyen'}
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(device.lastSeen)}</TableCell>
                            <TableCell>
                              <Badge variant={device.isActive ? 'default' : 'secondary'}>
                                {device.isActive ? 'Aktif' : 'Pasif'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Henüz kayıtlı cihaz bulunmuyor</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
'use client'

import { useState, useMemo } from "react"
import React from "react"
import { useUsers, useDashboardStats, useUpdateUser } from "@/hooks/use-api"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserPlus, MoreHorizontal, Shield, Ban, Eye, AlertTriangle, Edit, Trash2, Download, Filter, Users, Activity, Calendar, Crown, Settings, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [premiumFilter, setPremiumFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const limit = 10

  // API hooks
  const { data: usersData, isLoading: usersLoading, error: usersError } = useUsers({
    page: currentPage,
    limit,
    search: searchTerm,
    status: statusFilter === "all" ? undefined : statusFilter,
    isPremium: premiumFilter === "all" ? undefined : premiumFilter === "premium"
  })

  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const updateUserMutation = useUpdateUser()
  const bulkUpdateMutation = useBulkUpdateUsers()

  // Memoized filtered and sorted users
  const processedUsers = useMemo(() => {
    if (!usersData?.users) return []
    
    let filtered = usersData.users

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a]
      let bValue = b[sortBy as keyof typeof b]

      if (sortBy === 'createdAt' || sortBy === 'lastActivity') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [usersData?.users, sortBy, sortOrder])

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, premiumFilter])

  // User management functions
  const handleUserUpdate = async (userId: string, updates: any) => {
    try {
      await updateUserMutation.mutateAsync({ id: userId, data: updates })
    } catch (error) {
      console.error('Update user error:', error)
    }
  }

  const handleBulkUpdate = async (updates: any) => {
    if (selectedUsers.length === 0) return

    try {
      await bulkUpdateMutation.mutateAsync({
        userIds: selectedUsers,
        updates
      })
      setSelectedUsers([])
    } catch (error) {
      console.error('Bulk update error:', error)
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    if (selectedUsers.length === processedUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(processedUsers.map(u => u.id))
    }
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Status', 'Premium', 'Streak', 'Created At', 'Last Activity']
    const rows = processedUsers.map(user => [
      user.id,
      user.name,
      user.email,
      user.status,
      user.isPremium ? 'Yes' : 'No',
      user.streak,
      new Date(user.createdAt).toLocaleDateString(),
      new Date(user.lastActivity).toLocaleDateString()
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users_export.csv'
    a.click()
  }

  if (usersError) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Veri Yüklenemedi</h3>
            <p className="text-muted-foreground">Kullanıcı verileri yüklenirken bir hata oluştu.</p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500 dark:bg-green-600">Aktif</Badge>
      case 'banned':
        return <Badge variant="destructive">Yasaklı</Badge>
      default:
        return <Badge variant="secondary">Bilinmiyor</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kullanıcı Yönetimi</h2>
          <p className="text-muted-foreground">
            Tüm kullanıcıları görüntüleyin ve yönetin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV İndir
          </Button>
          <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Yeni Kullanıcı
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
                <DialogDescription>
                  Yeni bir kullanıcı hesabı oluşturun
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input id="name" placeholder="Kullanıcı adı" />
                </div>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" type="email" placeholder="email@example.com" />
                </div>
                <div>
                  <Label htmlFor="status">Durum</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Pasif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="premium" />
                  <Label htmlFor="premium">Premium üyelik</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                    İptal
                  </Button>
                  <Button>Oluştur</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">Kayıtlı kullanıcılar</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Kullanıcı</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.activeUsers?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">Son 30 günde aktif</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Üye</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.premiumUsers?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">Premium aboneler</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yasaklı Kullanıcı</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.bannedUsers?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">Yasaklı hesaplar</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Arama ve Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Listesi</CardTitle>
          <CardDescription>
            Tüm kullanıcıları görüntüleyin ve yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ad, email veya ID ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="banned">Yasaklı</SelectItem>
                    <SelectItem value="inactive">Pasif</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={premiumFilter} onValueChange={setPremiumFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Üyelik" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="free">Ücretsiz</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-')
                  setSortBy(field)
                  setSortOrder(order)
                }}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sıralama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">Yeni → Eski</SelectItem>
                    <SelectItem value="createdAt-asc">Eski → Yeni</SelectItem>
                    <SelectItem value="name-asc">Ad A → Z</SelectItem>
                    <SelectItem value="name-desc">Ad Z → A</SelectItem>
                    <SelectItem value="streak-desc">Streak Yüksek → Düşük</SelectItem>
                    <SelectItem value="streak-asc">Streak Düşük → Yüksek</SelectItem>
                    <SelectItem value="lastActivity-desc">Son Aktivite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedUsers.length} seçili</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={bulkUpdateMutation.isPending}>
                        {bulkUpdateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <Settings className="w-4 h-4 mr-2" />
                        Toplu İşlem
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Durum Değiştir</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleBulkUpdate({ status: 'active' })}>
                        Aktifleştir
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkUpdate({ status: 'inactive' })}>
                        Pasifleştir
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkUpdate({ status: 'banned' })}>
                        Yasakla
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Premium Üyelik</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleBulkUpdate({ isPremium: true })}>
                        Premium Yap
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkUpdate({ isPremium: false })}>
                        Premium İptal Et
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === processedUsers.length && processedUsers.length > 0}
                    onCheckedChange={selectAllUsers}
                  />
                </TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead>Katılım Tarihi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Son Aktivite</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="w-4 h-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : processedUsers.length === 0 && searchTerm ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">
                      <strong>{searchTerm}</strong> için kullanıcı bulunamadı
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                processedUsers?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          {user.avatar || user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          {user.isPremium && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {user.streak} gün
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.lastActivity).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setIsUserDetailOpen(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Detayları Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setIsEditUserOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleUserUpdate(user.id, { 
                              status: user.status === 'active' ? 'inactive' : 'active' 
                            })}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {user.status === 'active' ? 'Pasifleştir' : 'Aktifleştir'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUserUpdate(user.id, { 
                              isPremium: !user.isPremium 
                            })}
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            {user.isPremium ? 'Premium İptal Et' : 'Premium Yap'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleUserUpdate(user.id, { status: 'banned' })}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Kullanıcıyı Yasakla
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {usersData?.pagination && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {usersData.pagination.total} kullanıcıdan {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, usersData.pagination.total)} arası gösteriliyor
                {searchTerm && (
                  <span className="ml-2 text-blue-600">
                    "{searchTerm}" için sonuçlar
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || usersLoading}
                >
                  Önceki
                </Button>
                <div className="text-sm">
                  Sayfa {currentPage} / {usersData.pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= usersData.pagination.totalPages || usersLoading}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kullanıcı Detayları</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} kullanıcısının detaylı bilgileri
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Genel</TabsTrigger>
                <TabsTrigger value="activity">Aktivite</TabsTrigger>
                <TabsTrigger value="billing">Faturalama</TabsTrigger>
                <TabsTrigger value="settings">Ayarlar</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Ad Soyad</Label>
                    <p className="text-sm text-muted-foreground">{selectedUser.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">E-posta</Label>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Durum</Label>
                    <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Üyelik Türü</Label>
                    <div className="mt-1">
                      {selectedUser.isPremium ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="outline">Ücretsiz</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Streak</Label>
                    <p className="text-sm text-muted-foreground">{selectedUser.streak} gün</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Katılım Tarihi</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedUser.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aktivite geçmişi yakında eklenecek</p>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="space-y-4">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Faturalama geçmişi yakında eklenecek</p>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Kullanıcı ayarları yakında eklenecek</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kullanıcıyı Düzenle</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} kullanıcısının bilgilerini düzenleyin
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Ad Soyad</Label>
                <Input 
                  id="edit-name" 
                  defaultValue={selectedUser.name}
                  placeholder="Kullanıcı adı" 
                />
              </div>
              <div>
                <Label htmlFor="edit-email">E-posta</Label>
                <Input 
                  id="edit-email" 
                  type="email" 
                  defaultValue={selectedUser.email}
                  placeholder="email@example.com" 
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Durum</Label>
                <Select defaultValue={selectedUser.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Pasif</SelectItem>
                    <SelectItem value="banned">Yasaklı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-streak">Streak</Label>
                <Input 
                  id="edit-streak" 
                  type="number" 
                  defaultValue={selectedUser.streak}
                  placeholder="0" 
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-premium" 
                  defaultChecked={selectedUser.isPremium}
                />
                <Label htmlFor="edit-premium">Premium üyelik</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                  İptal
                </Button>
                <Button 
                  onClick={() => {
                    // Handle user update here
                    setIsEditUserOpen(false)
                  }}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Kaydet
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
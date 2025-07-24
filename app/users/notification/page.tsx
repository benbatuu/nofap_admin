'use client'

import React, { useState, useMemo } from 'react';
import { Search, Filter, MoreHorizontal, Edit, Eye, UserX, Users, Bell, Mail, Smartphone, BarChart3, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Mock data
const initialUsers = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    avatar: 'AY',
    globalEnabled: true,
    notifications: {
      motivation: { push: true, email: true, sms: false },
      dailyReminder: { push: false, email: true, sms: false },
      marketing: { push: true, email: false, sms: false },
      system: { push: true, email: true, sms: true }
    },
    lastActivity: '2025-01-15'
  },
  {
    id: 2,
    name: 'Elif Kaya',
    email: 'elif@example.com',
    avatar: 'EK',
    globalEnabled: false,
    notifications: {
      motivation: { push: false, email: false, sms: false },
      dailyReminder: { push: false, email: false, sms: false },
      marketing: { push: false, email: false, sms: false },
      system: { push: true, email: true, sms: false }
    },
    lastActivity: '2025-01-20'
  },
  {
    id: 3,
    name: 'Mehmet Demir',
    email: 'mehmet@example.com',
    avatar: 'MD',
    globalEnabled: true,
    notifications: {
      motivation: { push: true, email: false, sms: false },
      dailyReminder: { push: true, email: true, sms: false },
      marketing: { push: false, email: false, sms: false },
      system: { push: true, email: true, sms: false }
    },
    lastActivity: '2025-01-22'
  },
  {
    id: 4,
    name: 'Zeynep Özkan',
    email: 'zeynep@example.com',
    avatar: 'ZO',
    globalEnabled: true,
    notifications: {
      motivation: { push: true, email: true, sms: true },
      dailyReminder: { push: true, email: false, sms: false },
      marketing: { push: true, email: true, sms: false },
      system: { push: true, email: true, sms: true }
    },
    lastActivity: '2025-01-24'
  }
];

const notificationTypes = {
  motivation: { label: 'Motivasyon', icon: '💪' },
  dailyReminder: { label: 'Günlük Hatırlatma', icon: '⏰' },
  marketing: { label: 'Pazarlama', icon: '📢' },
  system: { label: 'Sistem Uyarıları', icon: '⚠️' }
};

const channelIcons = {
  push: <Smartphone className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  sms: <Bell className="w-4 h-4" />
};

export default function UserNotificationsPage() {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.id.toString().includes(searchTerm);
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'enabled' && user.globalEnabled) ||
                           (filterStatus === 'disabled' && !user.globalEnabled);
      
      const matchesType = filterType === 'all' || 
                         Object.values(user.notifications[filterType] || {}).some(val => val);
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [users, searchTerm, filterStatus, filterType]);

  // Statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const enabledUsers = users.filter(u => u.globalEnabled).length;
    const typeStats = {};
    
    Object.keys(notificationTypes).forEach(type => {
      typeStats[type] = users.filter(u => 
        Object.values(u.notifications[type]).some(val => val)
      ).length;
    });
    
    return { totalUsers, enabledUsers, typeStats };
  }, [users]);

  const handleUserUpdate = (userId, updates) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  };

  const handleBulkUpdate = (updates) => {
    if (selectedUsers.length === 0) return;
    
    setUsers(prev => prev.map(user => 
      selectedUsers.includes(user.id) ? { ...user, ...updates } : user
    ));
    setSelectedUsers([]);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Ad', 'E-posta', 'Genel Durum', 'Motivasyon', 'Günlük Hatırlatma', 'Pazarlama', 'Sistem'];
    const rows = users.map(user => [
      user.id,
      user.name,
      user.email,
      user.globalEnabled ? 'Aktif' : 'Pasif',
      Object.values(user.notifications.motivation).some(v => v) ? 'Açık' : 'Kapalı',
      Object.values(user.notifications.dailyReminder).some(v => v) ? 'Açık' : 'Kapalı',
      Object.values(user.notifications.marketing).some(v => v) ? 'Açık' : 'Kapalı',
      Object.values(user.notifications.system).some(v => v) ? 'Açık' : 'Kapalı'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-notifications.csv';
    a.click();
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kullanıcı Bildirimleri</h1>
            <p className="text-muted-foreground">Kullanıcıların bildirim ayarlarını yönetin</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              CSV İndir
            </Button>
            <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  İstatistikler
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Bildirim İstatistikleri</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Toplam</p>
                            <p className="text-2xl font-bold">{stats.totalUsers}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Aktif</p>
                            <p className="text-2xl font-bold">{stats.enabledUsers}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Bildirim Türleri</h4>
                    {Object.entries(notificationTypes).map(([key, type]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm">{type.icon} {type.label}</span>
                        <Badge variant="secondary">{stats.typeStats[key]}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ad, e-posta veya ID ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="enabled">Aktif</SelectItem>
                <SelectItem value="disabled">Pasif</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Bildirim Türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                {Object.entries(notificationTypes).map(([key, type]) => (
                  <SelectItem key={key} value={key}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedUsers.length} seçili</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Toplu İşlem
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Toplu İşlemler</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkUpdate({ globalEnabled: true })}>
                    Tümünü Aktifleştir
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkUpdate({ globalEnabled: false })}>
                    Tümünü Pasifleştir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={selectAllUsers}
                  />
                </TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Motivasyon</TableHead>
                <TableHead>Günlük Hatırlatma</TableHead>
                <TableHead>Pazarlama</TableHead>
                <TableHead>Sistem</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.globalEnabled}
                        onCheckedChange={(checked) => 
                          handleUserUpdate(user.id, { globalEnabled: checked })
                        }
                      />
                      <Badge variant={user.globalEnabled ? "default" : "secondary"}>
                        {user.globalEnabled ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                  </TableCell>
                  {Object.keys(notificationTypes).map((type) => (
                    <TableCell key={type}>
                      <div className="flex gap-1">
                        {Object.entries(user.notifications[type]).map(([channel, enabled]) => (
                          <div
                            key={channel}
                            className={`p-1 rounded ${enabled ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'}`}
                            title={`${channel}: ${enabled ? 'Açık' : 'Kapalı'}`}
                          >
                            {channelIcons[channel]}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Detayları Gör
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bildirim Ayarlarını Düzenle</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} için bildirim ayarlarını düzenleyin
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="global-notifications"
                  checked={selectedUser.globalEnabled}
                  onCheckedChange={(checked) => {
                    const updatedUser = { ...selectedUser, globalEnabled: checked };
                    setSelectedUser(updatedUser);
                    handleUserUpdate(selectedUser.id, { globalEnabled: checked });
                  }}
                />
                <Label htmlFor="global-notifications" className="font-medium">
                  Tüm bildirimleri etkinleştir
                </Label>
              </div>

              <Tabs defaultValue="notifications" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="notifications">Bildirim Türleri</TabsTrigger>
                  <TabsTrigger value="channels">Kanallar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="notifications" className="space-y-4">
                  {Object.entries(notificationTypes).map(([type, typeData]) => (
                    <Card key={type}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span>{typeData.icon}</span>
                          {typeData.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {Object.entries(selectedUser.notifications[type]).map(([channel, enabled]) => (
                          <div key={channel} className="flex items-center space-x-2">
                            <Switch
                              id={`${type}-${channel}`}
                              checked={enabled}
                              onCheckedChange={(checked) => {
                                const updatedNotifications = {
                                  ...selectedUser.notifications,
                                  [type]: {
                                    ...selectedUser.notifications[type],
                                    [channel]: checked
                                  }
                                };
                                const updatedUser = { ...selectedUser, notifications: updatedNotifications };
                                setSelectedUser(updatedUser);
                                handleUserUpdate(selectedUser.id, { notifications: updatedNotifications });
                              }}
                            />
                            <Label htmlFor={`${type}-${channel}`} className="flex items-center gap-2">
                              {channelIcons[channel]}
                              {channel === 'push' ? 'Push Bildirim' : 
                               channel === 'email' ? 'E-posta' : 'SMS'}
                            </Label>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                <TabsContent value="channels" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Kullanıcının hangi kanallardan bildirim almak istediğini görün
                  </p>
                  {['push', 'email', 'sms'].map((channel) => (
                    <Card key={channel}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          {channelIcons[channel]}
                          {channel === 'push' ? 'Push Bildirimler' : 
                           channel === 'email' ? 'E-posta Bildirimleri' : 'SMS Bildirimleri'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.entries(notificationTypes).map(([type, typeData]) => (
                            <div key={type} className="flex items-center justify-between">
                              <span className="text-sm">{typeData.icon} {typeData.label}</span>
                              <Switch
                                checked={selectedUser.notifications[type][channel]}
                                onCheckedChange={(checked) => {
                                  const updatedNotifications = {
                                    ...selectedUser.notifications,
                                    [type]: {
                                      ...selectedUser.notifications[type],
                                      [channel]: checked
                                    }
                                  };
                                  const updatedUser = { ...selectedUser, notifications: updatedNotifications };
                                  setSelectedUser(updatedUser);
                                  handleUserUpdate(selectedUser.id, { notifications: updatedNotifications });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
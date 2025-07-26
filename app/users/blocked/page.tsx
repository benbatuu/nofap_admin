'use client'

import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, Edit, Trash2, UserX, Calendar, Clock, Loader2, AlertTriangle, Shield, Globe, Settings, Filter, Download, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useBlockedUsers, useCreateBlockedUser, useUpdateBlockedUser, useDeleteBlockedUser, useBlockedIPs, useCreateBlockedIP, useUpdateBlockedIP, useDeleteBlockedIP } from '@/hooks/use-api';
import { useDebounce } from '@/hooks/use-api';
import { useQueryClient } from '@tanstack/react-query'; // Bu satırı ekleyin
import type { BlockedUser, CreateBlockedUserData, UpdateBlockedUserData } from '@/types/api';

export default function BlockedUsersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedIPs, setSelectedIPs] = useState<string[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isIPDialogOpen, setIsIPDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<BlockedUser | null>(null);
  const [editingIP, setEditingIP] = useState<any>(null);
  const [formData, setFormData] = useState<CreateBlockedUserData>({
    username: '',
    email: '',
    reason: '',
    status: 'active',
    blockedUntil: undefined
  });
  const [ipFormData, setIPFormData] = useState({
    ip: '',
    reason: '',
    location: '',
    attempts: 1,
    status: 'active' as 'active' | 'temporary' | 'permanent'
  });

  // API hooks
  const { data, isLoading, error } = useBlockedUsers({ 
    search: debouncedSearchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter
  });
  const { data: ipData, isLoading: ipLoading, error: ipError } = useBlockedIPs({ 
    search: debouncedSearchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter
  });
  const createBlockedUser = useCreateBlockedUser();
  const updateBlockedUser = useUpdateBlockedUser();
  const deleteBlockedUser = useDeleteBlockedUser();
  const createBlockedIP = useCreateBlockedIP();
  const updateBlockedIP = useUpdateBlockedIP();
  const deleteBlockedIP = useDeleteBlockedIP();

  const handleOpenDialog = (user: BlockedUser | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        reason: user.reason,
        status: user.status,
        blockedUntil: user.blockedUntil || undefined
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        reason: '',
        status: 'active',
        blockedUntil: undefined
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
        if (editingUser) {
            await updateBlockedUser.mutateAsync({
                id: editingUser.id,
                data: formData
            });
            // Yorum satırlarını kaldırıp, sorgu önbelleğini yenileme kodlarını aktif hale getiriyoruz
            queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
            queryClient.refetchQueries({ queryKey: ['blockedUsers'] });
        } else {
            await createBlockedUser.mutateAsync(formData);
        }
        setIsDialogOpen(false);
    } catch (error) {
        console.error('Error saving blocked user:', error);
    }
};

  const handleDelete = async (userId: string) => {
    try {
      await deleteBlockedUser.mutateAsync(userId);
    } catch (error) {
      console.error('Error deleting blocked user:', error);
    }
  };

  // IP blocking handlers
  const handleOpenIPDialog = (ip: any = null) => {
    if (ip) {
      setEditingIP(ip);
      setIPFormData({
        ip: ip.ip,
        reason: ip.reason,
        location: ip.location || '',
        attempts: ip.attempts || 1,
        status: ip.status
      });
    } else {
      setEditingIP(null);
      setIPFormData({
        ip: '',
        reason: '',
        location: '',
        attempts: 1,
        status: 'active'
      });
    }
    setIsIPDialogOpen(true);
  };

  const handleSaveIP = async () => {
    try {
      if (editingIP) {
        await updateBlockedIP.mutateAsync({
          id: editingIP.id,
          data: ipFormData
        });
      } else {
        await createBlockedIP.mutateAsync({
          ...ipFormData,
          blockedBy: 'admin' // This should come from auth context
        });
      }
      setIsIPDialogOpen(false);
    } catch (error) {
      console.error('Error saving blocked IP:', error);
    }
  };

  const handleDeleteIP = async (ipId: string) => {
    try {
      await deleteBlockedIP.mutateAsync(ipId);
    } catch (error) {
      console.error('Error deleting blocked IP:', error);
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    try {
      if (activeTab === 'users') {
        await Promise.all(selectedUsers.map(id => deleteBlockedUser.mutateAsync(id)));
        setSelectedUsers([]);
      } else {
        await Promise.all(selectedIPs.map(id => deleteBlockedIP.mutateAsync(id)));
        setSelectedIPs([]);
      }
    } catch (error) {
      console.error('Error in bulk delete:', error);
    }
  };

  const toggleSelection = (id: string) => {
    if (activeTab === 'users') {
      setSelectedUsers(prev =>
        prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
      );
    } else {
      setSelectedIPs(prev =>
        prev.includes(id) ? prev.filter(ipId => ipId !== id) : [...prev, id]
      );
    }
  };

  const selectAll = () => {
    if (activeTab === 'users') {
      const users = data?.users || [];
      if (selectedUsers.length === users.length) {
        setSelectedUsers([]);
      } else {
        setSelectedUsers(users.map(user => user.id));
      }
    } else {
      const ips = ipData?.blockedIPs || [];
      if (selectedIPs.length === ips.length) {
        setSelectedIPs([]);
      } else {
        setSelectedIPs(ips.map(ip => ip.id));
      }
    }
  };

  // Export functionality
  const exportToCSV = () => {
    if (activeTab === 'users') {
      const users = data?.users || [];
      const headers = ['Username', 'Email', 'Blocked Date', 'Reason', 'Status', 'Blocked By'];
      const rows = users.map(user => [
        user.username,
        user.email,
        user.blockedDate,
        user.reason,
        user.status,
        user.blockedBy
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blocked_users.csv';
      a.click();
    } else {
      const ips = ipData?.blockedIPs || [];
      const headers = ['IP Address', 'Reason', 'Location', 'Attempts', 'Status', 'Blocked Date'];
      const rows = ips.map(ip => [
        ip.ip,
        ip.reason,
        ip.location || '',
        ip.attempts,
        ip.status,
        ip.blockedAt
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blocked_ips.csv';
      a.click();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'default',
      temporary: 'secondary',
      permanent: 'destructive'
    };

    const labels: Record<string, string> = {
      active: 'Aktif',
      temporary: 'Geçici',
      permanent: 'Kalıcı'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  // Yükleme durumunda gösterilecek içerik
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bloklanan Kullanıcılar</h1>
            <p className="text-muted-foreground">Engellenmiş kullanıcıları yönetin ve durumlarını takip edin</p>
          </div>
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-10 w-[250px]" />
        <Card>
          <CardContent className="p-0">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Hata durumunda gösterilecek içerik
  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-center p-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="mt-2 text-lg font-semibold">Veri yüklenirken bir hata oluştu</h3>
            <p className="text-muted-foreground">Lütfen daha sonra tekrar deneyin veya yöneticinize başvurun.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Yeniden Dene
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const users = data?.users || [];
  const stats = data?.stats || {
    total: 0,
    active: 0,
    temporary: 0,
    permanent: 0
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Engelleme Yönetimi</h1>
          <p className="text-muted-foreground">
            Engellenmiş kullanıcıları ve IP adreslerini yönetin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV İndir
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                {activeTab === 'users' ? 'Kullanıcı Engelle' : 'IP Engelle'}
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Engelle'}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? 'Kullanıcı bilgilerini düzenleyin'
                  : 'Engellenecek kullanıcı bilgilerini girin'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Kullanıcı Adı
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  E-posta
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">
                  Sebep
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Durum
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'temporary' | 'permanent' })}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="active">Aktif</option>
                  <option value="temporary">Geçici</option>
                  <option value="permanent">Kalıcı</option>
                </select>
              </div>
              {formData.status === 'temporary' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="blockedUntil" className="text-right">
                    Engel Bitiş Tarihi
                  </Label>
                  <Input
                    id="blockedUntil"
                    type="date"
                    value={formData.blockedUntil || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, blockedUntil: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                İptal
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={createBlockedUser.isPending || updateBlockedUser.isPending}
              >
                {(createBlockedUser.isPending || updateBlockedUser.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingUser ? 'Güncelle' : 'Kaydet'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* IP Blocking Dialog */}
        <Dialog open={isIPDialogOpen} onOpenChange={setIsIPDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenIPDialog()} className="gap-2" style={{ display: 'none' }}>
              <Plus className="h-4 w-4" />
              IP Engelle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingIP ? 'IP Düzenle' : 'Yeni IP Engelle'}
              </DialogTitle>
              <DialogDescription>
                {editingIP
                  ? 'IP bilgilerini düzenleyin'
                  : 'Engellenecek IP bilgilerini girin'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ip" className="text-right">
                  IP Adresi
                </Label>
                <Input
                  id="ip"
                  value={ipFormData.ip}
                  onChange={(e) => setIPFormData({ ...ipFormData, ip: e.target.value })}
                  className="col-span-3"
                  placeholder="192.168.1.1"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Konum
                </Label>
                <Input
                  id="location"
                  value={ipFormData.location}
                  onChange={(e) => setIPFormData({ ...ipFormData, location: e.target.value })}
                  className="col-span-3"
                  placeholder="Türkiye, İstanbul"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="attempts" className="text-right">
                  Deneme Sayısı
                </Label>
                <Input
                  id="attempts"
                  type="number"
                  value={ipFormData.attempts}
                  onChange={(e) => setIPFormData({ ...ipFormData, attempts: parseInt(e.target.value) || 1 })}
                  className="col-span-3"
                  min="1"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ip-reason" className="text-right">
                  Sebep
                </Label>
                <Textarea
                  id="ip-reason"
                  value={ipFormData.reason}
                  onChange={(e) => setIPFormData({ ...ipFormData, reason: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ip-status" className="text-right">
                  Durum
                </Label>
                <select
                  id="ip-status"
                  value={ipFormData.status}
                  onChange={(e) => setIPFormData({ ...ipFormData, status: e.target.value as 'active' | 'temporary' | 'permanent' })}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="active">Aktif</option>
                  <option value="temporary">Geçici</option>
                  <option value="permanent">Kalıcı</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsIPDialogOpen(false)}>
                İptal
              </Button>
              <Button 
                onClick={handleSaveIP} 
                disabled={createBlockedIP.isPending || updateBlockedIP.isPending}
              >
                {(createBlockedIP.isPending || updateBlockedIP.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingIP ? 'Güncelle' : 'Kaydet'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserX className="h-4 w-4" />
            Engellenmiş Kullanıcılar
          </TabsTrigger>
          <TabsTrigger value="ips" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Engellenmiş IP'ler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* User Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktif</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Geçici</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.temporary}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kalıcı</CardTitle>
                <UserX className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.permanent}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ips" className="space-y-6">
          {/* IP Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam IP</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ipData?.stats?.total || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktif</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ipData?.stats?.active || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Geçici</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ipData?.stats?.temporary || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kalıcı</CardTitle>
                <Globe className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ipData?.stats?.permanent || 0}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={activeTab === 'users' ? "Kullanıcı ara..." : "IP adresi ara..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="temporary">Geçici</SelectItem>
              <SelectItem value="permanent">Kalıcı</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {((activeTab === 'users' && selectedUsers.length > 0) || 
          (activeTab === 'ips' && selectedIPs.length > 0)) && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {activeTab === 'users' ? selectedUsers.length : selectedIPs.length} seçili
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Seçilenleri Sil
            </Button>
          </div>
        )}
      </div>

      {/* Tables */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="users">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onCheckedChange={selectAll}
                      />
                    </TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Engellenme Tarihi</TableHead>
                    <TableHead>Sebep</TableHead>
                    <TableHead>Engel Bitiş</TableHead>
                    <TableHead>Engelleyen</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id} className={selectedUsers.includes(user.id) ? 'bg-muted/50' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleSelection(user.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.blockedDate}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={user.reason}>
                          {user.reason}
                        </TableCell>
                        <TableCell>
                          {user.status === 'temporary' ? user.blockedUntil || '-' : '-'}
                        </TableCell>
                        <TableCell>{user.blockedBy}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(user.id)}
                                className="text-destructive"
                                disabled={deleteBlockedUser.isPending}
                              >
                                {deleteBlockedUser.isPending ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        {searchTerm ? 'Arama kriterine uygun kullanıcı bulunamadı.' : 'Henüz engellenmiş kullanıcı yok.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ips">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIPs.length === (ipData?.blockedIPs?.length || 0) && (ipData?.blockedIPs?.length || 0) > 0}
                        onCheckedChange={selectAll}
                      />
                    </TableHead>
                    <TableHead>IP Adresi</TableHead>
                    <TableHead>Konum</TableHead>
                    <TableHead>Deneme Sayısı</TableHead>
                    <TableHead>Engellenme Tarihi</TableHead>
                    <TableHead>Sebep</TableHead>
                    <TableHead>Engelleyen</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ipData?.blockedIPs?.length > 0 ? (
                    ipData.blockedIPs.map((ip: any) => (
                      <TableRow key={ip.id} className={selectedIPs.includes(ip.id) ? 'bg-muted/50' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIPs.includes(ip.id)}
                            onCheckedChange={() => toggleSelection(ip.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium font-mono">{ip.ip}</TableCell>
                        <TableCell>{ip.location || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ip.attempts}</Badge>
                        </TableCell>
                        <TableCell>{new Date(ip.blockedAt).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={ip.reason}>
                          {ip.reason}
                        </TableCell>
                        <TableCell>{ip.blockedBy}</TableCell>
                        <TableCell>{getStatusBadge(ip.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenIPDialog(ip)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteIP(ip.id)}
                                className="text-destructive"
                                disabled={deleteBlockedIP.isPending}
                              >
                                {deleteBlockedIP.isPending ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        {searchTerm ? 'Arama kriterine uygun IP bulunamadı.' : 'Henüz engellenmiş IP yok.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
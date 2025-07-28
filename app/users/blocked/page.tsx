'use client'

import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, Edit, Trash2, UserX, Calendar, Clock, Loader2, AlertTriangle, Shield, Globe, Download } from 'lucide-react';
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
import {
  useBlockedUsers,
  useBlockedIPs,
  useCreateBlockedUser,
  useCreateBlockedIP,
  useUpdateBlockedUser,
  useUpdateBlockedIP,
  useDeleteBlockedUser,
  useDeleteBlockedIP
} from '@/hooks/use-api';
import { useDebounce } from '@/hooks/use-api';
import { useQueryClient } from '@tanstack/react-query';
import type { BlockedUser, BlockedIP, CreateBlockedUserData, CreateBlockedIPData, UpdateBlockedIPData } from '@/types/api';

export default function BlockedUsersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedIPs, setSelectedIPs] = useState<string[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<BlockedUser | null>(null);
  const [editingIP, setEditingIP] = useState<BlockedIP | null>(null);
  const [formData, setFormData] = useState<CreateBlockedUserData>({
    username: '',
    email: '',
    reason: '',
    status: 'active',
    blockedUntil: undefined
  });
  const [ipFormData, setIPFormData] = useState<CreateBlockedIPData>({
    ip: '',
    reason: '',
    location: '',
    attempts: 1,
    status: 'active'
  });

  // API hooks - Kullanıcılar için
  const { 
    data: usersData, 
    isLoading: usersLoading, 
    error: usersError 
  } = useBlockedUsers({ 
    search: debouncedSearchTerm || '',
  }, {
    enabled: activeTab === 'users' // Sadece users tabı aktifken çağrılır
  });

  // API hooks - IP'ler için
  const { data: blockedUser, isLoading: blockedUserLoading, error: blockedUserError } = useBlockedUsers({search: debouncedSearchTerm || '',}, {enabled: activeTab === 'users'});
  const { data: ipsData, isLoading: ipsLoading, error: ipsError } = useBlockedIPs({ search: debouncedSearchTerm || '',}, { enabled: activeTab === 'ips' });

  const createBlockedUser = useCreateBlockedUser();
  const createBlockedIP = useCreateBlockedIP();
  const updateBlockedUser = useUpdateBlockedUser();
  const updateBlockedIP = useUpdateBlockedIP();
  const deleteBlockedUser = useDeleteBlockedUser();
  const deleteBlockedIP = useDeleteBlockedIP();

  // Tab değiştiğinde arama terimini sıfırla
  useEffect(() => {
    setSearchTerm('');
    setSelectedUsers([]);
    setSelectedIPs([]);
    setStatusFilter('all');
  }, [activeTab]);

  // Kullanıcı dialog işlemleri
  const handleOpenUserDialog = (user: BlockedUser | null = null) => {
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

  // IP dialog işlemleri
  const handleOpenIPDialog = (ip: BlockedIP | null = null) => {
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
    setIsDialogOpen(true);
  };

  // Kaydetme işlemleri
  const handleSave = async () => {
    try {
      if (activeTab === 'users') {
        if (editingUser) {
          await updateBlockedUser.mutateAsync({
            id: editingUser.id,
            data: formData
          });
          queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
        } else {
          await createBlockedUser.mutateAsync(formData);
        }
      } else {
        if (editingIP) {
          await updateBlockedIP.mutateAsync({
            id: editingIP.id,
            data: ipFormData
          });
          queryClient.invalidateQueries({ queryKey: ['blockedIPs'] });
        } else {
          await createBlockedIP.mutateAsync({
            ...ipFormData,
            blockedBy: 'admin' // In real app, get from auth
          });
        }
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  // Silme işlemleri
  const handleDelete = async (id: string) => {
    try {
      if (activeTab === 'users') {
        await deleteBlockedUser.mutateAsync(id);
      } else {
        await deleteBlockedIP.mutateAsync(id);
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  // Toplu silme işlemleri
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
      const users = usersData?.users || [];
      if (selectedUsers.length === users.length && users.length > 0) {
        setSelectedUsers([]);
      } else {
        setSelectedUsers(users.map(user => user.id));
      }
    } else {
      const ips = ipsData?.ips || [];
      if (selectedIPs.length === ips.length && ips.length > 0) {
        setSelectedIPs([]);
      } else {
        setSelectedIPs(ips.map(ip => ip.id));
      }
    }
  };

  // CSV export
  const exportToCSV = () => {
    if (activeTab === 'users') {
      const users = usersData?.users || [];
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
      const headers = ['IP Address', 'Reason', 'Location', 'Attempts', 'Status', 'Blocked Date'];
      const rows = ipsData?.ips?.map(ip => [
        ip.ip,
        ip.reason || '',
        ip.location || '',
        ip.attempts || 1,
        ip.status,
        ip.blockedDate
      ]) || [];
      
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
      <Badge variant={variants[status] as any}>
        {labels[status]}
      </Badge>
    );
  };

  // Loading state
  const isLoading = activeTab === 'users' ? usersLoading : ipsLoading;
  const error = activeTab === 'users' ? usersError : ipsError;
  const currentData = activeTab === 'users' ? usersData : ipsData;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Engelleme Yönetimi</h1>
            <p className="text-muted-foreground">Engellenmiş kullanıcıları ve IP adreslerini yönetin</p>
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

  const users = usersData?.users || [];
  const ips = ipsData?.ips || [];
  const userStats = usersData?.stats || { total: 0, active: 0, temporary: 0, permanent: 0 };
  const ipStats = ipsData?.stats || { total: 0, active: 0, temporary: 0, permanent: 0 };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
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
              <Button 
                onClick={() => activeTab === 'users' ? handleOpenUserDialog() : handleOpenIPDialog()} 
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {activeTab === 'users' ? 'Kullanıcı Engelle' : 'IP Engelle'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {activeTab === 'users' 
                    ? (editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Engelle')
                    : (editingIP ? 'IP Düzenle' : 'Yeni IP Engelle')
                  }
                </DialogTitle>
                <DialogDescription>
                  {activeTab === 'users'
                    ? (editingUser ? 'Kullanıcı bilgilerini düzenleyin' : 'Engellenecek kullanıcı bilgilerini girin')
                    : (editingIP ? 'IP bilgilerini düzenleyin' : 'Engellenecek IP bilgilerini girin')
                  }
                </DialogDescription>
              </DialogHeader>
              
              {activeTab === 'users' ? (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">Kullanıcı Adı</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reason" className="text-right">Sebep</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Durum</Label>
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
                      <Label htmlFor="blockedUntil" className="text-right">Engel Bitiş Tarihi</Label>
                      <Input
                        id="blockedUntil"
                        type="date"
                        value={formData.blockedUntil || ''}
                        onChange={(e) => setFormData({ ...formData, blockedUntil: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ip" className="text-right">IP Adresi</Label>
                    <Input
                      id="ip"
                      value={ipFormData.ip}
                      onChange={(e) => setIPFormData({ ...ipFormData, ip: e.target.value })}
                      className="col-span-3"
                      placeholder="192.168.1.1"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">Konum</Label>
                    <Input
                      id="location"
                      value={ipFormData.location}
                      onChange={(e) => setIPFormData({ ...ipFormData, location: e.target.value })}
                      className="col-span-3"
                      placeholder="Türkiye, İstanbul"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="attempts" className="text-right">Deneme Sayısı</Label>
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
                    <Label htmlFor="ip-reason" className="text-right">Sebep</Label>
                    <Textarea
                      id="ip-reason"
                      value={ipFormData.reason}
                      onChange={(e) => setIPFormData({ ...ipFormData, reason: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ip-status" className="text-right">Durum</Label>
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
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={
                    activeTab === 'users' 
                      ? (createBlockedUser.isPending || updateBlockedUser.isPending)
                      : (createBlockedIP.isPending || updateBlockedIP.isPending)
                  }
                >
                  {((activeTab === 'users' && (createBlockedUser.isPending || updateBlockedUser.isPending)) ||
                    (activeTab === 'ips' && (createBlockedIP.isPending || updateBlockedIP.isPending))) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {(activeTab === 'users' ? editingUser : editingIP) ? 'Güncelle' : 'Kaydet'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktif</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Geçici</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.temporary}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kalıcı</CardTitle>
                <UserX className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.permanent}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ips" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam IP</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ipStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktif</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ipStats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Geçici</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ipStats.temporary}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kalıcı</CardTitle>
                <Globe className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ipStats.permanent}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      activeTab === 'users' 
                        ? (selectedUsers.length === users.length && users.length > 0)
                        : (selectedIPs.length === ips.length && ips.length > 0)
                    }
                    onCheckedChange={selectAll}
                  />
                </TableHead>
                {activeTab === 'users' ? (
                  <>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Engellenme Tarihi</TableHead>
                    <TableHead>Sebep</TableHead>
                    <TableHead>Engel Bitiş</TableHead>
                    <TableHead>Engelleyen</TableHead>
                    <TableHead>Durum</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>IP Adresi</TableHead>
                    <TableHead>Konum</TableHead>
                    <TableHead>Engellenme Tarihi</TableHead>
                    <TableHead>Sebep</TableHead>
                    <TableHead>Deneme Sayısı</TableHead>
                    <TableHead>Durum</TableHead>
                  </>
                )}
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTab === 'users' ? (
                users.length > 0 ? (
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
                            <DropdownMenuItem onClick={() => handleOpenUserDialog(user)}>
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
                )
              ) : (
                ips.length > 0 ? (
                  ips.map((ip) => (
                    <TableRow key={ip.id} className={selectedIPs.includes(ip.id) ? 'bg-muted/50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIPs.includes(ip.id)}
                          onCheckedChange={() => toggleSelection(ip.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{ip.ip}</TableCell>
                      <TableCell>{ip.location || '-'}</TableCell>
                      <TableCell>{ip.blockedDate}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={ip.reason}>
                        {ip.reason}
                      </TableCell>
                      <TableCell>{ip.attempts || 1}</TableCell>
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
                              onClick={() => handleDelete(ip.id)}
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
                    <TableCell colSpan={8} className="h-24 text-center">
                      {searchTerm ? 'Arama kriterine uygun IP bulunamadı.' : 'Henüz engellenmiş IP yok.'}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
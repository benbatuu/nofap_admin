'use client'

import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Users,
  Key,
  Search,
  UserCheck,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import {
  useRoles,
  usePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
  useDashboardStats
} from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import type { Role, Permission } from '@/types/api';

export default function Page() {
  const [activeTab, setActiveTab] = useState('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Role | Permission | null>(null);

  // API hooks - fetch all data without search parameter
  const { data: allRoles = [], isLoading: rolesLoading, error: rolesError } = useRoles({ search: '' });
  const { data: allPermissions = [], isLoading: permissionsLoading, error: permissionsError } = usePermissions({ search: '' });
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();

  // Mutation hooks
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  const createPermissionMutation = useCreatePermission();
  const updatePermissionMutation = useUpdatePermission();
  const deletePermissionMutation = useDeletePermission();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    category: ''
  });

  // Filter data locally based on search term
  const roles = allRoles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const permissions = allPermissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading and error states
  const isLoading = activeTab === 'roles' ? rolesLoading : permissionsLoading;
  const error = activeTab === 'roles' ? rolesError : permissionsError;

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Veri Yüklenemedi</h3>
            <p className="text-muted-foreground">
              {activeTab === 'roles' ? 'Roller' : 'İzinler'} yüklenirken bir hata oluştu.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleCreate = async () => {
    try {
      if (activeTab === 'roles') {
        await createRoleMutation.mutateAsync({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions
        });
      } else {
        await createPermissionMutation.mutateAsync({
          name: formData.name,
          description: formData.description,
          category: formData.category || 'General'
        });
      }
      setShowCreateModal(false);
      setFormData({ name: '', description: '', permissions: [], category: '' });
    } catch (error) {
      console.error('Create error:', error);
    }
  };

  const handleEdit = (item: Role | Permission) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      permissions: 'permissions' in item ? item.permissions : [],
      category: 'category' in item ? item.category : ''
    });
    setShowCreateModal(true);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      if (activeTab === 'roles') {
        await updateRoleMutation.mutateAsync({
          id: editingItem.id,
          data: {
            name: formData.name,
            description: formData.description,
            permissions: formData.permissions
          }
        });
      } else {
        await updatePermissionMutation.mutateAsync({
          id: editingItem.id,
          data: {
            name: formData.name,
            description: formData.description,
            category: formData.category
          }
        });
      }
      setShowCreateModal(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', permissions: [], category: '' });
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (activeTab === 'roles') {
        await deleteRoleMutation.mutateAsync(id);
      } else {
        await deletePermissionMutation.mutateAsync(id);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row lg:flex-row items-center space-y-2 md:space-y-0 justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-center md:text-left">Access Management</h1>
          <p className="text-muted-foreground mt-1 text-center md:text-left">Manage roles and permissions for your application</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create {activeTab === 'roles' ? 'Role' : 'Permission'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Roles</p>
              <p className="text-2xl font-semibold">{allRoles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Permissions</p>
              <p className="text-2xl font-semibold">{allPermissions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-semibold">{allRoles.reduce((sum, role) => sum + role.userCount, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-semibold">
                {statsLoading ? '...' : (dashboardStats?.activeUsers || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'roles'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            Roles
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'permissions'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            Permissions
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-card border rounded-lg">
        {activeTab === 'roles' ? (
          <div>
            <div className="px-6 py-4 border-b">
              <h3 className="font-medium">Roles</h3>
              <p className="text-sm text-muted-foreground">Manage user roles and their permissions</p>
            </div>
            <div className="divide-y">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div>
                          <Skeleton className="h-5 w-24 mb-2" />
                          <Skeleton className="h-4 w-48 mb-2" />
                          <div className="flex gap-1">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="w-8 h-8" />
                        <Skeleton className="w-8 h-8" />
                      </div>
                    </div>
                  </div>
                ))
              ) : roles.length === 0 && searchTerm ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-muted-foreground">
                    <strong>{searchTerm}</strong> için rol bulunamadı
                  </p>
                </div>
              ) : (
                roles.map((role) => (
                  <div key={role.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{role.name}</h4>
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {role.userCount} users
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                          <div className="flex gap-1 mt-2">
                            {role.permissions.slice(0, 3).map((permission) => (
                              <span
                                key={permission}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                              >
                                {permission}
                              </span>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className="text-xs text-muted-foreground px-2 py-1">
                                +{role.permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(role)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          disabled={deleteRoleMutation.isPending}
                          className="p-2 hover:bg-muted rounded-lg transition-colors text-destructive disabled:opacity-50"
                        >
                          {deleteRoleMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="px-6 py-4 border-b">
              <h3 className="font-medium">Permissions</h3>
              <p className="text-sm text-muted-foreground">Define what actions users can perform</p>
            </div>
            <div className="divide-y">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div>
                          <Skeleton className="h-5 w-24 mb-2" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="w-8 h-8" />
                        <Skeleton className="w-8 h-8" />
                      </div>
                    </div>
                  </div>
                ))
              ) : permissions.length === 0 && searchTerm ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-muted-foreground">
                    &quot;{searchTerm}&quot; için izin bulunamadı
                  </p>
                </div>
              ) : (
                permissions.map((permission) => (
                  <div key={permission.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <Key className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{permission.name}</h4>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {permission.category}
                            </span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {permission.rolesCount} roles
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{permission.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(permission)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(permission.id)}
                          disabled={deletePermissionMutation.isPending}
                          className="p-2 hover:bg-muted rounded-lg transition-colors text-destructive disabled:opacity-50"
                        >
                          {deletePermissionMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4">
              {editingItem ? 'Edit' : 'Create'} {activeTab === 'roles' ? 'Role' : 'Permission'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>
              {activeTab === 'permissions' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter category"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingItem(null);
                  setFormData({ name: '', description: '', permissions: [], category: '' });
                }}
                className="flex-1 px-4 py-2 border border-input bg-background hover:bg-muted rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingItem ? handleUpdate : handleCreate}
                disabled={
                  !formData.name ||
                  !formData.description ||
                  createRoleMutation.isPending ||
                  updateRoleMutation.isPending ||
                  createPermissionMutation.isPending ||
                  updatePermissionMutation.isPending
                }
                className="flex-1 bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(createRoleMutation.isPending || updateRoleMutation.isPending || createPermissionMutation.isPending || updatePermissionMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
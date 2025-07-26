'use client'

import React, { useState, useEffect } from 'react';
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
import { ErrorBoundary } from '@/components/error-boundary';
import { ClientOnly } from '@/components/client-only';
import { RolesPageSkeleton } from '@/components/loading-skeleton';
import type { Role, Permission } from '@/types/api';

function RolesPageContent() {
  const [activeTab, setActiveTab] = useState('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Role | Permission | null>(null);
  const [mounted, setMounted] = useState(false);

  // API hooks - fetch all data without search parameter
  const { data: allRoles = [], isLoading: rolesLoading, error: rolesError } = useRoles({ search: '' });
  const { data: allPermissions = [], isLoading: permissionsLoading, error: permissionsError } = usePermissions({ search: '' });
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showPermissionAssignment, setShowPermissionAssignment] = useState(false);
  const [assigningRole, setAssigningRole] = useState<Role | null>(null);

  // Filter data locally based on search term with safety checks
  const roles = Array.isArray(allRoles) ? allRoles.filter(role =>
    role?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const permissions = Array.isArray(allPermissions) ? allPermissions.filter(permission =>
    permission?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission?.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Loading and error states
  const isLoading = activeTab === 'roles' ? rolesLoading : permissionsLoading;
  const error = activeTab === 'roles' ? rolesError : permissionsError;

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col md:flex-row lg:flex-row items-center space-y-2 md:space-y-0 justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-6 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-b">
          <div className="flex space-x-8">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <Skeleton className="h-10 w-64" />
        <div className="bg-card border rounded-lg">
          <div className="px-6 py-4 border-b">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="divide-y">
            {[...Array(3)].map((_, i) => (
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
            ))}
          </div>
        </div>
      </div>
    );
  }

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

  // Bulk operations
  const handleBulkDelete = async () => {
    const itemsToDelete = activeTab === 'roles' ? selectedRoles : selectedPermissions;
    
    try {
      await Promise.all(
        itemsToDelete.map(id => 
          activeTab === 'roles' 
            ? deleteRoleMutation.mutateAsync(id)
            : deletePermissionMutation.mutateAsync(id)
        )
      );
      
      if (activeTab === 'roles') {
        setSelectedRoles([]);
      } else {
        setSelectedPermissions([]);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
    }
  };

  const toggleSelection = (id: string) => {
    if (activeTab === 'roles') {
      setSelectedRoles(prev =>
        prev.includes(id) ? prev.filter(roleId => roleId !== id) : [...prev, id]
      );
    } else {
      setSelectedPermissions(prev =>
        prev.includes(id) ? prev.filter(permId => permId !== id) : [...prev, id]
      );
    }
  };

  const selectAll = () => {
    if (activeTab === 'roles') {
      if (selectedRoles.length === roles.length) {
        setSelectedRoles([]);
      } else {
        setSelectedRoles(roles.map(role => role.id));
      }
    } else {
      if (selectedPermissions.length === permissions.length) {
        setSelectedPermissions([]);
      } else {
        setSelectedPermissions(permissions.map(permission => permission.id));
      }
    }
  };

  // Permission assignment
  const handleAssignPermissions = (role: Role) => {
    setAssigningRole(role);
    setFormData({
      ...formData,
      permissions: role.permissions
    });
    setShowPermissionAssignment(true);
  };

  const handleUpdateRolePermissions = async () => {
    if (!assigningRole) return;

    try {
      await updateRoleMutation.mutateAsync({
        id: assigningRole.id,
        data: {
          permissions: formData.permissions
        }
      });
      setShowPermissionAssignment(false);
      setAssigningRole(null);
    } catch (error) {
      console.error('Update role permissions error:', error);
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
              <p className="text-2xl font-semibold">{Array.isArray(allRoles) ? allRoles.length : 0}</p>
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
              <p className="text-2xl font-semibold">{Array.isArray(allPermissions) ? allPermissions.length : 0}</p>
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
              <p className="text-2xl font-semibold">
                {Array.isArray(allRoles) ? allRoles.reduce((sum, role) => sum + (role?.userCount || 0), 0) : 0}
              </p>
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
                {statsLoading ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  dashboardStats?.users?.active || 0
                )}
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
      <div className="flex items-center justify-between gap-4">
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

        {/* Bulk Actions */}
        {((activeTab === 'roles' && selectedRoles.length > 0) || 
          (activeTab === 'permissions' && selectedPermissions.length > 0)) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {activeTab === 'roles' ? selectedRoles.length : selectedPermissions.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-card border rounded-lg">
        {activeTab === 'roles' ? (
          <div>
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Roles</h3>
                  <p className="text-sm text-muted-foreground">Manage user roles and their permissions</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedRoles.length === roles.length && roles.length > 0}
                    onChange={selectAll}
                    className="rounded border-input"
                  />
                  <label className="text-sm text-muted-foreground">Select All</label>
                </div>
              </div>
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
                  <div key={role.id} className={`px-6 py-4 hover:bg-muted/50 transition-colors ${selectedRoles.includes(role.id) ? 'bg-muted/30' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.id)}
                          onChange={() => toggleSelection(role.id)}
                          className="rounded border-input"
                        />
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
                          onClick={() => handleAssignPermissions(role)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors text-blue-600"
                          title="Assign Permissions"
                        >
                          <Key className="w-4 h-4" />
                        </button>
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Permissions</h3>
                  <p className="text-sm text-muted-foreground">Define what actions users can perform</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.length === permissions.length && permissions.length > 0}
                    onChange={selectAll}
                    className="rounded border-input"
                  />
                  <label className="text-sm text-muted-foreground">Select All</label>
                </div>
              </div>
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
                  <div key={permission.id} className={`px-6 py-4 hover:bg-muted/50 transition-colors ${selectedPermissions.includes(permission.id) ? 'bg-muted/30' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => toggleSelection(permission.id)}
                          className="rounded border-input"
                        />
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

      {/* Permission Assignment Modal */}
      {showPermissionAssignment && assigningRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              Assign Permissions to {assigningRole.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Select the permissions you want to assign to this role
            </p>
            
            <div className="space-y-4 mb-6">
              {Array.isArray(allPermissions) && allPermissions.length > 0 ? (
                // Group permissions by category
                Object.entries(
                  allPermissions.reduce((acc, permission) => {
                    const category = permission.category || 'General';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(permission);
                    return acc;
                  }, {} as Record<string, typeof allPermissions>)
                ).map(([category, categoryPermissions]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {categoryPermissions.map((permission) => (
                        <label key={permission.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  permissions: [...formData.permissions, permission.name]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  permissions: formData.permissions.filter(p => p !== permission.name)
                                });
                              }
                            }}
                            className="rounded border-input"
                          />
                          <div>
                            <div className="font-medium text-sm">{permission.name}</div>
                            <div className="text-xs text-muted-foreground">{permission.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No permissions available</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPermissionAssignment(false);
                  setAssigningRole(null);
                }}
                className="flex-1 px-4 py-2 border border-input bg-background hover:bg-muted rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRolePermissions}
                disabled={updateRoleMutation.isPending}
                className="flex-1 bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updateRoleMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Update Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <ClientOnly fallback={<RolesPageSkeleton />}>
        <RolesPageContent />
      </ClientOnly>
    </ErrorBoundary>
  );
}
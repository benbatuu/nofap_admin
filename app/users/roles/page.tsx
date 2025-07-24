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
} from 'lucide-react';

export default function Page() {
  const [activeTab, setActiveTab] = useState('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Sample data
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Admin',
      description: 'Full system access',
      userCount: 3,
      permissions: ['read', 'write', 'delete', 'manage_users'],
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Editor',
      description: 'Content management access',
      userCount: 12,
      permissions: ['read', 'write'],
      createdAt: '2024-01-20'
    },
    {
      id: 3,
      name: 'Viewer',
      description: 'Read-only access',
      userCount: 25,
      permissions: ['read'],
      createdAt: '2024-02-01'
    }
  ]);

  const [permissions, setPermissions] = useState([
    {
      id: 1,
      name: 'read',
      description: 'View content and data',
      category: 'Content',
      rolesCount: 3
    },
    {
      id: 2,
      name: 'write',
      description: 'Create and edit content',
      category: 'Content',
      rolesCount: 2
    },
    {
      id: 3,
      name: 'delete',
      description: 'Remove content and data',
      category: 'Content',
      rolesCount: 1
    },
    {
      id: 4,
      name: 'manage_users',
      description: 'Manage user accounts',
      category: 'User Management',
      rolesCount: 1
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    category:''
  });

  const handleCreate = () => {
    if (activeTab === 'roles') {
      const newRole = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        userCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setRoles([...roles, newRole]);
    } else {
      const newPermission = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        category: formData.category || 'General',
        rolesCount: 0
      };
      setPermissions([...permissions, newPermission]);
    }
    setShowCreateModal(false);
    setFormData({ name: '', description: '', permissions: [],category:'' });
  };

  const handleEdit = (item:any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      permissions: item.permissions || [],
      category: item.category || ''
    });
    setShowCreateModal(true);
  };

  const handleUpdate = () => {
    if (activeTab === 'roles') {
      setRoles(roles.map(role => 
        role.id === editingItem.id 
          ? { ...role, ...formData }
          : role
      ));
    } else {
      setPermissions(permissions.map(permission => 
        permission.id === editingItem.id 
          ? { ...permission, ...formData }
          : permission
      ));
    }
    setShowCreateModal(false);
    setEditingItem(null);
    setFormData({ name: '', description: '', permissions: [],category:'' });
  };

  const handleDelete = (id:number) => {
    if (activeTab === 'roles') {
      setRoles(roles.filter(role => role.id !== id));
    } else {
      setPermissions(permissions.filter(permission => permission.id !== id));
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <p className="text-2xl font-semibold">{roles.length}</p>
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
              <p className="text-2xl font-semibold">{permissions.length}</p>
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
              <p className="text-2xl font-semibold">{roles.reduce((sum, role) => sum + role.userCount, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Sessions</p>
              <p className="text-2xl font-semibold">124</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'roles'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Roles
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'permissions'
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
              {filteredRoles.map((role) => (
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
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="px-6 py-4 border-b">
              <h3 className="font-medium">Permissions</h3>
              <p className="text-sm text-muted-foreground">Define what actions users can perform</p>
            </div>
            <div className="divide-y">
              {filteredPermissions.map((permission) => (
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
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
                  setFormData({ name: '', description: '', permissions: [],category:'' });
                }}
                className="flex-1 px-4 py-2 border border-input bg-background hover:bg-muted rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingItem ? handleUpdate : handleCreate}
                className="flex-1 bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
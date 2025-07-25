'use client'
import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle,
  Clock,
  X,
  Eye,
  Trash2,
  RefreshCw,
  Filter,
  Calendar,
  User,
  Target,
  Brain,
  BarChart3,
  Plus,
  Download,
  Settings,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { useTasks } from '@/hooks/use-api';
import { TaskService } from '@/lib/services';

export default function TasksPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [searchSlipId, setSearchSlipId] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form states
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Mindfulness',
    difficulty: 'easy',
    userId: '',
    userName: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [newTemplate, setNewTemplate] = useState({
    title: '',
    description: '',
    category: 'Mindfulness',
    difficulty: 'easy',
    tags: []
  });

  // API hook for fetching tasks
  const {
    data: tasksData,
    isLoading,
    error,
    refetch,
  } = useTasks({
    page: 1,
    limit: 100,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    category: selectedUser !== 'all' ? selectedUser : undefined,
    search: searchSlipId || undefined
  });

  const tasks = tasksData?.tasks || [];

  // Mock data for fallback - AI tarafından otomatik oluşturulan ve atanan görevler
  const [mockTasks, setMockTasks] = useState([
    {
      id: 1,
      title: "Günlük Meditasyon Rutini",
      description: "10 dakikalık nefes egzersizi yaparak zihnini sakinleştir. Bu egzersiz urgeleri kontrol etmende yardımcı olacak.",
      status: "active", // AI tarafından otomatik atandı
      aiConfidence: 92,
      userId: "user_123",
      userName: "Ahmet K.",
      slipId: "slip_001",
      createdDate: "2025-01-20",
      dueDate: "2025-01-22",
      category: "Mindfulness",
      difficulty: "easy"
    },
    {
      id: 2,
      title: "Soğuk Duş Challenge",
      description: "3 dakikalık soğuk duş alarak mental direncini artır. Bu fiziksel rahatsızlık urgelere dayanma gücünü geliştirir.",
      status: "active",
      aiConfidence: 87,
      userId: "user_124",
      userName: "Mehmet S.",
      slipId: "slip_002",
      createdDate: "2025-01-19",
      dueDate: "2025-01-21",
      category: "Physical",
      difficulty: "medium"
    },
    {
      id: 3,
      title: "Günlük Journaling",
      description: "Bugünkü duygularını ve deneyimlerini yaz. Özellikle zor anları ve bunlarla nasıl başa çıktığını kaydet.",
      status: "completed", // Kullanıcı tamamladı
      aiConfidence: 95,
      userId: "user_123",
      userName: "Ahmet K.",
      slipId: "slip_003",
      createdDate: "2025-01-18",
      dueDate: "2025-01-20",
      category: "Mental",
      difficulty: "easy"
    },
    {
      id: 4,
      title: "Sosyal Aktivite Planla",
      description: "Bu hafta sonu arkadaşlarınla buluşma planı yap. Sosyal bağlantılar ruh halini iyileştirir.",
      status: "expired", // Süre doldu
      aiConfidence: 78,
      userId: "user_125",
      userName: "Ali Y.",
      slipId: null,
      createdDate: "2025-01-17",
      dueDate: "2025-01-19",
      category: "Social",
      difficulty: "medium"
    },
    {
      id: 5,
      title: "Telefon Detox Saati",
      description: "Akşam 8-10 arası telefonunu kapalı tut. Bu süreyi kitap okuma veya hobilerle geçir.",
      status: "active",
      aiConfidence: 89,
      userId: "user_124",
      userName: "Mehmet S.",
      slipId: "slip_004",
      createdDate: "2025-01-21",
      dueDate: "2025-01-23",
      category: "Digital",
      difficulty: "hard"
    }
  ]);

  const statusConfig = {
    active: { label: 'Aktif', color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20', icon: Clock },
    completed: { label: 'Tamamlandı', color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20', icon: CheckCircle },
    expired: { label: 'Süresi Doldu', color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20', icon: X }
  };

  const difficultyConfig = {
    easy: { label: 'Kolay', color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20' },
    medium: { label: 'Orta', color: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/20' },
    hard: { label: 'Zor', color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20' }
  };

  // Use real tasks if available, otherwise use mock data
  const displayTasks = tasks.length > 0 ? tasks : mockTasks;

  // Filtrelenmiş görevler
  const filteredTasks = useMemo(() => {
    return displayTasks.filter(task => {
      if (selectedStatus !== 'all' && task.status !== selectedStatus) return false;
      if (selectedUser !== 'all' && task.userId !== selectedUser) return false;
      if (searchSlipId && (!task.slipId || !task.slipId.includes(searchSlipId))) return false;
      if (selectedDateRange !== 'all') {
        const taskDate = new Date(task.createdDate || task.createdAt);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));

        if (selectedDateRange === 'today' && daysDiff !== 0) return false;
        if (selectedDateRange === 'week' && daysDiff > 7) return false;
        if (selectedDateRange === 'month' && daysDiff > 30) return false;
      }
      return true;
    });
  }, [displayTasks, selectedStatus, selectedUser, selectedDateRange, searchSlipId]);

  // İstatistikler
  const stats = useMemo(() => {
    const total = displayTasks.length;
    const completed = displayTasks.filter(t => t.status === 'completed').length;
    const active = displayTasks.filter(t => t.status === 'active').length;
    const expired = displayTasks.filter(t => t.status === 'expired').length;
    const avgConfidence = total > 0 ? displayTasks.reduce((sum, t) => sum + (t.aiConfidence || 0), 0) / total : 0;

    return { total, completed, active, expired, avgConfidence };
  }, [displayTasks]);

  const loadAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      const response = await fetch('/api/tasks/analytics?days=30');
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams({
        format,
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedUser !== 'all' && { userId: selectedUser }),
        ...(searchSlipId && { search: searchSlipId })
      });

      const response = await fetch(`/api/tasks/export?${params}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Dışa aktarma sırasında bir hata oluştu');
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.description || !newTask.userId || !newTask.userName) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setIsUpdating(true);
      await TaskService.createTask({
        ...newTask,
        dueDate: new Date(newTask.dueDate)
      });

      setNewTask({
        title: '',
        description: '',
        category: 'Mindfulness',
        difficulty: 'easy',
        userId: '',
        userName: '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Görev oluşturulurken bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.title || !newTemplate.description) {
      alert('Lütfen başlık ve açıklama alanlarını doldurun');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch('/api/tasks/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      });

      if (!response.ok) throw new Error('Failed to create template');

      setNewTemplate({
        title: '',
        description: '',
        category: 'Mindfulness',
        difficulty: 'easy',
        tags: []
      });

      setShowTemplateModal(false);
      alert('Şablon başarıyla oluşturuldu');
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Şablon oluşturulurken bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedTasks.length === 0) {
      alert('Lütfen en az bir görev seçin');
      return;
    }

    try {
      setIsUpdating(true);
      let data = {};

      if (action === 'complete') {
        data = { status: 'completed' };
        action = 'updateStatus';
      } else if (action === 'activate') {
        data = { status: 'active' };
        action = 'updateStatus';
      }

      const response = await fetch('/api/tasks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          taskIds: selectedTasks,
          data
        })
      });

      if (!response.ok) throw new Error('Bulk action failed');

      setSelectedTasks([]);
      refetch();
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('Toplu işlem sırasında bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegenerateTask = (taskId) => {
    // Belirli bir görevi yeniden üret
    alert(`Görev #${taskId} için AI yeni görev üretiyor...`);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) return;

    try {
      await TaskService.deleteTask(taskId);
      refetch();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Görev silinirken bir hata oluştu');
    }
  };

  const handleGenerateAllTasks = () => {
    // Tüm kullanıcılar için yeni görevler üret
    alert('AI tüm kullanıcılar için yeni görevler üretiyor...');
  };

  const uniqueUsers = [...new Set(displayTasks.map(t => ({ id: t.userId, name: t.userName })))];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Görev Yönetimi</h1>
          <p className="text-sm text-gray-600">Otomatik oluşturulan ve atanan görevler</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Analytics Button */}
          <button
            onClick={() => {
              setShowAnalytics(true);
              loadAnalytics();
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <TrendingUp className="w-4 h-4" />
            Analitik
          </button>

          {/* Export Button */}
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            CSV İndir
          </button>

          {/* Create Task Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Yeni Görev
          </button>

          {/* Create Template Button */}
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
          >
            <Settings className="w-4 h-4" />
            Şablon
          </button>

          <button
            onClick={handleGenerateAllTasks}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Tüm Görevleri Yenile
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Toplam</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-lg font-semibold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Aktif</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-lg font-semibold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Tamamlanan</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-lg font-semibold">{stats.expired}</p>
              <p className="text-xs text-muted-foreground">Süresi Doldu</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{Math.round(stats.avgConfidence)}%</p>
              <p className="text-xs text-muted-foreground">Ort. AI Güven</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-card p-4 rounded-lg border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtreler:</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="completed">Tamamlandı</option>
              <option value="expired">Süresi Doldu</option>
            </select>

            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Tüm Kullanıcılar</option>
              {uniqueUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>

            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Tüm Tarihler</option>
              <option value="today">Bugün</option>
              <option value="week">Son 7 Gün</option>
              <option value="month">Son 30 Gün</option>
            </select>

            <input
              type="text"
              placeholder="Slip ID ara..."
              value={searchSlipId}
              onChange={(e) => setSearchSlipId(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedTasks.length} görev seçildi
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('complete')}
                disabled={isUpdating}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                Tamamla
              </button>
              <button
                onClick={() => handleBulkAction('activate')}
                disabled={isUpdating}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Aktifleştir
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={isUpdating}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                Sil
              </button>
              <button
                onClick={() => setSelectedTasks([])}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Görev Listesi */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-card p-8 rounded-lg border text-center">
            <Target className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Filtrelenen kriterlere uygun görev bulunamadı.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const StatusIcon = statusConfig[task.status].icon;
            return (
              <div key={task.id} className="bg-card p-4 rounded-lg border">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Checkbox for bulk selection */}
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id.toString())}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTasks(prev => [...prev, task.id.toString()]);
                        } else {
                          setSelectedTasks(prev => prev.filter(id => id !== task.id.toString()));
                        }
                      }}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-base font-medium">{task.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusConfig[task.status].color}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {statusConfig[task.status].label}
                        </span>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${difficultyConfig[task.difficulty].color}`}>
                          {difficultyConfig[task.difficulty].label}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{task.description}</p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {task.userName}
                      </div>
                      {task.slipId && (
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {task.slipId}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Bitiş: {task.dueDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        AI Güven: {task.aiConfidence}%
                      </div>
                    </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
                      title="Detay Göster"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleRegenerateTask(task.id)}
                      className="p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
                      title="Bu Görevi Yeniden Üret"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* AI Güven Barı */}
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>AI Güven Oranı</span>
                    <span>{task.aiConfidence}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${task.aiConfidence >= 90 ? 'bg-green-500 dark:bg-green-600' :
                        task.aiConfidence >= 70 ? 'bg-yellow-500 dark:bg-yellow-600' : 'bg-red-500 dark:bg-red-600'
                        }`}
                      style={{ width: `${task.aiConfidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sayfa Alt Bilgisi */}
      <div className="text-center text-sm text-gray-500 py-2">
        {filteredTasks.length} görev gösteriliyor
      </div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Görev Analitikleri</h3>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {isLoadingAnalytics ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Productivity Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.productivityAnalytics?.totalTasks || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Toplam Görev</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.productivityAnalytics?.completedTasks || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Tamamlanan</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {analytics.productivityAnalytics?.completionRate || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Tamamlanma Oranı</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {analytics.productivityAnalytics?.averageConfidence || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Ortalama AI Güven</div>
                    </div>
                  </div>

                  {/* Category Performance */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Kategori Performansı</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analytics.categoryPerformance?.map((category: any) => (
                        <div key={category.category} className="bg-muted p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium">{category.category}</div>
                            <div className="text-sm text-muted-foreground">
                              {category.completed}/{category.total}
                            </div>
                          </div>
                          <div className="w-full bg-background rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${category.completionRate}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {category.completionRate}% tamamlanma oranı
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Stats */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Zorluk Dağılımı</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {analytics.difficultyStats?.map((diff: any) => (
                        <div key={diff.name} className="bg-muted p-4 rounded-lg text-center">
                          <div className="text-xl font-bold">{diff.count}</div>
                          <div className="text-sm text-muted-foreground capitalize">{diff.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Analitik verileri yüklenemedi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Yeni Görev Oluştur</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Başlık</label>
                <input
                  type="text"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Görev başlığı"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Açıklama</label>
                <textarea
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={4}
                  placeholder="Görev açıklaması"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Kategori</label>
                  <select
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  >
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Physical">Physical</option>
                    <option value="Mental">Mental</option>
                    <option value="Social">Social</option>
                    <option value="Digital">Digital</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Zorluk</label>
                  <select
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={newTask.difficulty}
                    onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })}
                  >
                    <option value="easy">Kolay</option>
                    <option value="medium">Orta</option>
                    <option value="hard">Zor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Kullanıcı ID</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="user_123"
                    value={newTask.userId}
                    onChange={(e) => setNewTask({ ...newTask, userId: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Kullanıcı Adı</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Ahmet K."
                    value={newTask.userName}
                    onChange={(e) => setNewTask({ ...newTask, userName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bitiş Tarihi</label>
                <input
                  type="date"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Yeni Görev Şablonu Oluştur</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Başlık</label>
                <input
                  type="text"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Şablon başlığı"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Açıklama</label>
                <textarea
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={4}
                  placeholder="Şablon açıklaması"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Kategori</label>
                  <select
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  >
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Physical">Physical</option>
                    <option value="Mental">Mental</option>
                    <option value="Social">Social</option>
                    <option value="Digital">Digital</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Zorluk</label>
                  <select
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={newTemplate.difficulty}
                    onChange={(e) => setNewTemplate({ ...newTemplate, difficulty: e.target.value })}
                  >
                    <option value="easy">Kolay</option>
                    <option value="medium">Orta</option>
                    <option value="hard">Zor</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateTemplate}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Şablon Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
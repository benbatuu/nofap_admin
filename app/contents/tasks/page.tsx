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
  TrendingUp,
  Edit,
  Copy,
  FileText,
  Search,
  AlertCircle
} from 'lucide-react';
import { useTasks, useCreateTask, useGenerateAITask, useBulkGenerateAITasks, useRegenerateTask } from '@/hooks/use-api';
import { useQueryClient } from '@tanstack/react-query';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTemplatesListModal, setShowTemplatesListModal] = useState(false);
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  // Form states
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Mindfulness',
    difficulty: 'easy',
    userId: '',
    userName: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    aiConfidence: 85,
    slipId: ''
  });

  const [aiGenerateForm, setAiGenerateForm] = useState({
    userId: '',
    userName: '',
    slipId: '',
    taskType: 'single'
  });

  const [newTemplate, setNewTemplate] = useState({
    title: '',
    description: '',
    category: 'Mindfulness',
    difficulty: 'easy',
    tags: [],
    estimatedDuration: 30
  });

  // Available categories and difficulties
  const categories = [
    'Mindfulness', 'Physical', 'Mental', 'Social', 'Digital', 
    'Productivity', 'Health', 'Learning', 'Creative', 'Spiritual'
  ];
  
  const difficulties = [
    { value: 'easy', label: 'Kolay', color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20' },
    { value: 'medium', label: 'Orta', color: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/20' },
    { value: 'hard', label: 'Zor', color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20' }
  ];

  // API hook for fetching tasks
  const {
    data: tasksData,
    isLoading,
    error,
    refetch,
  } = useTasks({
    page: currentPage,
    limit: pageLimit,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    userId: selectedUser !== 'all' ? selectedUser : undefined,
    search: searchQuery || undefined
  });

  const createTaskMutation = useCreateTask();
  const generateAITaskMutation = useGenerateAITask();
  const bulkGenerateAITasksMutation = useBulkGenerateAITasks();
  const regenerateTaskMutation = useRegenerateTask();

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
      if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'all' && task.difficulty !== selectedDifficulty) return false;
      if (selectedUser !== 'all' && task.userId !== selectedUser) return false;
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !task.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !task.userName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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
  }, [displayTasks, selectedStatus, selectedCategory, selectedDifficulty, selectedUser, selectedDateRange, searchQuery]);

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
        ...(searchQuery && { search: searchQuery })
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

  const loadTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      const response = await fetch('/api/tasks/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.description || !newTask.userId || !newTask.userName) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await createTaskMutation.mutateAsync({
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
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        aiConfidence: 85,
        slipId: ''
      });

      setShowCreateModal(false);
      alert('Görev başarıyla oluşturuldu');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Görev oluşturulurken bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditTask = async () => {
    if (!editingTask || !editingTask.title || !editingTask.description) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          category: editingTask.category,
          difficulty: editingTask.difficulty,
          dueDate: new Date(editingTask.dueDate),
          aiConfidence: editingTask.aiConfidence,
          slipId: editingTask.slipId
        })
      });

      if (!response.ok) throw new Error('Failed to update task');

      setEditingTask(null);
      setShowEditModal(false);
      refetch();
      alert('Görev başarıyla güncellendi');
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Görev güncellenirken bir hata oluştu');
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
        tags: [],
        estimatedDuration: 30
      });

      setShowTemplateModal(false);
      loadTemplates(); // Reload templates
      alert('Şablon başarıyla oluşturuldu');
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Şablon oluşturulurken bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateTaskFromTemplate = async (template: any) => {
    if (!newTask.userId || !newTask.userName) {
      alert('Lütfen kullanıcı bilgilerini doldurun');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await createTaskMutation.mutateAsync({
        title: template.title,
        description: template.description,
        category: template.category,
        difficulty: template.difficulty,
        userId: newTask.userId,
        userName: newTask.userName,
        dueDate: new Date(newTask.dueDate),
        aiConfidence: template.aiConfidence || 85
      });

      setShowTemplatesListModal(false);
      alert('Şablondan görev başarıyla oluşturuldu');
    } catch (error) {
      console.error('Error creating task from template:', error);
      alert('Şablondan görev oluşturulurken bir hata oluştu');
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

  const handleRegenerateTask = async (taskId) => {
    if (!confirm('Bu görev AI tarafından yeniden oluşturulacak. Devam etmek istiyor musunuz?')) return;

    try {
      setIsUpdating(true);
      const response = await regenerateTaskMutation.mutateAsync(taskId);
      
      if (response.success) {
        alert('Görev AI tarafından başarıyla yeniden oluşturuldu!');
        refetch();
      } else {
        throw new Error(response.error || 'Görev yeniden oluşturulamadı');
      }
    } catch (error) {
      console.error('Error regenerating task:', error);
      alert('Görev yeniden oluşturulurken bir hata oluştu: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to delete task');
      
      refetch();
      alert('Görev başarıyla silindi');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Görev silinirken bir hata oluştu');
    }
  };

  const handleGenerateAllTasks = async () => {
    if (!confirm('Tüm aktif kullanıcılar için AI görevleri oluşturulacak. Bu işlem biraz zaman alabilir. Devam etmek istiyor musunuz?')) return;

    try {
      setIsUpdating(true);
      const response = await bulkGenerateAITasksMutation.mutateAsync({});
      
      if (response.success) {
        const { totalUsers, successfulUsers, totalTasksCreated } = response.data;
        alert(`Başarılı! ${successfulUsers}/${totalUsers} kullanıcı için toplam ${totalTasksCreated} görev oluşturuldu.`);
        refetch();
      } else {
        throw new Error(response.error || 'Toplu görev oluşturma başarısız');
      }
    } catch (error) {
      console.error('Error generating bulk tasks:', error);
      alert('Toplu görev oluşturulurken bir hata oluştu: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const uniqueUsers = [...new Set(displayTasks.map(t => ({ id: t.userId, name: t.userName })))];

  const handleGenerateAITask = async () => {
    if (!aiGenerateForm.userId || !aiGenerateForm.userName) {
      alert('Lütfen kullanıcı bilgilerini doldurun');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await generateAITaskMutation.mutateAsync({
        userId: aiGenerateForm.userId,
        slipId: aiGenerateForm.slipId || undefined,
        taskType: aiGenerateForm.taskType
      });
      
      if (response.success) {
        const taskCount = response.data.count;
        alert(`${taskCount} AI görev(i) başarıyla oluşturuldu!`);
        setShowAIGenerateModal(false);
        setAiGenerateForm({
          userId: '',
          userName: '',
          slipId: '',
          taskType: 'single'
        });
        refetch();
      } else {
        throw new Error(response.error || 'AI görev oluşturma başarısız');
      }
    } catch (error) {
      console.error('Error generating AI task:', error);
      alert('AI görev oluşturulurken bir hata oluştu: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

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
            Yeni Şablon
          </button>

          {/* Templates List Button */}
          <button
            onClick={() => {
              setShowTemplatesListModal(true);
              loadTemplates();
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            Şablonlar
          </button>

          {/* AI Task Generation Button */}
          <button
            onClick={() => setShowAIGenerateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-sm"
          >
            <Brain className="w-4 h-4" />
            AI Görev Üret
          </button>

          <button
            onClick={handleGenerateAllTasks}
            disabled={isUpdating}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            AI Görev Üret (Tümü)
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
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtreler:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Tüm Zorluklar</option>
              {difficulties.map(diff => (
                <option key={diff.value} value={diff.value}>{diff.label}</option>
              ))}
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

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Görev ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring w-full"
              />
            </div>
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
                onClick={async () => {
                  if (selectedTasks.length === 0) return;
                  
                  const selectedTaskObjects = displayTasks.filter(task => 
                    selectedTasks.includes(task.id.toString())
                  );
                  
                  const uniqueUserIds = [...new Set(selectedTaskObjects.map(task => task.userId))];
                  
                  if (!confirm(`Seçilen görevlerin kullanıcıları (${uniqueUserIds.length} kullanıcı) için AI görevleri oluşturulacak. Devam etmek istiyor musunuz?`)) return;
                  
                  try {
                    setIsUpdating(true);
                    const response = await bulkGenerateAITasksMutation.mutateAsync({
                      userIds: uniqueUserIds
                    });
                    
                    if (response.success) {
                      alert(`${response.data.successfulUsers} kullanıcı için ${response.data.totalTasksCreated} AI görev oluşturuldu!`);
                      setSelectedTasks([]);
                    }
                  } catch (error) {
                    alert('AI görev oluşturma hatası: ' + error.message);
                  } finally {
                    setIsUpdating(false);
                  }
                }}
                disabled={isUpdating}
                className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded text-sm hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
              >
                AI Görev Üret
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
                      onClick={() => {
                        setEditingTask({
                          ...task,
                          dueDate: task.dueDate.split('T')[0] || task.dueDate
                        });
                        setShowEditModal(true);
                      }}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-md transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleRegenerateTask(task.id)}
                      disabled={isUpdating}
                      className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 rounded-md transition-colors disabled:opacity-50"
                      title="AI ile Yeniden Üret"
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
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
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Zorluk</label>
                  <select
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={newTask.difficulty}
                    onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })}
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bitiş Tarihi</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">AI Güven Oranı (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={newTask.aiConfidence}
                    onChange={(e) => setNewTask({ ...newTask, aiConfidence: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slip ID (Opsiyonel)</label>
                <input
                  type="text"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="slip_001"
                  value={newTask.slipId}
                  onChange={(e) => setNewTask({ ...newTask, slipId: e.target.value })}
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
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Zorluk</label>
                  <select
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={newTemplate.difficulty}
                    onChange={(e) => setNewTemplate({ ...newTemplate, difficulty: e.target.value })}
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tahmini Süre (dakika)</label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="30"
                  value={newTemplate.estimatedDuration}
                  onChange={(e) => setNewTemplate({ ...newTemplate, estimatedDuration: parseInt(e.target.value) })}
                />
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

      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Görevi Düzenle</h3>
              <button
                onClick={() => setShowEditModal(false)}
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
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Açıklama</label>
                <textarea
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={4}
                  placeholder="Görev açıklaması"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Kategori</label>
                  <select
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={editingTask.category}
                    onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Zorluk</label>
                  <select
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={editingTask.difficulty}
                    onChange={(e) => setEditingTask({ ...editingTask, difficulty: e.target.value })}
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bitiş Tarihi</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">AI Güven Oranı (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={editingTask.aiConfidence}
                    onChange={(e) => setEditingTask({ ...editingTask, aiConfidence: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slip ID (Opsiyonel)</label>
                <input
                  type="text"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="slip_001"
                  value={editingTask.slipId || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, slipId: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleEditTask}
                  disabled={isUpdating}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Güncelle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates List Modal */}
      {showTemplatesListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Görev Şablonları</h3>
              <button
                onClick={() => setShowTemplatesListModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {isLoadingTemplates ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Henüz şablon oluşturulmamış.</p>
                  <button
                    onClick={() => {
                      setShowTemplatesListModal(false);
                      setShowTemplateModal(true);
                    }}
                    className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    İlk Şablonu Oluştur
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      Şablondan görev oluşturmak için kullanıcı bilgilerini doldurun:
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <input
                        type="text"
                        placeholder="Kullanıcı ID"
                        className="px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        value={newTask.userId}
                        onChange={(e) => setNewTask({ ...newTask, userId: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Kullanıcı Adı"
                        className="px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        value={newTask.userName}
                        onChange={(e) => setNewTask({ ...newTask, userName: e.target.value })}
                      />
                    </div>
                  </div>

                  {templates.map(template => (
                    <div key={template.id} className="bg-muted p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">{template.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {template.category}
                            </span>
                            <span className={`px-2 py-1 rounded-md ${difficultyConfig[template.difficulty]?.color}`}>
                              {difficultyConfig[template.difficulty]?.label}
                            </span>
                            <span className="flex items-center gap-1">
                              <Brain className="w-3 h-3" />
                              {template.aiConfidence}%
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCreateTaskFromTemplate(template)}
                          disabled={isUpdating || !newTask.userId || !newTask.userName}
                          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                        >
                          <Copy className="w-4 h-4" />
                          Kullan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Task Generation Modal */}
      {showAIGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">AI Görev Oluştur</h3>
              </div>
              <button
                onClick={() => setShowAIGenerateModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">AI Görev Oluşturucu</span>
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  Yapay zeka, kullanıcının geçmiş verilerini ve slip bilgilerini analiz ederek kişiselleştirilmiş görevler oluşturur.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Kullanıcı ID *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="user_123"
                    value={aiGenerateForm.userId}
                    onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, userId: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Kullanıcı Adı *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Ahmet K."
                    value={aiGenerateForm.userName}
                    onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, userName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slip ID (Opsiyonel)</label>
                <input
                  type="text"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="slip_001 - AI bu slip'e göre özel görevler oluşturacak"
                  value={aiGenerateForm.slipId}
                  onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, slipId: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Slip ID girilirse, AI o slip'in tetikleyicilerine ve durumuna göre özel görevler oluşturur.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Görev Türü</label>
                <select
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={aiGenerateForm.taskType}
                  onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, taskType: e.target.value })}
                >
                  <option value="single">Tek Görev</option>
                  <option value="bulk">Çoklu Görev (5 adet)</option>
                  <option value="personalized">Kişiselleştirilmiş Paket</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {aiGenerateForm.taskType === 'single' && 'AI tek bir görev oluşturacak'}
                  {aiGenerateForm.taskType === 'bulk' && 'AI 5 farklı kategoride görev oluşturacak'}
                  {aiGenerateForm.taskType === 'personalized' && 'AI kullanıcının geçmişine göre özel görev paketi oluşturacak'}
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  AI Nasıl Çalışır?
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Kullanıcının streak durumunu analiz eder</li>
                  <li>• Geçmiş görev tamamlama oranlarını inceler</li>
                  <li>• Slip verilerinden tetikleyicileri tespit eder</li>
                  <li>• Kişiselleştirilmiş zorluk seviyesi belirler</li>
                  <li>• Uygun kategori ve zamanlama önerir</li>
                  <li>• Motivasyonel açıklamalar ekler</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAIGenerateModal(false)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleGenerateAITask}
                  disabled={isUpdating || !aiGenerateForm.userId || !aiGenerateForm.userName}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Brain className="w-4 h-4" />
                  AI Görev Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
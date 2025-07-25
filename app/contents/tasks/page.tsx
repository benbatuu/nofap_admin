'use client'
import React, { useState, useMemo } from 'react';
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
  BarChart3
} from 'lucide-react';

export default function TasksPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [searchSlipId, setSearchSlipId] = useState('');

  // Mock data - AI tarafından otomatik oluşturulan ve atanan görevler
  const [tasks, setTasks] = useState([
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

  // Filtrelenmiş görevler
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (selectedStatus !== 'all' && task.status !== selectedStatus) return false;
      if (selectedUser !== 'all' && task.userId !== selectedUser) return false;
      if (searchSlipId && (!task.slipId || !task.slipId.includes(searchSlipId))) return false;
      if (selectedDateRange !== 'all') {
        const taskDate = new Date(task.createdDate);
        const today = new Date();
        const daysDiff = Math.floor((today - taskDate) / (1000 * 60 * 60 * 24));

        if (selectedDateRange === 'today' && daysDiff !== 0) return false;
        if (selectedDateRange === 'week' && daysDiff > 7) return false;
        if (selectedDateRange === 'month' && daysDiff > 30) return false;
      }
      return true;
    });
  }, [tasks, selectedStatus, selectedUser, selectedDateRange, searchSlipId]);

  // İstatistikler
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const active = tasks.filter(t => t.status === 'active').length;
    const expired = tasks.filter(t => t.status === 'expired').length;
    const avgConfidence = tasks.reduce((sum, t) => sum + t.aiConfidence, 0) / total;

    return { total, completed, active, expired, avgConfidence };
  }, [tasks]);

  const handleRegenerateTask = (taskId) => {
    // Belirli bir görevi yeniden üret
    alert(`Görev #${taskId} için AI yeni görev üretiyor...`);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleGenerateAllTasks = () => {
    // Tüm kullanıcılar için yeni görevler üret
    alert('AI tüm kullanıcılar için yeni görevler üretiyor...');
  };

  const uniqueUsers = [...new Set(tasks.map(t => ({ id: t.userId, name: t.userName })))];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Görev Yönetimi</h1>
          <p className="text-sm text-gray-600">Otomatik oluşturulan ve atanan görevler</p>
        </div>
        <button
          onClick={handleGenerateAllTasks}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Tüm Görevleri Yenile
        </button>
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
    </div>
  );
}
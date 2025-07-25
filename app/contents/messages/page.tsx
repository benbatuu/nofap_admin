/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Reply,
  Archive,
  Trash2,
  MessageSquare,
  Bug,
  Settings,
  User,
  X
} from 'lucide-react';

// Mock data
const mockMessages = [
  {
    id: "MSG001",
    sender: "ahmet.yilmaz",
    title: "Uygulama çok yavaş çalışıyor",
    type: "bug",
    message: "Mobil uygulamada sayfa geçişleri çok yavaş oluyor. Özellikle ana sayfadan profil sayfasına geçerken 5-6 saniye beklemek zorunda kalıyorum.",
    status: "pending",
    createdAt: "2025-01-15T10:30:00Z"
  },
  {
    id: "MSG002",
    sender: "system",
    title: "Sistem bakım bildirimi",
    type: "system",
    message: "15 Ocak 2025 tarihinde sistem bakımı yapılacaktır. Bakım süresi boyunca hizmet kesintisi yaşanabilir.",
    status: "read",
    createdAt: "2025-01-14T14:20:00Z"
  },
  {
    id: "MSG003",
    sender: "zeynep.kaya",
    title: "Harika bir özellik önerisi",
    type: "feedback",
    message: "Dark mode özelliği eklenebilir mi? Gece kullanımı için çok faydalı olur. Ayrıca bildirim ayarları daha detaylandırılabilir.",
    status: "replied",
    createdAt: "2025-01-13T16:45:00Z"
  },
  {
    id: "MSG004",
    sender: "can.demir",
    title: "Şifremi unuttuğum için yardım",
    type: "support",
    message: "Hesabıma giriş yapamıyorum. Şifre sıfırlama e-postası da gelmiyor. Lütfen yardım edebilir misiniz?",
    status: "pending",
    createdAt: "2025-01-12T09:15:00Z"
  },
  {
    id: "MSG005",
    sender: "elif.ozkan",
    title: "Ödeme işleminde hata",
    type: "bug",
    message: "Kredi kartı ile ödeme yaparken sürekli hata alıyorum. Farklı kartlar denedim ama sorun devam ediyor.",
    status: "read",
    createdAt: "2025-01-11T11:30:00Z"
  },
  {
    id: "MSG006",
    sender: "system",
    title: "Güvenlik güncellemesi",
    type: "system",
    message: "Sistemimizde güvenlik güncellemesi yapıldı. Tüm kullanıcıların şifrelerini yenilemesi önerilir.",
    status: "read",
    createdAt: "2025-01-10T08:00:00Z"
  }
];

const messageTypeLabels = {
  feedback: "Geri Bildirim",
  support: "Destek",
  bug: "Hata",
  system: "Sistem"
};

const messageTypeIcons = {
  feedback: MessageSquare,
  support: User,
  bug: Bug,
  system: Settings
};

const statusLabels = {
  pending: "Bekliyor",
  read: "Okundu",
  replied: "Cevaplandı"
};

const statusColors = {
  pending: "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/20",
  read: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20",
  replied: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20"
};

export default function Page() {
  const [messages, setMessages] = useState(mockMessages);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      // Search filter
      const matchesSearch = message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.sender.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = selectedType === "all" || message.type === selectedType;

      // Status filter
      const matchesStatus = selectedStatus === "all" || message.status === selectedStatus;

      // Date filter
      let matchesDate = true;
      if (dateRange.from && dateRange.to) {
        const messageDate = new Date(message.createdAt);
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        matchesDate = messageDate >= fromDate && messageDate <= toDate;
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [messages, searchTerm, selectedType, selectedStatus, dateRange]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength = 60) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleAction = (action: any, message: any) => {
    setSelectedMessage(message);

    switch (action) {
      case 'view':
        setShowDetailModal(true);
        break;
      case 'reply':
        setShowReplyModal(true);
        break;
      case 'archive':
        // Archive logic
        console.log('Archive message:', message.id);
        break;
      case 'delete':
        setMessages(prev => prev.filter(m => m.id !== message.id));
        break;
    }
  };

  const handleReply = () => {
    console.log('Reply sent:', replyText);
    // Update message status to replied
    setMessages(prev => prev.map(m =>
      m.id === selectedMessage.id ? { ...m, status: 'replied' } : m
    ));
    setReplyText("");
    setShowReplyModal(false);
    setSelectedMessage(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Content Messages</h1>
        <div className="text-sm text-gray-500">
          {filteredMessages.length} mesaj
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="flex gap-4 items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Başlık, mesaj içeriği veya gönderici ara..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 ${showFilters ? 'bg-muted border-primary' : ''}`}
          >
            <Filter className="h-4 w-4" />
            Filtreler
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            {/* Message Type Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Mesaj Türü</label>
              <select
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">Tümü</option>
                <option value="feedback">Geri Bildirim</option>
                <option value="support">Destek</option>
                <option value="bug">Hata</option>
                <option value="system">Sistem</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Durum</label>
              <select
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tümü</option>
                <option value="pending">Bekliyor</option>
                <option value="read">Okundu</option>
                <option value="replied">Cevaplandı</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium mb-1">Başlangıç</label>
              <input
                type="date"
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bitiş</label>
              <input
                type="date"
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Messages Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">ID</th>
                <th className="text-left p-4 font-medium text-foreground">Gönderen</th>
                <th className="text-left p-4 font-medium text-foreground">Başlık</th>
                <th className="text-left p-4 font-medium text-foreground">Tür</th>
                <th className="text-left p-4 font-medium text-foreground">Mesaj</th>
                <th className="text-left p-4 font-medium text-foreground">Durum</th>
                <th className="text-left p-4 font-medium text-foreground">Tarih</th>
                <th className="text-left p-4 font-medium text-foreground">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((message) => {
                const TypeIcon = messageTypeIcons[message.type];
                return (
                  <tr key={message.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm">{message.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {message.sender}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="font-medium">{truncateText(message.title, 40)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        <span className="text-sm">{messageTypeLabels[message.type]}</span>
                      </div>
                    </td>
                    <td className="p-4 max-w-sm">
                      <div className="text-sm text-gray-600">
                        {truncateText(message.message)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[message.status]}`}>
                        {statusLabels[message.status]}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatDate(message.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAction('view', message)}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Detayları Gör"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAction('reply', message)}
                          className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                          title="Yanıtla"
                        >
                          <Reply className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAction('archive', message)}
                          className="p-1 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Arşivle"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAction('delete', message)}
                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Hiç mesaj bulunamadı</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Mesaj Detayları</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="font-mono">{selectedMessage.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gönderen</label>
                  <p>{selectedMessage.sender}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Başlık</label>
                <p className="font-medium">{selectedMessage.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tür</label>
                  <p>{messageTypeLabels[selectedMessage.type]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Durum</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedMessage.status]}`}>
                    {statusLabels[selectedMessage.status]}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Tarih</label>
                <p>{formatDate(selectedMessage.createdAt)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Mesaj</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Mesajı Yanıtla</h3>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Yanıtlanacak mesaj:</div>
                <div className="font-medium mb-1">{selectedMessage.title}</div>
                <p className="text-sm text-gray-600">{selectedMessage.message}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yanıtınız
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Yanıtınızı buraya yazın..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  İptal
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Yanıtla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
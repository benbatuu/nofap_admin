"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  X,
  Plus,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useMessages } from "@/hooks/use-api";
import { MessageService } from "@/lib/services";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientOnly } from "@/components/client-only";
import { ErrorBoundary } from "@/components/error-boundary";

const messageTypeLabels = {
  feedback: "Geri Bildirim",
  support: "Destek",
  bug: "Hata",
  system: "Sistem",
};

const messageTypeIcons = {
  feedback: MessageSquare,
  support: User,
  bug: Bug,
  system: Settings,
};

const statusLabels = {
  pending: "Bekliyor",
  read: "Okundu",
  replied: "Cevaplandı",
};

const statusColors = {
  pending:
    "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/20",
  read: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20",
  replied:
    "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20",
};

function MessagesPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Form state for creating new messages
  const [newMessage, setNewMessage] = useState({
    sender: "",
    title: "",
    type: "feedback" as any,
    message: "",
    userId: "",
  });

  // API hook for fetching messages
  const {
    data: messagesData,
    isLoading,
    error,
    refetch,
  } = useMessages({
    page: 1,
    limit: 100, // Get all messages for now
    type: selectedType !== "all" ? selectedType : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const messages = messagesData?.messages || [];

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      // Search filter
      const matchesSearch =
        message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.sender.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType =
        selectedType === "all" || message.type === selectedType;

      // Status filter
      const matchesStatus =
        selectedStatus === "all" || message.status === selectedStatus;

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
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength = 60) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleAction = async (action: any, message: any) => {
    setSelectedMessage(message);

    switch (action) {
      case "view":
        setShowDetailModal(true);
        break;
      case "reply":
        setShowReplyModal(true);
        break;
      case "archive":
        // Archive logic - could update status or add archive field
        console.log("Archive message:", message.id);
        break;
      case "delete":
        if (confirm("Bu mesajı silmek istediğinizden emin misiniz?")) {
          try {
            await MessageService.deleteMessage(message.id);
            refetch(); // Refresh the data
          } catch (error) {
            console.error("Error deleting message:", error);
            alert("Mesaj silinirken bir hata oluştu");
          }
        }
        break;
      case "markAsRead":
        try {
          setIsUpdating(true);
          await MessageService.markAsRead(message.id);
          refetch();
        } catch (error) {
          console.error("Error marking as read:", error);
        } finally {
          setIsUpdating(false);
        }
        break;
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      setIsUpdating(true);
      
      // Send reply using the new API endpoint
      const response = await fetch(`/api/messages/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          replyText,
          adminId: 'admin-1', // This should come from auth context
          adminName: 'Admin User' // This should come from auth context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      setReplyText("");
      setShowReplyModal(false);
      setSelectedMessage(null);
      refetch(); // Refresh the data
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Yanıt gönderilirken bir hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateMessage = async () => {
    if (!newMessage.sender || !newMessage.title || !newMessage.message) {
      alert("Lütfen tüm alanları doldurun");
      return;
    }

    try {
      setIsUpdating(true);
      await MessageService.createMessage(newMessage);

      // Reset form
      setNewMessage({
        sender: "",
        title: "",
        type: "feedback",
        message: "",
        userId: "",
      });

      setShowCreateModal(false);
      refetch(); // Refresh the data
    } catch (error) {
      console.error("Error creating message:", error);
      alert("Mesaj oluşturulurken bir hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      const response = await fetch('/api/messages/analytics?days=30');
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
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/messages/export?${params}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `messages_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Dışa aktarma sırasında bir hata oluştu');
    }
  };

  // Show loading state during hydration
  if (!mounted) {
    return <MessagesPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Veri Yüklenemedi</h3>
            <p className="text-muted-foreground">
              Mesajlar yüklenirken bir hata oluştu.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Content Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kullanıcı mesajlarını yönetin ve yanıtlayın
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {isLoading ? "..." : `${filteredMessages.length} mesaj`}
          </div>
          
          {/* Analytics Button */}
          <button
            onClick={() => {
              setShowAnalytics(true);
              loadAnalytics();
            }}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analitik
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => handleExport('csv')}
              className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV İndir
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni Mesaj
          </button>
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
            className={`flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 ${
              showFilters ? "bg-muted border-primary" : ""
            }`}
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
              <label className="block text-sm font-medium mb-1">
                Mesaj Türü
              </label>
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
              <label className="block text-sm font-medium mb-1">
                Başlangıç
              </label>
              <input
                type="date"
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, from: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bitiş</label>
              <input
                type="date"
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, to: e.target.value }))
                }
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
                <th className="text-left p-4 font-medium text-foreground">
                  ID
                </th>
                <th className="text-left p-4 font-medium text-foreground">
                  Gönderen
                </th>
                <th className="text-left p-4 font-medium text-foreground">
                  Başlık
                </th>
                <th className="text-left p-4 font-medium text-foreground">
                  Tür
                </th>
                <th className="text-left p-4 font-medium text-foreground">
                  Mesaj
                </th>
                <th className="text-left p-4 font-medium text-foreground">
                  Durum
                </th>
                <th className="text-left p-4 font-medium text-foreground">
                  Tarih
                </th>
                <th className="text-left p-4 font-medium text-foreground">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-16" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Skeleton className="h-6 w-6" />
                          <Skeleton className="h-6 w-6" />
                          <Skeleton className="h-6 w-6" />
                          <Skeleton className="h-6 w-6" />
                        </div>
                      </td>
                    </tr>
                  ))
                : filteredMessages.map((message) => {
                    const TypeIcon = messageTypeIcons[message.type];
                    return (
                      <tr
                        key={message.id}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4 font-mono text-sm">{message.id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {message.sender}
                          </div>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="font-medium">
                            {truncateText(message.title, 40)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4" />
                            <span className="text-sm">
                              {messageTypeLabels[message.type]}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 max-w-sm">
                          <div className="text-sm text-muted-foreground">
                            {truncateText(message.message)}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              statusColors[message.status]
                            }`}
                          >
                            {statusLabels[message.status]}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(message.createdAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleAction("view", message)}
                              className="p-1 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Detayları Gör"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {message.status === "pending" && (
                              <button
                                onClick={() =>
                                  handleAction("markAsRead", message)
                                }
                                disabled={isUpdating}
                                className="p-1 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                                title="Okundu Olarak İşaretle"
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleAction("reply", message)}
                              className="p-1 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Yanıtla"
                            >
                              <Reply className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAction("archive", message)}
                              className="p-1 text-muted-foreground hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                              title="Arşivle"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAction("delete", message)}
                              className="p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
          <div className="bg-background border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Mesaj Detayları</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    ID
                  </label>
                  <p className="font-mono">{selectedMessage.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Gönderen
                  </label>
                  <p>{selectedMessage.sender}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Başlık
                </label>
                <p className="font-medium">{selectedMessage.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tür
                  </label>
                  <p>{messageTypeLabels[selectedMessage.type]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Durum
                  </label>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[selectedMessage.status]
                    }`}
                  >
                    {statusLabels[selectedMessage.status]}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tarih
                </label>
                <p>{formatDate(selectedMessage.createdAt)}</p>
              </div>

              {selectedMessage.user && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Kullanıcı
                  </label>
                  <p>
                    {selectedMessage.user.name} ({selectedMessage.user.email})
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Mesaj
                </label>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Message Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Yeni Mesaj Oluştur</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Gönderen
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Gönderen adı"
                    value={newMessage.sender}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, sender: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mesaj Türü
                  </label>
                  <select
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={newMessage.type}
                    onChange={(e) =>
                      setNewMessage({
                        ...newMessage,
                        type: e.target.value as any,
                      })
                    }
                  >
                    <option value="feedback">Geri Bildirim</option>
                    <option value="support">Destek</option>
                    <option value="bug">Hata</option>
                    <option value="system">Sistem</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Başlık</label>
                <input
                  type="text"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Mesaj başlığı"
                  value={newMessage.title}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mesaj İçeriği
                </label>
                <textarea
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={6}
                  placeholder="Mesaj içeriğini buraya yazın..."
                  value={newMessage.message}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, message: e.target.value })
                  }
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
                  onClick={handleCreateMessage}
                  disabled={
                    !newMessage.sender ||
                    !newMessage.title ||
                    !newMessage.message ||
                    isUpdating
                  }
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

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Mesajı Yanıtla</h3>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  Yanıtlanacak mesaj:
                </div>
                <div className="font-medium mb-1">{selectedMessage.title}</div>
                <p className="text-sm text-muted-foreground">
                  {selectedMessage.message}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Yanıtınız
                </label>
                <textarea
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={6}
                  placeholder="Yanıtınızı buraya yazın..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground"
                >
                  İptal
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || isUpdating}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
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

export default function Page() {
  return (
    <ErrorBoundary>
      <ClientOnly fallback={<MessagesPageSkeleton />}>
        <MessagesPageContent />
      </ClientOnly>
    </ErrorBoundary>
  );
}
        
function MessagesPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="bg-card rounded-lg border p-4">
        <Skeleton className="h-10 w-full" />
      </div>
      
      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-1">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-6 w-6" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MessagesPage() {
  return (
    <ErrorBoundary>
      <ClientOnly>
        <MessagesPageContent />
      </ClientOnly>
    </ErrorBoundary>
  );
}
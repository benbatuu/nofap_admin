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
  MoreHorizontal,
  CheckCircle,
} from "lucide-react";
import {
  useMessages,
  useCreateMessage,
  useDeleteMessage,
  useMarkMessageAsRead,
  useReplyToMessage,
  useMessageAnalytics,
  useArchiveMessage,
  useMessageCategories,
  useScheduleMessage,
  useDeliveryStats,
  useAddMessageTags,
  useRemoveMessageTags,
} from "@/hooks/use-api";
import { messagesApi } from "@/lib/api";
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [showScheduled, setShowScheduled] = useState(false);
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Form state for creating new messages
  const [newMessage, setNewMessage] = useState({
    sender: "",
    title: "",
    type: "feedback" as any,
    message: "",
    userId: "",
    category: "",
    priority: "medium" as any,
    tags: [] as string[],
    isScheduled: false,
    scheduledAt: "",
  });

  // Tag management state
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [selectedMessageForTags, setSelectedMessageForTags] =
    useState<any>(null);

  // API hooks for messages operations
  const {
    data: messagesData,
    isLoading,
    error,
    refetch,
  } = useMessages({
    page: 1,
    limit: 100, // Get all messages for now
  });

  const createMessageMutation = useCreateMessage();
  const deleteMessageMutation = useDeleteMessage();
  const markAsReadMutation = useMarkMessageAsRead();
  const replyMutation = useReplyToMessage();
  const archiveMutation = useArchiveMessage();
  const scheduleMessageMutation = useScheduleMessage();
  const addTagsMutation = useAddMessageTags();
  const removeTagsMutation = useRemoveMessageTags();

  // New data hooks
  const { data: categoriesData } = useMessageCategories();
  const { data: deliveryStatsData } = useDeliveryStats(30);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        openDropdown &&
        !target.closest(".dropdown-menu") &&
        !target.closest(".dropdown-trigger")
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const messages = Array.isArray(messagesData)
    ? messagesData
    : (messagesData as any)?.messages || [];

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

      // Category filter
      const matchesCategory =
        selectedCategory === "all" ||
        message.category === selectedCategory ||
        selectedCategory === message.type;

      // Priority filter
      const matchesPriority =
        selectedPriority === "all" || message.priority === selectedPriority;

      // Scheduled filter
      const matchesScheduled = !showScheduled || message.isScheduled;

      // Date filter
      let matchesDate = true;
      if (dateRange.from && dateRange.to) {
        const messageDate = new Date(message.createdAt);
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        matchesDate = messageDate >= fromDate && messageDate <= toDate;
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesCategory &&
        matchesPriority &&
        matchesScheduled &&
        matchesDate
      );
    });
  }, [
    messages,
    searchTerm,
    selectedType,
    selectedStatus,
    selectedCategory,
    selectedPriority,
    showScheduled,
    dateRange,
  ]);

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
    console.log("handleAction called:", action, message.id);
    setSelectedMessage(message);

    switch (action) {
      case "view":
        console.log("Opening detail modal for:", message.id);
        setShowDetailModal(true);
        break;
      case "reply":
        console.log("Opening reply modal for:", message.id);
        setShowReplyModal(true);
        break;
      case "archive":
        console.log("Archive action for:", message.id);
        try {
          console.log("Archiving message:", message.id);
          await archiveMutation.mutateAsync(message.id);
          console.log("Message archived successfully");
        } catch (error) {
          console.error("Error archiving message:", error);
          alert("Mesaj arşivlenirken bir hata oluştu");
        }
        break;
      case "delete":
        console.log("Delete action for:", message.id);
        if (confirm("Bu mesajı silmek istediğinizden emin misiniz?")) {
          try {
            console.log("Deleting message:", message.id);
            await deleteMessageMutation.mutateAsync(message.id);
            console.log("Message deleted successfully");
          } catch (error) {
            console.error("Error deleting message:", error);
            alert("Mesaj silinirken bir hata oluştu");
          }
        }
        break;
      case "markAsRead":
        console.log("Mark as read action for:", message.id);
        try {
          setIsUpdating(true);
          console.log("Marking as read:", message.id);
          await markAsReadMutation.mutateAsync(message.id);
          console.log("Marked as read successfully");
        } catch (error) {
          console.error("Error marking as read:", error);
          alert("Okundu olarak işaretlenirken bir hata oluştu");
        } finally {
          setIsUpdating(false);
        }
        break;
      case "manageTags":
        console.log("Manage tags action for:", message.id);
        openTagModal(message);
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      setIsUpdating(true);

      await replyMutation.mutateAsync({
        id: selectedMessage.id,
        data: {
          replyText,
          adminId: "admin-1", // This should come from auth context
          adminName: "Admin User", // This should come from auth context
        },
      });

      setReplyText("");
      setShowReplyModal(false);
      setSelectedMessage(null);
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

      // Clean payload - remove empty userId
      const payload = {
        sender: newMessage.sender,
        title: newMessage.title,
        type: newMessage.type,
        message: newMessage.message,
        category: newMessage.category || undefined,
        priority: newMessage.priority,
        tags: newMessage.tags,
        isScheduled: newMessage.isScheduled,
        ...(newMessage.userId && { userId: newMessage.userId }),
        ...(newMessage.isScheduled &&
          newMessage.scheduledAt && {
            scheduledAt: new Date(newMessage.scheduledAt),
          }),
      };

      if (newMessage.isScheduled && newMessage.scheduledAt) {
        await scheduleMessageMutation.mutateAsync(payload);
      } else {
        await createMessageMutation.mutateAsync(payload);
      }

      // Reset form
      setNewMessage({
        sender: "",
        title: "",
        type: "feedback",
        message: "",
        userId: "",
        category: "",
        priority: "medium",
        tags: [],
        isScheduled: false,
        scheduledAt: "",
      });

      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating message:", error);
      alert("Mesaj oluşturulurken bir hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddTag = async () => {
    if (!tagInput.trim() || !selectedMessageForTags) return;

    try {
      await addTagsMutation.mutateAsync({
        messageId: selectedMessageForTags.id,
        tags: [tagInput.trim()],
      });
      setTagInput("");
    } catch (error) {
      console.error("Error adding tag:", error);
      alert("Etiket eklenirken bir hata oluştu");
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!selectedMessageForTags) return;

    try {
      await removeTagsMutation.mutateAsync({
        messageId: selectedMessageForTags.id,
        tags: [tag],
      });
    } catch (error) {
      console.error("Error removing tag:", error);
      alert("Etiket kaldırılırken bir hata oluştu");
    }
  };

  const openTagModal = (message: any) => {
    setSelectedMessageForTags(message);
    setShowTagModal(true);
  };

  const { data: analyticsData, isLoading: isLoadingAnalytics } =
    useMessageAnalytics({ days: 30 });

  const loadAnalytics = () => {
    setAnalytics(analyticsData);
  };

  const handleExport = async (format: "csv" | "json") => {
    try {
      const params = {
        format,
        ...(selectedType !== "all" && { type: selectedType }),
        ...(selectedStatus !== "all" && { status: selectedStatus }),
        ...(searchTerm && { search: searchTerm }),
      };

      const response = await messagesApi.exportMessages(params);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `messages_export_${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Dışa aktarma sırasında bir hata oluştu");
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
              setAnalytics(analyticsData);
            }}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Analitik
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => handleExport("csv")}
              className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
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
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kategori
                </label>
                <select
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Tümü</option>
                  {categoriesData?.map((category: any) => (
                    <option key={category.name} value={category.name}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Öncelik
                </label>
                <select
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                >
                  <option value="all">Tümü</option>
                  <option value="urgent">Acil</option>
                  <option value="high">Yüksek</option>
                  <option value="medium">Orta</option>
                  <option value="low">Düşük</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {/* Scheduled Messages Toggle */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Zamanlanmış Mesajlar
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showScheduled"
                    checked={showScheduled}
                    onChange={(e) => setShowScheduled(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="showScheduled" className="text-sm">
                    Sadece zamanlanmış mesajları göster
                  </label>
                </div>
              </div>
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
                  Kategori
                </th>
                <th className="text-left p-4 font-medium text-foreground">
                  Öncelik
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
                        <td className="p-4">
                          <span className="text-sm">
                            {message.category || message.type}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              message.priority === "urgent"
                                ? "bg-red-100 text-red-800"
                                : message.priority === "high"
                                ? "bg-orange-100 text-orange-800"
                                : message.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {message.priority === "urgent"
                              ? "Acil"
                              : message.priority === "high"
                              ? "Yüksek"
                              : message.priority === "medium"
                              ? "Orta"
                              : "Düşük"}
                          </span>
                        </td>
                        <td className="p-4 max-w-sm">
                          <div className="text-sm text-muted-foreground">
                            {truncateText(message.message)}
                          </div>
                          {message.isScheduled && (
                            <div className="text-xs text-blue-600 mt-1">
                              📅 Zamanlanmış:{" "}
                              {new Date(message.scheduledAt).toLocaleDateString(
                                "tr-TR"
                              )}
                            </div>
                          )}
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
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === message.id
                                    ? null
                                    : message.id
                                )
                              }
                              className="dropdown-trigger p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                              title="İşlemler"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {openDropdown === message.id && (
                              <div className="dropdown-menu absolute right-0 top-full mt-1 w-48 bg-background border rounded-lg shadow-lg z-10">
                                <div className="py-1">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleAction("view", message);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Detayları Gör
                                  </button>

                                  {message.status === "pending" && (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleAction("markAsRead", message);
                                        setOpenDropdown(null);
                                      }}
                                      disabled={isUpdating}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      Okundu İşaretle
                                    </button>
                                  )}

                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleAction("reply", message);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                  >
                                    <Reply className="h-4 w-4" />
                                    Yanıtla
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleAction("manageTags", message);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                      />
                                    </svg>
                                    Etiket Yönet
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleAction("archive", message);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                                  >
                                    <Archive className="h-4 w-4" />
                                    Arşivle
                                  </button>

                                  <div className="border-t my-1"></div>

                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleAction("delete", message);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Sil
                                  </button>
                                </div>
                              </div>
                            )}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kategori
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Özel kategori (opsiyonel)"
                    value={newMessage.category}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, category: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Öncelik
                  </label>
                  <select
                    className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={newMessage.priority}
                    onChange={(e) =>
                      setNewMessage({
                        ...newMessage,
                        priority: e.target.value as any,
                      })
                    }
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
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

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Etiketler
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newMessage.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        onClick={() => {
                          const newTags = newMessage.tags.filter(
                            (_, i) => i !== index
                          );
                          setNewMessage({ ...newMessage, tags: newTags });
                        }}
                        className="hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Etiket eklemek için yazın ve Enter'a basın..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value && !newMessage.tags.includes(value)) {
                        setNewMessage({
                          ...newMessage,
                          tags: [...newMessage.tags, value],
                        });
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
              </div>

              {/* Scheduling */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isScheduled"
                    checked={newMessage.isScheduled}
                    onChange={(e) =>
                      setNewMessage({
                        ...newMessage,
                        isScheduled: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="isScheduled" className="text-sm font-medium">
                    Mesajı zamanla
                  </label>
                </div>

                {newMessage.isScheduled && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Gönderim Zamanı
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full p-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      value={newMessage.scheduledAt}
                      onChange={(e) =>
                        setNewMessage({
                          ...newMessage,
                          scheduledAt: e.target.value,
                        })
                      }
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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

      {/* Tag Management Modal */}
      {showTagModal && selectedMessageForTags && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Etiket Yönetimi</h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mesaj: {selectedMessageForTags.title}
                </label>
              </div>

              {/* Current Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mevcut Etiketler
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedMessageForTags.tags?.map(
                    (tag: string, index: number) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  )}
                  {(!selectedMessageForTags.tags ||
                    selectedMessageForTags.tags.length === 0) && (
                    <span className="text-muted-foreground text-sm">
                      Henüz etiket yok
                    </span>
                  )}
                </div>
              </div>

              {/* Add New Tag */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Yeni Etiket Ekle
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Etiket adı..."
                    className="flex-1 p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || addTagsMutation.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {addTagsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Ekle"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Mesaj Analitikleri</h3>
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Toplam Mesaj
                      </h4>
                      <p className="text-2xl font-bold">
                        {analytics.dailyStats?.reduce(
                          (acc: number, day: any) => acc + day.total,
                          0
                        ) || 0}
                      </p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Bekleyen
                      </h4>
                      <p className="text-2xl font-bold text-yellow-600">
                        {analytics.dailyStats?.reduce(
                          (acc: number, day: any) => acc + day.pending,
                          0
                        ) || 0}
                      </p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Okundu
                      </h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {analytics.dailyStats?.reduce(
                          (acc: number, day: any) => acc + day.read,
                          0
                        ) || 0}
                      </p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Cevaplandı
                      </h4>
                      <p className="text-2xl font-bold text-green-600">
                        {analytics.dailyStats?.reduce(
                          (acc: number, day: any) => acc + day.replied,
                          0
                        ) || 0}
                      </p>
                    </div>
                  </div>

                  {analytics.responseTime && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Yanıt Süresi</h4>
                      <p className="text-lg">
                        Ortalama:{" "}
                        {analytics.responseTime.avg_response_hours?.toFixed(
                          1
                        ) || 0}{" "}
                        saat
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Toplam yanıtlanan:{" "}
                        {analytics.responseTime.total_replied || 0}
                      </p>
                    </div>
                  )}

                  {analytics.typeDistribution && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Mesaj Türü Dağılımı</h4>
                      <div className="space-y-2">
                        {analytics.typeDistribution.map((item: any) => (
                          <div key={item.type} className="flex justify-between">
                            <span>
                              {
                                messageTypeLabels[
                                  item.type as keyof typeof messageTypeLabels
                                ]
                              }
                            </span>
                            <span className="font-medium">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Analitik verileri yüklenemedi
                  </p>
                </div>
              )}
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

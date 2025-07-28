"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FAQFormModal } from "./components/faq-form-modal";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  language: string;
  isPublished: boolean;
  order: number;
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
};

export default function Page() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState("tr");
  const [searchQuery, setSearchQuery] = useState("");
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);
  const [faqToEdit, setFaqToEdit] = useState<FAQ | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch FAQs
  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        language: selectedLang,
        limit: "100",
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/faq?${params}`);
      const data = await response.json();

      if (data.success) {
        setFaqs(data.data);
      } else {
        toast.error("FAQ'lar yüklenirken hata oluştu");
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast.error("FAQ'lar yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Delete FAQ
  const handleDelete = async () => {
    if (!faqToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/faq/${faqToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setFaqs((prev) => prev.filter((faq) => faq.id !== faqToDelete.id));
        toast.success("FAQ başarıyla silindi");
        setFaqToDelete(null);
      } else {
        toast.error(data.error || "FAQ silinirken hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("FAQ silinirken hata oluştu");
    } finally {
      setDeleting(false);
    }
  };

  // Handle FAQ creation/update success
  const handleFAQSuccess = (faq: FAQ, isEdit: boolean) => {
    if (isEdit) {
      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? faq : f)));
      toast.success("FAQ başarıyla güncellendi");
      setFaqToEdit(null);
    } else {
      setFaqs((prev) => [faq, ...prev]);
      toast.success("FAQ başarıyla oluşturuldu");
      setShowCreateModal(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchFAQs();
  }, [selectedLang]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== "") {
        fetchFAQs();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Reset search when language changes
  useEffect(() => {
    setSearchQuery("");
  }, [selectedLang]);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.language === selectedLang &&
      (searchQuery === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sık Sorulan Sorular</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Soru ara..."
              className="w-64 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni FAQ
          </Button>
        </div>
      </div>

      <Tabs
        value={selectedLang}
        onValueChange={setSelectedLang}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="tr">Türkçe</TabsTrigger>
          <TabsTrigger value="en">English</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground bg-muted/50">
          {searchQuery
            ? "Arama kriterlerinize uygun FAQ bulunamadı."
            : "Bu dilde henüz bir FAQ eklenmedi."}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFaqs.map((faq) => (
            <Card
              key={faq.id}
              className="hover:shadow-sm transition-shadow flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-base leading-tight">
                    {faq.question}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {!faq.isPublished && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Taslak
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Kategori: {faq.category}
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground whitespace-pre-line flex-1">
                {faq.answer.length > 150
                  ? `${faq.answer.substring(0, 150)}...`
                  : faq.answer}
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-3">
                <div className="text-xs text-muted-foreground">
                  {faq.views} görüntülenme
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFaqToEdit(faq)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Düzenle
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setFaqToDelete(faq)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Sil
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create FAQ Modal */}
      <FAQFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={(faq) => handleFAQSuccess(faq, false)}
        defaultLanguage={selectedLang}
      />

      {/* Edit FAQ Modal */}
      <FAQFormModal
        open={!!faqToEdit}
        onOpenChange={(open) => !open && setFaqToEdit(null)}
        onSuccess={(faq) => handleFAQSuccess(faq, true)}
        faq={faqToEdit}
        defaultLanguage={selectedLang}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={!!faqToDelete} onOpenChange={() => setFaqToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Emin misiniz?</DialogTitle>
            <DialogDescription>
              <strong>{faqToDelete?.question}</strong> başlıklı soruyu silmek
              üzeresiniz. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setFaqToDelete(null)}
              disabled={deleting}
            >
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Siliniyor..." : "Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

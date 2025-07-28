"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

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

interface FAQFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (faq: FAQ) => void;
  faq?: FAQ | null;
  defaultLanguage?: string;
}

const categories = [
  "Genel",
  "Teknik Destek",
  "Hesap",
  "Ödeme",
  "Güvenlik",
  "Özellikler",
  "Sorun Giderme"
];

export function FAQFormModal({ 
  open, 
  onOpenChange, 
  onSuccess, 
  faq, 
  defaultLanguage = "tr" 
}: FAQFormModalProps) {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    language: defaultLanguage,
    isPublished: true,
    order: 0
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!faq;

  // Reset form when modal opens/closes or FAQ changes
  useEffect(() => {
    if (open) {
      if (faq) {
        setFormData({
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          language: faq.language,
          isPublished: faq.isPublished,
          order: faq.order
        });
      } else {
        setFormData({
          question: "",
          answer: "",
          category: "",
          language: defaultLanguage,
          isPublished: true,
          order: 0
        });
      }
      setErrors({});
    }
  }, [open, faq, defaultLanguage]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.question.trim()) {
      newErrors.question = "Soru gereklidir";
    } else if (formData.question.length < 5) {
      newErrors.question = "Soru en az 5 karakter olmalıdır";
    } else if (formData.question.length > 500) {
      newErrors.question = "Soru en fazla 500 karakter olabilir";
    }

    if (!formData.answer.trim()) {
      newErrors.answer = "Cevap gereklidir";
    } else if (formData.answer.length < 10) {
      newErrors.answer = "Cevap en az 10 karakter olmalıdır";
    } else if (formData.answer.length > 5000) {
      newErrors.answer = "Cevap en fazla 5000 karakter olabilir";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Kategori gereklidir";
    }

    if (!formData.language.trim()) {
      newErrors.language = "Dil gereklidir";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const url = isEdit ? `/api/faq/${faq.id}` : "/api/faq";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data.data);
      } else {
        if (response.status === 409) {
          toast.error("Bu dilde aynı soru zaten mevcut");
        } else {
          toast.error(data.error || "İşlem sırasında hata oluştu");
        }
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast.error("İşlem sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "FAQ Düzenle" : "Yeni FAQ Oluştur"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Dil</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => handleInputChange("language", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Dil seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
              {errors.language && (
                <p className="text-sm text-red-500">{errors.language}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Soru</Label>
            <Input
              id="question"
              value={formData.question}
              onChange={(e) => handleInputChange("question", e.target.value)}
              placeholder="Sık sorulan soruyu yazın..."
              className={errors.question ? "border-red-500" : ""}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{errors.question && <span className="text-red-500">{errors.question}</span>}</span>
              <span>{formData.question.length}/500</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Cevap</Label>
            <Textarea
              id="answer"
              value={formData.answer}
              onChange={(e) => handleInputChange("answer", e.target.value)}
              placeholder="Sorunun cevabını yazın..."
              rows={8}
              className={errors.answer ? "border-red-500" : ""}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{errors.answer && <span className="text-red-500">{errors.answer}</span>}</span>
              <span>{formData.answer.length}/5000</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order">Sıralama</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) => handleInputChange("order", parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) => handleInputChange("isPublished", checked)}
              />
              <Label htmlFor="isPublished">Yayınla</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
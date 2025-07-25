"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Faq = {
  id: number;
  question: string;
  answer: string;
  language: string;
};

const initialFaqs: Faq[] = [
  { id: 1, question: "Uygulamayı nasıl kurarım?", answer: "Uygulamayı mağazadan indirerek kurabilirsiniz.", language: "tr" },
  { id: 2, question: "How to install the app?", answer: "You can install it via the App Store or Google Play.", language: "en" },
];

export default function Page() {
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs);
  const [selectedLang, setSelectedLang] = useState("tr");
  const [faqToDelete, setFaqToDelete] = useState<Faq | null>(null);

  const handleDelete = (id: number) => {
    setFaqs((prev) => prev.filter((faq) => faq.id !== id));
    setFaqToDelete(null);
  };

  const filteredFaqs = faqs.filter((faq) => faq.language === selectedLang);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sık Sorulan Sorular</h1>
        <Input placeholder="Soru ara..." className="w-64" />
      </div>

      <Tabs value={selectedLang} onValueChange={setSelectedLang} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tr">Türkçe</TabsTrigger>
          <TabsTrigger value="en">English</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredFaqs.length === 0 ? (
        <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground bg-muted/50">
          Bu dilde henüz bir SSS eklenmedi.
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFaqs.map((faq) => (
            <Card key={faq.id} className="hover:shadow-sm transition-shadow flex flex-col justify-between">
              <CardHeader className="font-medium text-base">{faq.question}</CardHeader>
              <CardContent className="text-sm text-muted-foreground whitespace-pre-line">
                {faq.answer}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => alert("Düzenle özelliği gelecek.")}>
                  Düzenle
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setFaqToDelete(faq)}
                >
                  Sil
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Silme Onay Modali */}
      <Dialog open={!!faqToDelete} onOpenChange={() => setFaqToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Emin misiniz?</DialogTitle>
            <DialogDescription>
              <strong>{faqToDelete?.question}</strong> başlıklı soruyu silmek üzeresiniz. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFaqToDelete(null)}>
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(faqToDelete!.id)}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

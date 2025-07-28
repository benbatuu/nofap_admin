"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RelapseDialogProps {
  trigger: React.ReactNode
  relapse?: any
  onSave: (data?: any) => Promise<void>
  title: string
}

export function RelapseDialog({ trigger, relapse, onSave, title }: RelapseDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    userId: 'user_123', // Varsayılan test kullanıcısı
    trigger: '',
    mood: '',
    notes: '',
    severity: 'medium',
    previousStreak: 0,
    time: '',
    recovery: ''
  })

  useEffect(() => {
    if (relapse) {
      setFormData({
        userId: relapse.userId,
        trigger: relapse.trigger || '',
        mood: relapse.mood || '',
        notes: relapse.notes || '',
        severity: relapse.severity || 'medium',
        previousStreak: relapse.previousStreak || 0,
        time: relapse.time || '',
        recovery: relapse.recovery || ''
      })
    }
  }, [relapse])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.userId.trim()) {
      alert('Kullanıcı ID gereklidir')
      return
    }

    try {
      setLoading(true)
      await onSave(formData)
      setOpen(false)
      
      // Reset form if creating new
      if (!relapse) {
        setFormData({
          userId: 'user_123', // Varsayılan test kullanıcısı
          trigger: '',
          mood: '',
          notes: '',
          severity: 'medium',
          previousStreak: 0,
          time: '',
          recovery: ''
        })
      }
    } catch (error) {
      console.error('Error saving relapse:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: any, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">Kullanıcı ID</Label>
            <Input
              id="userId"
              value={formData.userId}
              onChange={(e) => handleInputChange('userId', e.target.value)}
              placeholder="Kullanıcı ID'sini girin"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger">Tetikleyici</Label>
            <Input
              id="trigger"
              value={formData.trigger}
              onChange={(e) => handleInputChange('trigger', e.target.value)}
              placeholder="Örn: Stres, Yalnızlık"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mood">Ruh Hali</Label>
            <Input
              id="mood"
              value={formData.mood}
              onChange={(e) => handleInputChange('mood', e.target.value)}
              placeholder="Örn: Kötü, Üzgün, Nötr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Şiddet</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => handleInputChange('severity', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Düşük</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousStreak">Önceki Streak (gün)</Label>
            <Input
              id="previousStreak"
              type="number"
              min="0"
              value={formData.previousStreak}
              onChange={(e) => handleInputChange('previousStreak', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Saat</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Ek notlar..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recovery">İyileşme Planı</Label>
            <Textarea
              id="recovery"
              value={formData.recovery}
              onChange={(e) => handleInputChange('recovery', e.target.value)}
              placeholder="İyileşme için yapılacaklar..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Package, Plus, Edit, Trash2, Crown, Star } from "lucide-react"

const products = [
  {
    id: "1",
    name: "NoFap Premium",
    description: "Gelişmiş özellikler ve reklamsız deneyim",
    price: 9.99,
    currency: "USD",
    interval: "monthly",
    features: ["Reklamsız deneyim", "Gelişmiş istatistikler", "Özel rozetler", "Öncelikli destek"],
    isActive: true,
    subscribers: 1850
  },
  {
    id: "2",
    name: "NoFap Premium Yıllık",
    description: "Yıllık premium abonelik (%20 indirim)",
    price: 95.99,
    currency: "USD",
    interval: "yearly",
    features: ["Tüm premium özellikler", "%20 indirim", "Özel topluluk erişimi", "Kişisel koç desteği"],
    isActive: true,
    subscribers: 500
  },
  {
    id: "3",
    name: "Streak Booster",
    description: "Streak koruma ve motivasyon paketi",
    price: 4.99,
    currency: "USD",
    interval: "monthly",
    features: ["Streak koruma", "Günlük motivasyon", "Acil durum desteği"],
    isActive: false,
    subscribers: 0
  }
]

export default function ProductsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    interval: "monthly",
    features: ""
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ürün Yönetimi</h2>
          <p className="text-muted-foreground">
            Premium abonelik ürünlerini yönetin ve fiyatlandırma yapın
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Ürün
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Ürün Ekle</DialogTitle>
              <DialogDescription>
                Yeni bir premium ürün oluşturun
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Ürün adı"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
              <Textarea
                placeholder="Ürün açıklaması"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
              <Input
                placeholder="Fiyat (USD)"
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
              <Textarea
                placeholder="Özellikler (her satıra bir özellik)"
                value={newProduct.features}
                onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value })}
              />
              <Button className="w-full" onClick={() => setIsCreateDialogOpen(false)}>
                Ürün Oluştur
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$23,450</div>
            <p className="text-xs text-muted-foreground">+12% bu ay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Abonelik</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">+8% geçen aydan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dönüşüm Oranı</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.2%</div>
            <p className="text-xs text-muted-foreground">+0.3% artış</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Gelir</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$9.98</div>
            <p className="text-xs text-muted-foreground">Kullanıcı başına</p>
          </CardContent>
        </Card>
      </div>

      {/* Ürün Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Ürünler</CardTitle>
          <CardDescription>
            Tüm premium ürünleri ve abonelik planları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead>Periyot</TableHead>
                <TableHead>Aboneler</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Özellikler</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ${product.price} {product.currency}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.interval === "monthly" ? "Aylık" : "Yıllık"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                      <span>{product.subscribers.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch checked={product.isActive} />
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {product.features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          • {feature}
                        </div>
                      ))}
                      {product.features.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{product.features.length - 2} daha...
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Fiyatlandırma Analizi */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fiyatlandırma Performansı</CardTitle>
            <CardDescription>
              Ürün bazında performans analizi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.filter(p => p.isActive).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${product.price} / {product.interval === "monthly" ? "ay" : "yıl"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{product.subscribers} abone</div>
                    <div className="text-sm text-muted-foreground">
                      ${(product.price * product.subscribers).toLocaleString()} gelir
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Öneriler</CardTitle>
            <CardDescription>
              Gelir optimizasyonu için öneriler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <h4 className="font-medium text-green-800 dark:text-green-200">Yıllık Plan Teşviki</h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Yıllık plana geçiş için %25 indirim kampanyası düzenlenebilir.
                </p>
              </div>
              <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Yeni Özellik Paketi</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Streak Booster ürününü yeniden aktifleştirmeyi düşünün.
                </p>
              </div>
              <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">A/B Test Önerisi</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Farklı fiyat noktalarında A/B test yapılabilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
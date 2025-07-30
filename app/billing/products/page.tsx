/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Package, Plus, Edit, Trash2, Crown, Star, RefreshCw } from "lucide-react"
import { useProducts, useProductAnalytics, useProductSuggestions, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-api"
import { toast } from "sonner"
import type { Product } from "@/types/api"

interface NewProductForm {
  name: string
  description: string
  price: string
  interval: "monthly" | "yearly"
  features: string
}

export default function ProductsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<NewProductForm>({
    name: "",
    description: "",
    price: "",
    interval: "monthly",
    features: ""
  })
  const [editForm, setEditForm] = useState<NewProductForm>({
    name: "",
    description: "",
    price: "",
    interval: "monthly",
    features: ""
  })

  // API Hooks
  const {
    data: productsData,
    isLoading: isProductsLoading,
    refetch: refetchProducts
  } = useProducts({ limit: 50 })

  const {
    data: analytics,
    isLoading: isAnalyticsLoading
  } = useProductAnalytics()

  const {
    data: suggestions,
    isLoading: isSuggestionsLoading
  } = useProductSuggestions()

  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()
  const deleteProductMutation = useDeleteProduct()

  const products = productsData?.data || []

  const handleCreateProduct = async () => {
    try {
      const features = newProduct.features.split('\n').filter(f => f.trim())
      await createProductMutation.mutateAsync({
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        type: 'subscription',
        currency: 'USD',
        interval: newProduct.interval,
        features: features
      })

      toast.success('Ürün başarıyla oluşturuldu')
      setIsCreateDialogOpen(false)
      setNewProduct({ name: "", description: "", price: "", interval: "monthly", features: "" })
      refetchProducts()
    } catch (error) {
      console.error('Product creation error:', error)
      toast.error('Ürün oluşturulurken hata oluştu')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      interval: product.interval,
      features: product.features.join('\n')
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    try {
      const features = editForm.features.split('\n').filter(f => f.trim())

      // Set duration based on interval
      let duration = null;
      if (editForm.interval === 'monthly') {
        duration = '1 month';
      } else if (editForm.interval === 'yearly') {
        duration = '1 year';
      }

      await updateProductMutation.mutateAsync({
        id: editingProduct.id,
        data: {
          name: editForm.name,
          description: editForm.description,
          price: parseFloat(editForm.price),
          duration: duration,
          features: features
        }
      })

      toast.success('Ürün başarıyla güncellendi')
      setIsEditDialogOpen(false)
      setEditingProduct(null)
      refetchProducts()
    } catch (error) {
      console.error('Product update error:', error)
      toast.error('Ürün güncellenirken hata oluştu')
    }
  }

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return

    try {
      await deleteProductMutation.mutateAsync(deletingProduct.id)
      toast.success('Ürün başarıyla silindi')
      setIsDeleteDialogOpen(false)
      setDeletingProduct(null)
      refetchProducts()
    } catch (error) {
      console.error('Product delete error:', error)
      toast.error('Ürün silinirken hata oluştu')
    }
  }

  const openDeleteDialog = (product: Product) => {
    setDeletingProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        data: { isActive: !product.isActive }
      })
      toast.success('Ürün durumu güncellendi')
    } catch (error) {
      console.error('Product toggle error:', error)
      toast.error('Ürün durumu güncellenirken hata oluştu')
    }
  }

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
              <div>
                <label className="text-sm font-medium">Ürün Adı</label>
                <Input
                  placeholder="Ürün adı"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Açıklama</label>
                <Textarea
                  placeholder="Ürün açıklaması"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Fiyat (USD)</label>
                <Input
                  placeholder="29.99"
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Periyot</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newProduct.interval}
                  onChange={(e) => setNewProduct({ ...newProduct, interval: e.target.value as "monthly" | "yearly" })}
                >
                  <option value="monthly">Aylık</option>
                  <option value="yearly">Yıllık</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Özellikler</label>
                <Textarea
                  placeholder="Her satıra bir özellik yazın&#10;Sınırsız erişim&#10;Premium destek&#10;Gelişmiş analitik"
                  value={newProduct.features}
                  onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value })}
                  rows={4}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreateProduct}
                disabled={createProductMutation.isPending || !newProduct.name || !newProduct.description || !newProduct.price}
              >
                {createProductMutation.isPending ? "Oluşturuluyor..." : "Ürün Oluştur"}
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
            {isAnalyticsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded mt-2"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">${analytics?.totalRevenue?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">+{analytics?.monthlyGrowth?.toFixed(1) || 0}% bu ay</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Abonelik</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isAnalyticsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded mt-2"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{analytics?.totalSubscribers?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">+8% geçen aydan</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dönüşüm Oranı</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isAnalyticsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded mt-2"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{analytics?.conversionRate?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground">+0.3% artış</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Gelir</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isAnalyticsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded mt-2"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">${analytics?.averageRevenuePerUser?.toFixed(2) || 0}</div>
                <p className="text-xs text-muted-foreground">Kullanıcı başına</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ürün Listesi */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mevcut Ürünler</CardTitle>
              <CardDescription>
                Tüm premium ürünleri ve abonelik planları
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchProducts()}
              disabled={isProductsLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isProductsLoading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
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
              {isProductsLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-48"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-16"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-6 bg-muted rounded w-16"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-12"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-6 bg-muted rounded w-16"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-3 bg-muted rounded w-24 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-20"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse">
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      Henüz ürün bulunmuyor
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: Product) => (
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
                        <Switch
                          checked={product.isActive}
                          onCheckedChange={() => handleToggleActive(product)}
                          disabled={updateProductMutation.isPending}
                        />
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Aktif" : "Pasif"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {product.features?.slice(0, 2).map((feature: string, index: number) => (
                          <div key={index} className="text-xs text-muted-foreground">
                            • {feature}
                          </div>
                        ))}
                        {product.features?.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{product.features.length - 2} daha...
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 dark:text-red-400"
                          onClick={() => openDeleteDialog(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
              {products.filter((p: Product) => p.isActive).map((product: Product) => (
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
            {isSuggestionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestions?.marketingSuggestions ? (
              <div className="space-y-3">
                {suggestions.marketingSuggestions.map((suggestion: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-medium text-green-800 dark:text-green-200">{suggestion.strategy}</h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      {suggestion.description}
                    </p>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Hedef: {suggestion.targetAudience} • Beklenen Dönüşüm: %{suggestion.expectedConversion}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-muted-foreground">
                  Henüz öneri bulunmuyor
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ürün Düzenle</DialogTitle>
            <DialogDescription>
              Ürün bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Ürün Adı</label>
              <Input
                placeholder="Ürün adı"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Açıklama</label>
              <Textarea
                placeholder="Ürün açıklaması"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fiyat (USD)</label>
              <Input
                placeholder="29.99"
                type="number"
                step="0.01"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Periyot</label>
              <Select value={editForm.interval} onValueChange={(value: "monthly" | "yearly") => setEditForm({ ...editForm, interval: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Aylık</SelectItem>
                  <SelectItem value="yearly">Yıllık</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Özellikler</label>
              <Textarea
                placeholder="Her satıra bir özellik yazın"
                value={editForm.features}
                onChange={(e) => setEditForm({ ...editForm, features: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsEditDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                className="flex-1"
                onClick={handleUpdateProduct}
                disabled={updateProductMutation.isPending || !editForm.name || !editForm.description || !editForm.price}
              >
                {updateProductMutation.isPending ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ürünü Sil</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Ürün kalıcı olarak silinecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {deletingProduct && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-medium">{deletingProduct.name}</div>
                <div className="text-sm text-muted-foreground">{deletingProduct.description}</div>
                <div className="text-sm font-medium mt-2">${deletingProduct.price} {deletingProduct.currency}</div>
              </div>
            )}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteProduct}
                disabled={deleteProductMutation.isPending}
              >
                {deleteProductMutation.isPending ? "Siliniyor..." : "Sil"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
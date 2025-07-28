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
import { DollarSign, Package, Plus, Edit, Trash2, Crown, Star, RefreshCw, AlertCircle } from "lucide-react"
import { useProducts, useProductAnalytics, useProductSuggestions, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-api"
import { toast } from "sonner"

export default function ProductsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [newProduct, setNewProduct] = useState({
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
        interval: newProduct.interval,
        features,
        currency: 'USD'
      })
      
      toast.success('Ürün başarıyla oluşturuldu')
      setIsCreateDialogOpen(false)
      setNewProduct({ name: "", description: "", price: "", interval: "monthly", features: "" })
    } catch (error) {
      toast.error('Ürün oluşturulurken hata oluştu')
    }
  }

  const handleUpdateProduct = async (id: string, data: any) => {
    try {
      await updateProductMutation.mutateAsync({ id, data })
      toast.success('Ürün başarıyla güncellendi')
      setEditingProduct(null)
    } catch (error) {
      toast.error('Ürün güncellenirken hata oluştu')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        await deleteProductMutation.mutateAsync(id)
        toast.success('Ürün başarıyla silindi')
      } catch (error) {
        toast.error('Ürün silinirken hata oluştu')
      }
    }
  }

  const handleToggleActive = async (product: any) => {
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        data: { isActive: !product.isActive }
      })
      toast.success('Ürün durumu güncellendi')
    } catch (error) {
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
                products.map((product: any) => (
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
                      {product.features?.slice(0, 2).map((feature: any, index: any) => (
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
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 dark:text-red-400"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deleteProductMutation.isPending}
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
              {products.filter((p: any) => p.isActive).map((product: any) => (
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
                {suggestions.marketingSuggestions.map((suggestion: any, index: any) => (
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
    </div>
  )
}
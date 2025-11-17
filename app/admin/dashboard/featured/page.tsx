'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { productsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Star } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

type Product = {
  _id: string;
  id?: string;
  name: string;
  image_url: string | null;
  store_type: 'home' | 'premium';
  price: number | null;
  is_featured: boolean;
  featured_order: number | null;
};

// Memoized Product Row Component
const ProductRow = memo(({ 
  product, 
  onUpdateOrder, 
  onRemove, 
  submitting 
}: { 
  product: Product; 
  onUpdateOrder: (id: string, order: number) => void;
  onRemove: (id: string) => void;
  submitting: boolean;
}) => {
  const productId = product._id || product.id || '';
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#a42a2a]">
            {product.featured_order || '-'}
          </span>
          <Select
            value={(product.featured_order || 1).toString()}
            onValueChange={(value) => onUpdateOrder(productId, parseInt(value))}
            disabled={submitting}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((order) => (
                <SelectItem key={order} value={order.toString()}>
                  {order}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="relative w-16 h-16 bg-gray-100 rounded">
          {product.image_url ? (
            product.image_url.startsWith('data:') ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover rounded"
                loading="lazy"
              />
            ) : (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover rounded"
                sizes="64px"
                loading="lazy"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
              Resim yok
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium">{product.name}</p>
      </td>
      <td className="px-4 py-3">
        <span
          className={`text-xs px-2 py-1 rounded ${
            product.store_type === 'premium'
              ? 'bg-[#a42a2a] text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          {product.store_type === 'premium' ? 'Premium' : 'Home'}
        </span>
      </td>
      <td className="px-4 py-3 font-medium">
        {product.price
          ? `${product.price.toLocaleString('tr-TR')} TL`
          : '-'}
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(productId)}
          disabled={submitting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
});

ProductRow.displayName = 'ProductRow';

export default function FeaturedProductsPage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<number>(1);

  // Optimized: Sadece gerekli alanları yükle
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Paralel yükleme - sadece gerekli alanlar
      const [featuredData, allData] = await Promise.all([
        productsApi.getFeatured(),
        // Sadece aktif ve featured olmayan ürünleri yükle
        productsApi.getAll({ is_active: true }),
      ]);

      const formattedFeatured = featuredData.map((p: any) => ({
        _id: p._id,
        id: p._id,
        name: p.name,
        image_url: p.image_url,
        store_type: p.store_type,
        price: p.price,
        is_featured: true,
        featured_order: p.featured_order,
      }));

      const formattedAll = allData
        .filter((p: any) => !p.is_featured) // Frontend'de filtrele
        .map((p: any) => ({
          _id: p._id,
          id: p._id,
          name: p.name,
          image_url: p.image_url,
          store_type: p.store_type,
          price: p.price,
          is_featured: p.is_featured || false,
          featured_order: p.featured_order,
        }));

      setFeaturedProducts(formattedFeatured);
      setAllProducts(formattedAll);
    } catch (error: any) {
      console.error('Load data error:', error);
      toast.error('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Optimistic update ile hızlı güncelleme
  const handleAddFeatured = useCallback(async () => {
    if (submitting) return;

    if (!selectedProductId) {
      toast.error('Lütfen bir ürün seçin');
      return;
    }

    if (featuredProducts.length >= 6) {
      toast.error('En fazla 6 ürün öne çıkan olarak işaretlenebilir');
      return;
    }

    setSubmitting(true);

    // Optimistic update
    const selectedProduct = allProducts.find(
      (p) => (p._id || p.id) === selectedProductId
    );
    
    if (selectedProduct) {
      const optimisticProduct: Product = {
        ...selectedProduct,
        is_featured: true,
        featured_order: selectedOrder,
      };
      setFeaturedProducts((prev) => [...prev, optimisticProduct].sort(
        (a, b) => (a.featured_order || 99) - (b.featured_order || 99)
      ));
      setAllProducts((prev) => prev.filter((p) => (p._id || p.id) !== selectedProductId));
    }

    try {
      await productsApi.update(selectedProductId, {
        is_featured: true,
        featured_order: selectedOrder,
      });

      toast.success('Ürün öne çıkan olarak eklendi');
      setDialogOpen(false);
      setSelectedProductId('');
      setSelectedOrder(1);
      
      // Verileri yeniden yükle (background'da)
      loadData();
    } catch (error: any) {
      // Rollback optimistic update
      loadData();
      toast.error(error.message || 'Ürün eklenirken bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  }, [selectedProductId, selectedOrder, featuredProducts.length, allProducts, loadData, submitting]);

  // Optimistic update ile sıralama güncelleme
  const handleUpdateOrder = useCallback(
    async (productId: string, newOrder: number) => {
      if (submitting) return;
      
      setSubmitting(true);
      
      // Optimistic update
      setFeaturedProducts((prev) =>
        prev.map((p) =>
          (p._id || p.id) === productId
            ? { ...p, featured_order: newOrder }
            : p
        ).sort((a, b) => (a.featured_order || 99) - (b.featured_order || 99))
      );

      try {
        await productsApi.update(productId, { featured_order: newOrder });
        toast.success('Sıralama güncellendi');
        // Background'da yeniden yükle
        loadData();
      } catch (error: any) {
        // Rollback
        loadData();
        toast.error(error.message || 'Sıralama güncellenirken bir hata oluştu');
      } finally {
        setSubmitting(false);
      }
    },
    [loadData, submitting]
  );

  // Optimistic update ile kaldırma
  const handleRemoveFeatured = useCallback(
    async (id: string) => {
      if (submitting) return;

      if (
        !confirm(
          'Bu ürünü öne çıkan ürünlerden çıkarmak istediğinizden emin misiniz?'
        )
      )
        return;

      setSubmitting(true);
      
      // Optimistic update
      const removedProduct = featuredProducts.find((p) => (p._id || p.id) === id);
      setFeaturedProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
      if (removedProduct) {
        setAllProducts((prev) => [...prev, { ...removedProduct, is_featured: false, featured_order: null }]);
      }

      try {
        await productsApi.update(id, {
          is_featured: false,
          featured_order: null,
        });
        toast.success('Ürün öne çıkan ürünlerden çıkarıldı');
        // Background'da yeniden yükle
        loadData();
      } catch (error: any) {
        // Rollback
        loadData();
        toast.error(error.message || 'Ürün çıkarılırken bir hata oluştu');
      } finally {
        setSubmitting(false);
      }
    },
    [featuredProducts, loadData, submitting]
  );

  // Memoized filtered products - sadece featured olmayanlar
  const filteredProducts = useMemo(
    () => allProducts.filter((p) => !p.is_featured),
    [allProducts]
  );

  // Memoized available orders
  const availableOrders = useMemo(() => {
    const usedOrders = featuredProducts
      .map((p) => p.featured_order)
      .filter((order): order is number => order !== null && order !== selectedOrder);
    return Array.from({ length: 6 }, (_, i) => i + 1).filter(
      (order) => !usedOrders.includes(order)
    );
  }, [featuredProducts, selectedOrder]);

  // Memoized sorted featured products
  const sortedFeaturedProducts = useMemo(
    () =>
      [...featuredProducts].sort(
        (a, b) => (a.featured_order || 99) - (b.featured_order || 99)
      ),
    [featuredProducts]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0a0a0a] flex items-center gap-2">
            <Star className="h-8 w-8 text-yellow-500" />
            Öne Çıkan Ürünler
          </h1>
          <p className="text-gray-600 mt-1">
            Ana sayfada gösterilecek öne çıkan ürünleri yönetin (Maksimum 6 ürün)
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setSelectedProductId('');
              setSelectedOrder(1);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-[#a42a2a] hover:bg-[#8a2222]">
              <Plus className="h-4 w-4 mr-2" />
              Ürün Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Öne Çıkan Ürün Ekle</DialogTitle>
              <DialogDescription>
                Ana sayfada gösterilecek öne çıkan ürünü seçin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Ürün Seçin</Label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ürün seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts.map((product) => (
                      <SelectItem
                        key={product._id || product.id}
                        value={product._id || product.id || ''}
                      >
                        {product.name} -{' '}
                        {product.store_type === 'premium'
                          ? 'Kavi Premium'
                          : 'Kavi Home'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Sıralama (1-6)</Label>
                <Select
                  value={selectedOrder.toString()}
                  onValueChange={(value) => setSelectedOrder(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOrders.map((order) => (
                      <SelectItem key={order} value={order.toString()}>
                        {order}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Mevcut sıralamalar:{' '}
                  {featuredProducts
                    .map((p) => p.featured_order)
                    .filter(Boolean)
                    .join(', ') || 'Yok'}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  onClick={handleAddFeatured}
                  className="flex-1 bg-[#a42a2a] hover:bg-[#8a2222]"
                  disabled={!selectedProductId || featuredProducts.length >= 6 || submitting}
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Ekleniyor...
                    </>
                  ) : (
                    'Ekle'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setSelectedProductId('');
                    setSelectedOrder(1);
                  }}
                >
                  İptal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : sortedFeaturedProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Henüz öne çıkan ürün eklenmemiş. Ürün eklemek için yukarıdaki butonu
            kullanın.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Sıra
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Görsel
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Ürün
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Mağaza
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Fiyat
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedFeaturedProducts.map((product) => (
                  <ProductRow
                    key={product._id || product.id}
                    product={product}
                    onUpdateOrder={handleUpdateOrder}
                    onRemove={handleRemoveFeatured}
                    submitting={submitting}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {featuredProducts.length < 6 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Not:</strong> Şu anda {featuredProducts.length} öne çıkan ürün
            var. Maksimum 6 ürün ekleyebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}

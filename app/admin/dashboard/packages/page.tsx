'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { packagesApi, productsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { toast } from 'sonner';

type Package = {
  _id: string;
  id?: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  product_ids: string[];
  products?: Array<{
    _id: string;
    name: string;
    image_url: string | null;
    price: number | null;
  }>;
  store_type: 'home' | 'premium';
  is_featured: boolean;
  is_active: boolean;
};

type Product = {
  _id: string;
  id?: string;
  name: string;
  image_url: string | null;
  price: number | null;
  store_type: 'home' | 'premium';
};

export default function PackagesManagementPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    image_url: string;
    product_ids: string[];
    store_type: 'home' | 'premium';
    is_featured: boolean;
    is_active: boolean;
  }>({
    name: '',
    description: '',
    price: '',
    image_url: '',
    product_ids: [],
    store_type: 'home',
    is_featured: false,
    is_active: true,
  });

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [packagesData, productsData] = await Promise.all([
        packagesApi.getAll(),
        productsApi.getAll({ is_active: true }),
      ]);

      const formattedPackages = packagesData.map((p: any) => ({
        _id: p._id,
        id: p._id,
        name: p.name,
        description: p.description,
        price: p.price,
        image_url: p.image_url,
        product_ids: p.product_ids || [],
        products: p.products || [],
        store_type: p.store_type,
        is_featured: p.is_featured,
        is_active: p.is_active,
      }));

      const formattedProducts = productsData.map((p: any) => ({
        _id: p._id,
        id: p._id,
        name: p.name,
        image_url: p.image_url,
        price: p.price,
        store_type: p.store_type,
      }));

      setPackages(formattedPackages);
      setProducts(formattedProducts);
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

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      product_ids: [],
      store_type: 'home',
      is_featured: false,
      is_active: true,
    });
    setSelectedProducts([]);
    setEditingPackage(null);
    setSubmitting(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (submitting) return;

      if (!formData.name.trim()) {
        toast.error('Paket adı zorunludur');
        return;
      }

      if (formData.product_ids.length === 0) {
        toast.error('Paket en az bir ürün içermelidir');
        return;
      }

      if (!formData.store_type) {
        toast.error('Lütfen mağaza tipini seçin');
        return;
      }

      setSubmitting(true);

      const packageData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        price: formData.price ? parseFloat(formData.price) : null,
        image_url: formData.image_url?.trim() || null,
        product_ids: formData.product_ids,
        store_type: formData.store_type,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      };

      if (editingPackage) {
        const packageId = editingPackage._id || editingPackage.id || '';
        
        // Optimistic update
        const optimisticPackage: Package = {
          ...editingPackage,
          ...packageData,
          _id: packageId,
          id: packageId,
        };
        
        setPackages((prev) =>
          prev.map((p) => (p._id || p.id) === packageId ? optimisticPackage : p)
        );
        
        setDialogOpen(false);
        resetForm();
        toast.success('Paket başarıyla güncellendi');
        setSubmitting(false);
        
        packagesApi.update(packageId, packageData)
          .then((updatedPackage) => {
            const finalPackage: Package = {
              ...updatedPackage,
              id: updatedPackage._id,
              products: updatedPackage.products || [],
            };
            setPackages((prev) =>
              prev.map((p) => (p._id || p.id) === packageId ? finalPackage : p)
            );
          })
          .catch((error: any) => {
            setPackages((prev) =>
              prev.map((p) => (p._id || p.id) === packageId ? editingPackage : p)
            );
            toast.error(error.message || 'Paket güncellenirken bir hata oluştu');
          });
      } else {
        const tempId = `temp-${Date.now()}`;
        const optimisticPackage: Package = {
          _id: tempId,
          id: tempId,
          ...packageData,
          products: [],
        };
        
        setPackages((prev) => [optimisticPackage, ...prev]);
        setDialogOpen(false);
        resetForm();
        toast.success('Paket başarıyla eklendi');
        setSubmitting(false);
        
        packagesApi.create(packageData)
          .then((createdPackage) => {
            const finalPackage: Package = {
              ...createdPackage,
              id: createdPackage._id,
              products: createdPackage.products || [],
            };
            setPackages((prev) =>
              prev.map((p) => (p._id || p.id) === tempId ? finalPackage : p)
            );
          })
          .catch((error: any) => {
            setPackages((prev) => prev.filter((p) => (p._id || p.id) !== tempId));
            toast.error(error.message || 'Paket eklenirken bir hata oluştu');
          });
      }
    },
    [formData, editingPackage, resetForm, submitting]
  );

  const handleEdit = useCallback((packageItem: Package) => {
    setEditingPackage(packageItem);
    setFormData({
      name: packageItem.name,
      description: packageItem.description || '',
      price: packageItem.price?.toString() || '',
      image_url: packageItem.image_url || '',
      product_ids: packageItem.product_ids || [],
      store_type: packageItem.store_type,
      is_featured: packageItem.is_featured,
      is_active: packageItem.is_active,
    });
    
    // Seçili ürünleri yükle
    const selected = products.filter((p) => 
      packageItem.product_ids.includes(p._id || p.id || '')
    );
    setSelectedProducts(selected);
    setDialogOpen(true);
  }, [products]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Bu paketi silmek istediğinizden emin misiniz?')) return;

      const deletedPackage = packages.find((p) => (p._id || p.id) === id);
      setPackages((prev) => prev.filter((p) => (p._id || p.id) !== id));
      toast.success('Paket silindi');

      try {
        await packagesApi.delete(id);
      } catch (error: any) {
        if (deletedPackage) {
          setPackages((prev) => [...prev, deletedPackage]);
        }
        toast.error(error.message || 'Paket silinirken bir hata oluştu');
      }
    },
    [packages]
  );

  const handleAddProduct = useCallback((productId: string) => {
    if (formData.product_ids.includes(productId)) {
      toast.info('Bu ürün zaten pakete eklenmiş');
      return;
    }

    const product = products.find((p) => (p._id || p.id) === productId);
    if (!product) return;

    setFormData((prev) => ({
      ...prev,
      product_ids: [...prev.product_ids, productId],
    }));
    setSelectedProducts((prev) => [...prev, product]);
    toast.success(`${product.name} pakete eklendi`);
  }, [products, formData.product_ids]);

  const handleRemoveProduct = useCallback((productId: string) => {
    setFormData((prev) => ({
      ...prev,
      product_ids: prev.product_ids.filter((id) => id !== productId),
    }));
    setSelectedProducts((prev) => prev.filter((p) => (p._id || p.id) !== productId));
  }, []);

  const filteredPackages = useMemo(
    () =>
      packages.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ),
    [packages, debouncedSearchTerm]
  );

  const availableProducts = useMemo(
    () => products.filter((p) => !formData.product_ids.includes(p._id || p.id || '')),
    [products, formData.product_ids]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0a0a0a]">Paket Yönetimi</h1>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-[#a42a2a] hover:bg-[#8a2222]">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Paket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'Paket Düzenle' : 'Yeni Paket Ekle'}
              </DialogTitle>
              <DialogDescription>
                {editingPackage ? 'Paket bilgilerini güncelleyin' : 'Yeni paket bilgilerini girin'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Paket Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Fiyat (TL)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store_type">Mağaza Tipi *</Label>
                  <Select
                    value={formData.store_type}
                    onValueChange={(value: 'home' | 'premium') =>
                      setFormData({ ...formData, store_type: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Mağaza tipini seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Kavi Home</SelectItem>
                      <SelectItem value="premium">Kavi Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Paket Görseli URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Paket İçindeki Ürünler *</Label>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="add_product" className="text-sm">Ürün Ekle</Label>
                    <Select
                      value=""
                      onValueChange={handleAddProduct}
                      disabled={availableProducts.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          availableProducts.length === 0 
                            ? "Tüm ürünler zaten eklenmiş" 
                            : "Ürün seçin"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.map((product) => {
                          const productId = product._id || product.id || '';
                          return (
                            <SelectItem key={productId} value={productId}>
                              {product.name} - {product.store_type === 'premium' ? 'Premium' : 'Home'}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProducts.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm">Seçili Ürünler ({selectedProducts.length})</Label>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedProducts.map((product) => {
                          const productId = product._id || product.id || '';
                          return (
                            <div
                              key={productId}
                              className="flex items-center gap-3 p-2 border rounded-lg"
                            >
                              <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                {product.image_url ? (
                                  <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                    Resim yok
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                {product.price && (
                                  <p className="text-xs text-gray-500">
                                    {product.price.toLocaleString('tr-TR')} TL
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveProduct(productId)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="is_featured">Öne Çıkan Paket</Label>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_featured: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="is_active">Aktif</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-[#a42a2a] hover:bg-[#8a2222]"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {editingPackage ? 'Güncelleniyor...' : 'Ekleniyor...'}
                    </>
                  ) : (
                    editingPackage ? 'Güncelle' : 'Ekle'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Paket ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : filteredPackages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Paket bulunamadı</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Görsel</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Paket</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Mağaza</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Ürün Sayısı</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Fiyat</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Durum</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPackages.map((packageItem) => {
                  const packageId = packageItem._id || packageItem.id || '';
                  return (
                    <tr key={packageId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="relative w-16 h-16 bg-gray-100 rounded">
                          {packageItem.image_url ? (
                            <Image
                              src={packageItem.image_url}
                              alt={packageItem.name}
                              fill
                              className="object-cover rounded"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              Resim yok
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{packageItem.name}</p>
                          {packageItem.is_featured && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                              Öne Çıkan
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            packageItem.store_type === 'premium'
                              ? 'bg-[#a42a2a] text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {packageItem.store_type === 'premium' ? 'Premium' : 'Home'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {packageItem.product_ids.length} ürün
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {packageItem.price
                          ? `${packageItem.price.toLocaleString('tr-TR')} TL`
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            packageItem.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {packageItem.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(packageItem)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(packageId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { productsApi } from '@/lib/api';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, X, Boxes } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { toast } from 'sonner';

type Package = {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  image_url?: string;
  price?: number;
  product_ids: string[];
  products?: any[];
  product_count?: number;
  store_type: 'home' | 'premium' | 'both';
  is_active: boolean;
  display_order?: number;
};

type Product = {
  _id: string;
  id?: string;
  name: string;
  price: number | null;
  image_url: string | null;
  store_type: 'home' | 'premium';
  is_active: boolean;
};

const API_BASE_URL = '/api/packages';

async function fetchPackages(): Promise<Package[]> {
  const response = await fetch(API_BASE_URL, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Paketler yüklenemedi');
  return response.json();
}

async function createPackage(data: any): Promise<Package> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Paket oluşturulamadı');
  }
  return response.json();
}

async function updatePackage(id: string, data: any): Promise<Package> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Paket güncellenemedi');
  }
  return response.json();
}

async function deletePackage(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Paket silinemedi');
  }
}

export default function PackagesManagementPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [packageSearchQuery, setPackageSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    price: '',
    product_ids: [] as string[],
    store_type: 'both' as 'home' | 'premium' | 'both',
    is_active: true,
    display_order: 0,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedPackageSearch = useDebounce(packageSearchQuery, 300);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [packagesData, productsData] = await Promise.all([
        fetchPackages(),
        productsApi.getAll({ is_active: true }),
      ]);

      setPackages(packagesData);
      setAllProducts(
        productsData.map((p: any) => ({
          _id: p._id,
          id: p._id,
          name: p.name,
          price: p.price,
          image_url: p.image_url,
          store_type: p.store_type,
          is_active: p.is_active,
        }))
      );
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
      image_url: '',
      price: '',
      product_ids: [],
      store_type: 'both',
      is_active: true,
      display_order: 0,
    });
    setEditingPackage(null);
    setPackageSearchQuery('');
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
        toast.error('Pakete en az bir ürün eklemelisiniz');
        return;
      }

      setSubmitting(true);

      const packageData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        image_url: formData.image_url?.trim() || null,
        price: formData.price ? parseFloat(formData.price) : null,
        product_ids: formData.product_ids,
        store_type: formData.store_type,
        is_active: formData.is_active,
        display_order: formData.display_order || 0,
      };

      try {
        if (editingPackage) {
          const updated = await updatePackage(editingPackage._id, packageData);
          setPackages((prev) =>
            prev.map((p) => (p._id === editingPackage._id ? updated : p))
          );
          toast.success('Paket başarıyla güncellendi');
        } else {
          const created = await createPackage(packageData);
          setPackages((prev) => [created, ...prev]);
          toast.success('Paket başarıyla oluşturuldu');
        }

        setDialogOpen(false);
        resetForm();
      } catch (error: any) {
        toast.error(error.message || 'Paket kaydedilirken bir hata oluştu');
      } finally {
        setSubmitting(false);
      }
    },
    [formData, editingPackage, resetForm, submitting]
  );

  const handleEdit = useCallback((packageItem: Package) => {
    setEditingPackage(packageItem);
    setFormData({
      name: packageItem.name,
      description: packageItem.description || '',
      image_url: packageItem.image_url || '',
      price: packageItem.price?.toString() || '',
      product_ids: packageItem.product_ids || [],
      store_type: packageItem.store_type,
      is_active: packageItem.is_active,
      display_order: packageItem.display_order || 0,
    });
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Bu paketi silmek istediğinizden emin misiniz?')) return;

      const deletedPackage = packages.find((p) => p._id === id);
      setPackages((prev) => prev.filter((p) => p._id !== id));
      toast.success('Paket silindi');

      try {
        await deletePackage(id);
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
    setFormData((prev) => ({
      ...prev,
      product_ids: [...prev.product_ids, productId],
    }));
    toast.success('Ürün pakete eklendi');
  }, [formData.product_ids]);

  const handleRemoveProduct = useCallback((productId: string) => {
    setFormData((prev) => ({
      ...prev,
      product_ids: prev.product_ids.filter((id) => id !== productId),
    }));
    toast.success('Ürün paketten kaldırıldı');
  }, []);

  const filteredPackages = useMemo(
    () =>
      packages.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ),
    [packages, debouncedSearchTerm]
  );

  const filteredProductsForPackage = useMemo(() => {
    if (!debouncedPackageSearch) {
      return allProducts.filter((p) => !formData.product_ids.includes(p._id));
    }
    const query = debouncedPackageSearch.toLowerCase();
    return allProducts.filter(
      (p) =>
        !formData.product_ids.includes(p._id) &&
        p.name.toLowerCase().includes(query)
    );
  }, [allProducts, debouncedPackageSearch, formData.product_ids]);

  const selectedProducts = useMemo(() => {
    return allProducts.filter((p) => formData.product_ids.includes(p._id));
  }, [allProducts, formData.product_ids]);

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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'Paket Düzenle' : 'Yeni Paket Oluştur'}
              </DialogTitle>
              <DialogDescription>
                {editingPackage
                  ? 'Paket bilgilerini güncelleyin'
                  : 'Yeni paket bilgilerini girin'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="display_order">Görüntülenme Sırası</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
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
                  <Label htmlFor="price">Toplam Fiyat (TL) - Opsiyonel</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="Boş bırakılırsa ürün fiyatları toplanır"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store_type">Mağaza Tipi</Label>
                  <Select
                    value={formData.store_type}
                    onValueChange={(value: 'home' | 'premium' | 'both') =>
                      setFormData({ ...formData, store_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Her İkisi</SelectItem>
                      <SelectItem value="home">Kavi Home</SelectItem>
                      <SelectItem value="premium">Kavi Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Paket Görseli URL (Opsiyonel)</Label>
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

              {/* Seçili Ürünler */}
              {selectedProducts.length > 0 && (
                <div className="space-y-2">
                  <Label>Seçili Ürünler ({selectedProducts.length})</Label>
                  <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto bg-gray-50">
                    {selectedProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center gap-3 p-2 bg-white rounded border"
                      >
                        <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              -
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {product.name}
                          </p>
                          {product.price && (
                            <p className="text-xs text-gray-600">
                              {product.price.toLocaleString('tr-TR')} TL
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveProduct(product._id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ürün Seçimi */}
              <div className="space-y-2">
                <Label>Ürün Ekle</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Ürün ara..."
                    value={packageSearchQuery}
                    onChange={(e) => setPackageSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                  {filteredProductsForPackage.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Ürün bulunamadı
                    </p>
                  ) : (
                    filteredProductsForPackage.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-200"
                        onClick={() => handleAddProduct(product._id)}
                      >
                        <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              -
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {product.name}
                          </p>
                          {product.price && (
                            <p className="text-xs text-[#a42a2a] font-medium">
                              {product.price.toLocaleString('tr-TR')} TL
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddProduct(product._id);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
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

              <DialogFooter>
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
                <Button
                  type="submit"
                  className="bg-[#a42a2a] hover:bg-[#8a2222]"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Kaydediliyor...'
                    : editingPackage
                    ? 'Güncelle'
                    : 'Oluştur'}
                </Button>
              </DialogFooter>
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
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Görsel
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Paket Adı
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Ürün Sayısı
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Mağaza
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Fiyat
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    İşlemler
                  </th>
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
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Boxes className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{packageItem.name}</p>
                          {packageItem.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {packageItem.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {packageItem.product_count || packageItem.product_ids?.length || 0} ürün
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            packageItem.store_type === 'premium'
                              ? 'bg-[#a42a2a] text-white'
                              : packageItem.store_type === 'home'
                              ? 'bg-gray-200 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {packageItem.store_type === 'premium'
                            ? 'Premium'
                            : packageItem.store_type === 'home'
                            ? 'Home'
                            : 'Her İkisi'}
                        </span>
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


'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { productsApi, categoriesApi } from '@/lib/api';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, Upload, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { toast } from 'sonner';

type Product = {
  _id: string;
  id?: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  images?: string[];
  store_type: 'home' | 'premium';
  category_id: string | { _id: string; name: string; slug: string } | null;
  is_featured: boolean;
  is_active: boolean;
};

type Category = {
  _id: string;
  id?: string;
  name: string;
};

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    images: [] as string[],
    store_type: 'home' as 'home' | 'premium',
    category_id: 'none',
    is_featured: false,
    is_active: true,
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productsApi.getAll(),
        categoriesApi.getAll(),
      ]);

      const formattedProducts = productsData.map((p: any) => ({
        ...p,
        id: p._id,
      }));

      const formattedCategories = categoriesData.map((c: any) => ({
        ...c,
        id: c._id,
      }));

      setProducts(formattedProducts);
      setCategories(formattedCategories);
    } catch (error: any) {
      toast.error('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (submitting) return; // Prevent double submit

      // Validation
      if (!formData.name.trim()) {
        toast.error('Ürün adı zorunludur');
        return;
      }

      if (!formData.store_type) {
        toast.error('Lütfen mağaza tipini seçin (Kavi Home veya Kavi Premium)');
        return;
      }

      setSubmitting(true);

      try {
        // İlk resmi image_url olarak kullan (geriye dönük uyumluluk için)
        const mainImage = formData.images.length > 0 ? formData.images[0] : formData.image_url?.trim() || null;

        const productData = {
          name: formData.name.trim(),
          description: formData.description?.trim() || null,
          price: formData.price ? parseFloat(formData.price) : null,
          image_url: mainImage,
          images: formData.images.length > 0 ? formData.images : (formData.image_url ? [formData.image_url] : []),
          store_type: formData.store_type as 'home' | 'premium',
          category_id: formData.category_id === 'none' ? null : formData.category_id || null,
          is_featured: formData.is_featured,
          is_active: formData.is_active,
        };

        if (editingProduct) {
          await productsApi.update(editingProduct._id || editingProduct.id || '', productData);
          toast.success('Ürün başarıyla güncellendi');
        } else {
          await productsApi.create(productData);
          toast.success(`Ürün ${formData.store_type === 'premium' ? 'Kavi Premium' : 'Kavi Home'} mağazasına başarıyla eklendi`);
        }

        setDialogOpen(false);
        resetForm();
        loadData();
      } catch (error: any) {
        toast.error(error.message || 'Ürün kaydedilirken bir hata oluştu');
      } finally {
        setSubmitting(false);
      }
    },
    [formData, editingProduct, loadData, submitting]
  );

  const handleEdit = useCallback((product: Product) => {
    const categoryId =
      typeof product.category_id === 'object'
        ? product.category_id._id
        : product.category_id || 'none';

    const productImages = product.images && product.images.length > 0 
      ? product.images 
      : (product.image_url ? [product.image_url] : []);

    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price?.toString() || '',
      image_url: product.image_url || '',
      images: productImages,
      store_type: product.store_type,
      category_id: categoryId || 'none',
      is_featured: product.is_featured,
      is_active: product.is_active,
    });
    setImagePreview(productImages);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

      try {
        await productsApi.delete(id);
        toast.success('Ürün silindi');
        loadData();
      } catch (error: any) {
        toast.error(error.message || 'Ürün silinirken bir hata oluştu');
      }
    },
    [loadData]
  );

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      images: [],
      store_type: 'home',
      category_id: 'none',
      is_featured: false,
      is_active: true,
    });
    setImagePreview([]);
    setEditingProduct(null);
    setSubmitting(false);
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const formDataToSend = new FormData();
      Array.from(files).forEach((file) => {
        formDataToSend.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Dosya yükleme başarısız');
      }

      const data = await response.json();
      const newImages = [...formData.images, ...data.files];
      const updatedPreview = [...imagePreview, ...data.files];
      setFormData({ ...formData, images: newImages });
      setImagePreview(updatedPreview);
      toast.success(`${data.files.length} resim başarıyla yüklendi`);
    } catch (error: any) {
      toast.error(error.message || 'Resim yüklenirken bir hata oluştu');
    } finally {
      setUploadingImages(false);
      // Input'u temizle
      e.target.value = '';
    }
  }, [formData, imagePreview]);

  const handleRemoveImage = useCallback(async (index: number, imageUrl: string) => {
    try {
      // Eğer yüklenmiş bir dosya ise sunucudan sil
      if (imageUrl.startsWith('/uploads/')) {
        await fetch(`/api/upload?url=${encodeURIComponent(imageUrl)}`, {
          method: 'DELETE',
        });
      }

      const newImages = formData.images.filter((_, i) => i !== index);
      const newPreview = imagePreview.filter((_, i) => i !== index);
      setFormData({ ...formData, images: newImages });
      setImagePreview(newPreview);
      toast.success('Resim kaldırıldı');
    } catch (error: any) {
      toast.error('Resim kaldırılırken bir hata oluştu');
    }
  }, [formData, imagePreview]);

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ),
    [products, debouncedSearchTerm]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0a0a0a]">Ürün Yönetimi</h1>
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
              Yeni Ürün
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                {editingProduct ? 'Ürün bilgilerini güncelleyin' : 'Yeni ürün bilgilerini girin'}
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ürün Adı *</Label>
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
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    value={formData.category_id || 'none'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Kategori Yok</SelectItem>
                      {categories.map((cat) => {
                        const catId = cat._id || cat.id;
                        if (!catId) return null;
                        return (
                          <SelectItem key={catId} value={catId}>
                            {cat.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Mağaza tipini seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-gray-800"></span>
                        <span>Kavi Home</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="premium">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#a42a2a]"></span>
                        <span>Kavi Premium</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Ürün hangi mağazada görünecek?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Ürün Resimleri</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                  <label
                    htmlFor="images"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 mb-1">
                      {uploadingImages ? 'Yükleniyor...' : 'Resimleri seçin veya sürükleyin'}
                    </span>
                    <span className="text-xs text-gray-400">
                      Birden fazla resim seçebilirsiniz (Max 5MB/resim)
                    </span>
                  </label>
                </div>

                {/* Resim Preview */}
                {(imagePreview.length > 0 || formData.images.length > 0) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {(imagePreview.length > 0 ? imagePreview : formData.images).map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                          <Image
                            src={imageUrl}
                            alt={`Ürün resmi ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, imageUrl)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-[#a42a2a] text-white text-xs px-2 py-1 rounded">
                              Ana Resim
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Eski URL input (opsiyonel, geriye dönük uyumluluk için) */}
                <div className="mt-4 space-y-2">
                  <Label htmlFor="image_url" className="text-xs text-gray-500">
                    Veya URL ile ekle (opsiyonel)
                  </Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => {
                      setFormData({ ...formData, image_url: e.target.value });
                    }}
                    onBlur={(e) => {
                      const url = e.target.value.trim();
                      if (url && !formData.images.includes(url)) {
                        const newImages = [...formData.images, url];
                        const newPreview = [...imagePreview, url];
                        setFormData({ ...formData, images: newImages });
                        setImagePreview(newPreview);
                        toast.success('Resim URL\'si eklendi');
                      }
                    }}
                    placeholder="https://..."
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="is_featured">Öne Çıkan Ürün</Label>
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
                      {editingProduct ? 'Güncelleniyor...' : 'Ekleniyor...'}
                    </>
                  ) : (
                    <>
                      {editingProduct ? 'Güncelle' : 'Ekle'}
                      {!editingProduct && formData.store_type && (
                        <span className="ml-2 text-xs">
                          ({formData.store_type === 'premium' ? 'Kavi Premium' : 'Kavi Home'})
                        </span>
                      )}
                    </>
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
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Ürün bulunamadı</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Görsel
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Ürün
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Kategori
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
                {filteredProducts.map((product) => {
                  const categoryName =
                    typeof product.category_id === 'object'
                      ? product.category_id.name
                      : null;
                  const productId = product._id || product.id || '';

                  return (
                    <tr key={productId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="relative w-16 h-16 bg-gray-100 rounded">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                              sizes="64px"
                              loading="lazy"
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
                          <p className="font-medium">{product.name}</p>
                          {product.is_featured && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                              Öne Çıkan
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {categoryName || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            product.store_type === 'premium'
                              ? 'bg-[#a42a2a] text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {product.store_type === 'premium'
                            ? 'Premium'
                            : 'Home'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {product.price
                          ? `${product.price.toLocaleString('tr-TR')} TL`
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            product.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(productId)}
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

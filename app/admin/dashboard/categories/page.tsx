'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { categoriesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Category = {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    order_index: '0',
  });

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll();
      const formatted = data.map((c: any) => ({
        ...c,
        id: c._id,
      }));
      setCategories(formatted);
    } catch (error: any) {
      toast.error('Kategoriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      order_index: '0',
    });
    setEditingCategory(null);
    setSubmitting(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
    e.preventDefault();

      if (submitting) return;

      if (!formData.name.trim()) {
        toast.error('Kategori adı zorunludur');
        return;
      }

      setSubmitting(true);

      // Slug kontrolü - boşsa otomatik oluştur
      const slug = formData.slug.trim() || generateSlug(formData.name);
      
      const categoryData = {
          name: formData.name.trim(),
          slug: slug,
          description: formData.description?.trim() || null,
          order_index: parseInt(formData.order_index) || 0,
      };

      if (editingCategory) {
          // Optimistic update - UI'da hemen güncelle
          const categoryId = editingCategory._id || editingCategory.id || '';
          const optimisticCategory: Category = {
            ...editingCategory,
            ...categoryData,
          };
          
          setCategories((prev) =>
            prev.map((c) => (c._id || c.id) === categoryId ? optimisticCategory : c)
          );
          
          setDialogOpen(false);
          resetForm();
          toast.success('Kategori başarıyla güncellendi');
          setSubmitting(false);
          
          // Arka planda API çağrısı
          categoriesApi.update(categoryId, categoryData)
            .then((updatedCategory) => {
              // API'den dönen güncel veriyi kullan
              const finalCategory: Category = {
                ...updatedCategory,
                id: updatedCategory._id,
              };
              setCategories((prev) =>
                prev.map((c) => (c._id || c.id) === categoryId ? finalCategory : c)
              );
            })
            .catch((error: any) => {
              // Hata olursa rollback
              setCategories((prev) =>
                prev.map((c) => (c._id || c.id) === categoryId ? editingCategory : c)
              );
              toast.error(error.message || 'Kategori güncellenirken bir hata oluştu');
            });
      } else {
          // Optimistic update - UI'da hemen ekle
          const tempId = `temp-${Date.now()}`;
          const optimisticCategory: Category = {
            _id: tempId,
            id: tempId,
            ...categoryData,
          };
          
          setCategories((prev) => [...prev, optimisticCategory]);
          setDialogOpen(false);
          resetForm();
          toast.success('Kategori başarıyla eklendi');
          setSubmitting(false);
          
          // Arka planda API çağrısı
          categoriesApi.create(categoryData)
            .then((createdCategory) => {
              // API'den dönen gerçek kategoriyi kullan
              const finalCategory: Category = {
                ...createdCategory,
                id: createdCategory._id,
              };
              setCategories((prev) =>
                prev.map((c) => (c._id || c.id) === tempId ? finalCategory : c)
              );
            })
            .catch((error: any) => {
              // Hata olursa rollback
              setCategories((prev) => prev.filter((c) => (c._id || c.id) !== tempId));
              toast.error(error.message || 'Kategori eklenirken bir hata oluştu');
            });
      }
    },
    [formData, editingCategory, submitting, generateSlug, resetForm]
  );

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      order_index: category.order_index.toString(),
    });
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    // Optimistic update - UI'dan hemen kaldır
    const deletedCategory = categories.find((c) => (c._id || c.id) === id);
    setCategories((prev) => prev.filter((c) => (c._id || c.id) !== id));
    toast.success('Kategori başarıyla silindi');

    // Arka planda API çağrısı
    try {
        await categoriesApi.delete(id);
        // Başarılı - zaten UI'dan kaldırıldı
      } catch (error: any) {
        // Hata olursa rollback
        if (deletedCategory) {
          setCategories((prev) => [...prev, deletedCategory]);
        }
        toast.error(error.message || 'Kategori silinirken bir hata oluştu');
    }
    },
    [categories]
  );

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      order_index: '0',
    });
    setEditingCategory(null);
    setSubmitting(false);
  }, []);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order_index - b.order_index),
    [categories]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0a0a0a]">
          Kategori Yönetimi
        </h1>
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
              Yeni Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Kategori bilgilerini güncelleyin' : 'Yeni kategori bilgilerini girin'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Kategori Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      name,
                      slug:
                        formData.slug === '' ||
                        editingCategory?.slug === formData.slug
                          ? generateSlug(name)
                          : formData.slug,
                    });
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL için) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
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

              <div className="space-y-2">
                <Label htmlFor="order_index">Sıra</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) =>
                    setFormData({ ...formData, order_index: e.target.value })
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
                      {editingCategory ? 'Güncelleniyor...' : 'Ekleniyor...'}
                    </>
                  ) : (
                    editingCategory ? 'Güncelle' : 'Ekle'
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : sortedCategories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Kategori bulunamadı
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
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Açıklama
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedCategories.map((category) => {
                  const categoryId = category._id || category.id || '';
                  return (
                    <tr key={categoryId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {category.order_index}
                    </td>
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {category.slug}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {category.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                            onClick={() => handleDelete(categoryId)}
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

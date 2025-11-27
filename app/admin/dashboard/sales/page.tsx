'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { salesApi, productsApi } from '@/lib/api';
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
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

type Sale = {
  _id: string;
  id?: string;
  product_id: string | { _id: string; name: string; store_type: string } | null;
  quantity: number;
  sale_price: number;
  customer_name: string | null;
  customer_phone: string | null;
  notes: string | null;
  sale_date: string;
};

type Product = {
  _id: string;
  id?: string;
  name: string;
  price: number | null;
  store_type: string;
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '1',
    sale_price: '',
    customer_name: '',
    customer_phone: '',
    notes: '',
    sale_date: new Date().toISOString().slice(0, 10),
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [salesData, productsData] = await Promise.all([
        salesApi.getAll({ month: selectedMonth }),
        productsApi.getAll({ is_active: true }),
      ]);

      const formattedSales = salesData.map((s: any) => ({
        ...s,
        id: s._id,
      }));

      const formattedProducts = productsData.map((p: any) => ({
        ...p,
        id: p._id,
      }));

      setSales(formattedSales);
      setProducts(formattedProducts);
    } catch (error: any) {
      toast.error('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
    e.preventDefault();

      if (submitting) return;

      if (!formData.product_id) {
        toast.error('Lütfen bir ürün seçin');
        return;
      }

      if (!formData.sale_price || parseFloat(formData.sale_price) <= 0) {
        toast.error('Geçerli bir satış fiyatı girin');
        return;
      }

      setSubmitting(true);

      const saleData = {
        product_id: formData.product_id,
          quantity: parseInt(formData.quantity) || 1,
        sale_price: parseFloat(formData.sale_price),
          customer_name: formData.customer_name?.trim() || null,
          customer_phone: formData.customer_phone?.trim() || null,
          notes: formData.notes?.trim() || null,
        sale_date: formData.sale_date,
      };

      if (editingSale) {
          // Optimistic update - UI'da hemen güncelle
          const saleId = editingSale._id || editingSale.id || '';
          const product = products.find((p) => (p._id || p.id) === saleData.product_id);
          
          const optimisticSale: Sale = {
            ...editingSale,
            ...saleData,
            product_id: product ? {
              _id: product._id || product.id || '',
              name: product.name,
              store_type: product.store_type,
            } : saleData.product_id,
          };
          
          setSales((prev) =>
            prev.map((s) => (s._id || s.id) === saleId ? optimisticSale : s)
          );
          
          setDialogOpen(false);
          resetForm();
          toast.success('Satış başarıyla güncellendi');
          setSubmitting(false);
          
          // Arka planda API çağrısı
          salesApi.update(saleId, saleData)
            .then((updatedSale) => {
              // API'den dönen güncel veriyi kullan
              const finalSale: Sale = {
                ...updatedSale,
                id: updatedSale._id,
              };
              setSales((prev) =>
                prev.map((s) => (s._id || s.id) === saleId ? finalSale : s)
              );
            })
            .catch((error: any) => {
              // Hata olursa rollback
              setSales((prev) =>
                prev.map((s) => (s._id || s.id) === saleId ? editingSale : s)
              );
              toast.error(error.message || 'Satış güncellenirken bir hata oluştu');
            });
      } else {
          // Optimistic update - UI'da hemen ekle
          const tempId = `temp-${Date.now()}`;
          const product = products.find((p) => (p._id || p.id) === saleData.product_id);
          
          const optimisticSale: Sale = {
            _id: tempId,
            id: tempId,
            ...saleData,
            product_id: product ? {
              _id: product._id || product.id || '',
              name: product.name,
              store_type: product.store_type,
            } : saleData.product_id,
          };
          
          setSales((prev) => [...prev, optimisticSale]);
          setDialogOpen(false);
          resetForm();
          toast.success('Satış başarıyla eklendi');
          setSubmitting(false);
          
          // Arka planda API çağrısı
          salesApi.create(saleData)
            .then((createdSale) => {
              // API'den dönen gerçek satışı kullan
              const finalSale: Sale = {
                ...createdSale,
                id: createdSale._id,
              };
              setSales((prev) =>
                prev.map((s) => (s._id || s.id) === tempId ? finalSale : s)
              );
            })
            .catch((error: any) => {
              // Hata olursa rollback
              setSales((prev) => prev.filter((s) => (s._id || s.id) !== tempId));
              toast.error(error.message || 'Satış eklenirken bir hata oluştu');
            });
      }
    },
    [formData, editingSale, products, submitting]
  );

  const handleEdit = useCallback((sale: Sale) => {
    const productId =
      sale.product_id !== null && typeof sale.product_id === 'object'
        ? sale.product_id._id
        : sale.product_id || '';

    setEditingSale(sale);
    setFormData({
      product_id: productId,
      quantity: sale.quantity.toString(),
      sale_price: sale.sale_price.toString(),
      customer_name: sale.customer_name || '',
      customer_phone: sale.customer_phone || '',
      notes: sale.notes || '',
      sale_date: sale.sale_date.split('T')[0],
    });
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
    if (!confirm('Bu satışı silmek istediğinizden emin misiniz?')) return;

    // Optimistic update - UI'dan hemen kaldır
    const deletedSale = sales.find((s) => (s._id || s.id) === id);
    setSales((prev) => prev.filter((s) => (s._id || s.id) !== id));
    toast.success('Satış silindi');

    // Arka planda API çağrısı
    try {
        await salesApi.delete(id);
        // Başarılı - zaten UI'dan kaldırıldı
      } catch (error: any) {
        // Hata olursa rollback
        if (deletedSale) {
          setSales((prev) => [...prev, deletedSale]);
        }
        toast.error(error.message || 'Satış silinirken bir hata oluştu');
    }
    },
    [sales]
  );

  const resetForm = useCallback(() => {
    setFormData({
      product_id: '',
      quantity: '1',
      sale_price: '',
      customer_name: '',
      customer_phone: '',
      notes: '',
      sale_date: new Date().toISOString().slice(0, 10),
    });
    setEditingSale(null);
    setSubmitting(false);
  }, []);

  const handleProductChange = useCallback(
    (productId: string) => {
      const product = products.find(
        (p) => (p._id || p.id) === productId
      );
      setFormData((prev) => ({
        ...prev,
        product_id: productId,
        sale_price: product?.price?.toString() || '',
      }));
    },
    [products]
  );

  const totalSales = useMemo(
    () => sales.reduce((sum, sale) => sum + sale.quantity * sale.sale_price, 0),
    [sales]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0a0a0a]">Satış Yönetimi</h1>
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
              Yeni Satış
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSale ? 'Satış Düzenle' : 'Yeni Satış Ekle'}
              </DialogTitle>
              <DialogDescription>
                {editingSale ? 'Satış bilgilerini güncelleyin' : 'Yeni satış bilgilerini girin'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Ürün *</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={handleProductChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ürün seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => {
                      const productId = product._id || product.id || '';
                      return (
                        <SelectItem key={productId} value={productId}>
                        {product.name} -{' '}
                        {product.store_type === 'premium'
                          ? 'Premium'
                          : 'Home'}
                      </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Adet *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sale_price">Satış Fiyatı (TL) *</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) =>
                      setFormData({ ...formData, sale_price: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale_date">Satış Tarihi *</Label>
                <Input
                  id="sale_date"
                  type="date"
                  value={formData.sale_date}
                  onChange={(e) =>
                    setFormData({ ...formData, sale_date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_name">Müşteri Adı</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_phone">Müşteri Telefon</Label>
                <Input
                  id="customer_phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customer_phone: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
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
                      {editingSale ? 'Güncelleniyor...' : 'Ekleniyor...'}
                    </>
                  ) : (
                    editingSale ? 'Güncelle' : 'Ekle'
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-5 w-5 text-[#a42a2a]" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Ay Seçin</p>
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="mt-2"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Toplam Satış Adedi</p>
          <p className="text-3xl font-bold text-[#0a0a0a]">{sales.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Toplam Ciro</p>
          <p className="text-3xl font-bold text-[#a42a2a]">
            {totalSales.toLocaleString('tr-TR')} TL
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : sales.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Bu ay için satış kaydı bulunamadı
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Tarih
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Ürün
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Müşteri
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Adet
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Fiyat
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Toplam
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sales.map((sale) => {
                  const saleId = sale._id || sale.id || '';
                  const product =
                    sale.product_id !== null && typeof sale.product_id === 'object'
                      ? sale.product_id
                      : null;
                  const productName = product?.name || '-';
                  const productStoreType = product?.store_type || '';

                  return (
                    <tr key={saleId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {new Date(sale.sale_date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                          <p className="font-medium">{productName}</p>
                          {productStoreType && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                                productStoreType === 'premium'
                              ? 'bg-[#a42a2a] text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                              {productStoreType === 'premium'
                            ? 'Premium'
                            : 'Home'}
                        </span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {sale.customer_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{sale.quantity}</td>
                    <td className="px-4 py-3 font-medium">
                      {sale.sale_price.toLocaleString('tr-TR')} TL
                    </td>
                    <td className="px-4 py-3 font-bold text-[#a42a2a]">
                      {(sale.quantity * sale.sale_price).toLocaleString(
                        'tr-TR'
                      )}{' '}
                      TL
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(sale)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                            onClick={() => handleDelete(saleId)}
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

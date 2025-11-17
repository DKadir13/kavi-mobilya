'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { productsApi, categoriesApi, salesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, FolderTree, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalSales: 0,
    monthlySales: 0,
    recentSales: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const currentMonth = new Date().toISOString().slice(0, 7);

      const [products, categories, allSales, monthlySales, recentSales] =
        await Promise.all([
          productsApi.getAll(),
          categoriesApi.getAll(),
          salesApi.getAll(),
          salesApi.getAll({ month: currentMonth }),
          salesApi.getAll(),
        ]);

      // Son 5 satışı al
      const sortedRecentSales = recentSales
        .sort(
          (a: any, b: any) =>
            new Date(b.created_at || b.sale_date).getTime() -
            new Date(a.created_at || a.sale_date).getTime()
        )
        .slice(0, 5);

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        totalSales: allSales.length,
        monthlySales: monthlySales.length,
        recentSales: sortedRecentSales,
      });
    } catch (error: any) {
      // Silent fail - stats will show 0
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#0a0a0a]">Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0a0a0a]">Panel</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Ürün
            </CardTitle>
            <Package className="h-5 w-5 text-[#a42a2a]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategoriler</CardTitle>
            <FolderTree className="h-5 w-5 text-[#a42a2a]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCategories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bu Ay Satış
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-[#a42a2a]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.monthlySales}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Satış
            </CardTitle>
            <DollarSign className="h-5 w-5 text-[#a42a2a]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSales}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Satışlar</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentSales.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Henüz satış kaydı yok
            </p>
          ) : (
            <div className="space-y-4">
              {stats.recentSales.map((sale: any) => {
                const saleId = sale._id || sale.id || '';
                const product =
                  typeof sale.product_id === 'object'
                    ? sale.product_id
                    : null;
                const productName = product?.name || 'Bilinmeyen Ürün';
                const productStoreType = product?.store_type || '';

                return (
                <div
                    key={saleId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                      <p className="font-medium">{productName}</p>
                    <p className="text-sm text-gray-500">
                        {productStoreType === 'premium'
                        ? 'Kavi Premium'
                        : 'Kavi Home'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(sale.sale_date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#a42a2a]">
                      {sale.sale_price.toLocaleString('tr-TR')} TL
                    </p>
                    <p className="text-sm text-gray-500">
                      Adet: {sale.quantity}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

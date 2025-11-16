'use client';

import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { categoriesApi } from '@/lib/api';
import Link from 'next/link';
import { toast } from 'sonner';

type Category = {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  order_index: number;
};

type CategorySidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function CategorySidebar({
  open,
  onClose,
}: CategorySidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      const formatted = data.map((cat: any) => ({
        ...cat,
        id: cat._id,
      }));
      setCategories(formatted);
    } catch (error: any) {
      console.error('Category load error:', error);
      const errorMessage = error?.message || error?.toString() || 'Bilinmeyen hata';
      
      // MongoDB connection error için özel mesaj
      if (errorMessage.includes('MongoDB') || errorMessage.includes('whitelist') || errorMessage.includes('Could not connect')) {
        toast.error('MongoDB Bağlantı Hatası', {
          description: 'IP adresiniz MongoDB Atlas whitelist\'inde değil. Lütfen MongoDB Atlas yönetim panelinden IP adresinizi ekleyin. Detaylar için MONGODB_IP_WHITELIST.md dosyasına bakın.',
          duration: 15000,
        });
      } else {
        // Diğer hatalar için genel mesaj
        toast.error('Kategoriler Yüklenemedi', {
          description: errorMessage,
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full sm:w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b bg-[#a42a2a] text-white">
            <h2 className="text-lg font-bold">Kategoriler</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="p-2">
                <Link
                  href="/urunler"
                  onClick={onClose}
                  className="flex items-center justify-between p-4 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <span className="font-medium text-[#0a0a0a]">
                    Tüm Ürünler
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#a42a2a] transition-colors" />
                </Link>

                <div className="my-2 border-t" />

                <div className="space-y-1">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/urunler?kategori=${category.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-4 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <span className="text-gray-700 group-hover:text-[#0a0a0a] font-medium">
                        {category.name}
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#a42a2a] transition-colors" />
                    </Link>
                  ))}
                </div>

                <div className="my-4 border-t" />

                <div className="px-2 space-y-1">
                  <Link
                    href="/urunler?magaza=home"
                    onClick={onClose}
                    className="flex items-center justify-between p-4 hover:bg-gray-100 rounded-lg transition-colors group border border-gray-200"
                  >
                    <span className="font-medium text-[#0a0a0a]">
                      Kavi Home
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#a42a2a] transition-colors" />
                  </Link>

                  <Link
                    href="/urunler?magaza=premium"
                    onClick={onClose}
                    className="flex items-center justify-between p-4 hover:bg-gray-100 rounded-lg transition-colors group border-2 border-[#a42a2a]"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-[#a42a2a]">
                        Kavi Premium
                      </span>
                      <span className="text-xs text-gray-500">
                        Özel koleksiyon
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#a42a2a]" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

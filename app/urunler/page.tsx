'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { productsApi, categoriesApi } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Product = {
  _id: string;
  id?: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  images?: string[];
  store_type: 'home' | 'premium';
  category_id: string | {
    _id: string;
    name: string;
    slug: string;
  } | null;
};

type Category = {
  _id: string;
  id?: string;
  name: string;
  slug: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  const loadCategories = useCallback(async () => {
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
      }
      // Diğer hatalar için silent fail
    }
  }, []);

  const loadProducts = useCallback(async (category: string, store: string) => {
    setLoading(true);
    try {
      const cat = categories.find((c) => c.slug === category);
      
      const params: any = { is_active: true };
      if (category !== 'all' && cat) {
        params.category_id = cat._id;
      }
      if (store !== 'all') {
        params.store_type = store;
      }

      const data = await productsApi.getAll(params);
      const formatted = data.map((product: any) => ({
        ...product,
        id: product._id,
        categories: typeof product.category_id === 'object' ? product.category_id : null,
      }));
      setProducts(formatted);
    } catch (error: any) {
      console.error('Product load error:', error);
      const errorMessage = error?.message || error?.toString() || 'Bilinmeyen hata';
      
      // MongoDB connection error için özel mesaj (sadece ilk hatada göster)
      if (errorMessage.includes('MongoDB') || errorMessage.includes('whitelist') || errorMessage.includes('Could not connect')) {
        toast.error('MongoDB Bağlantı Hatası', {
          description: 'IP adresiniz MongoDB Atlas whitelist\'inde değil. Lütfen MongoDB Atlas yönetim panelinden IP adresinizi ekleyin. Detaylar için MONGODB_IP_WHITELIST.md dosyasına bakın.',
          duration: 15000,
        });
      }
      // Diğer hatalar için silent fail
    } finally {
      setLoading(false);
    }
  }, [categories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const category = searchParams.get('kategori');
    const store = searchParams.get('magaza');

    if (category) setSelectedCategory(category);
    if (store) setSelectedStore(store);

    loadProducts(category || 'all', store || 'all');
  }, [searchParams, loadProducts]);

  const handleAddToCart = useCallback((product: Product) => {
    const categoryName = typeof product.category_id === 'object' 
      ? product.category_id?.name 
      : null;
    
    addToCart({
      id: product._id || product.id || '',
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category: categoryName || 'Diğer',
      store_type: product.store_type,
    });
  }, [addToCart]);

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#0a0a0a] to-[#a42a2a] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-4">Ürünlerimiz</h1>
          <p className="text-gray-200">
            Kaliteli mobilya çözümlerimizi keşfedin
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="h-5 w-5 text-gray-500" />
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                loadProducts(value, selectedStore);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kategori Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select
            value={selectedStore}
            onValueChange={(value) => {
              setSelectedStore(value);
              loadProducts(selectedCategory, value);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Mağaza Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Mağazalar</SelectItem>
              <SelectItem value="home">Kavi Home</SelectItem>
              <SelectItem value="premium">Kavi Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-md"
              >
                <div className="h-64 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                  <div className="h-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              Seçili filtrelere uygun ürün bulunamadı.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id || product.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group"
              >
                <Link href={`/urunler/${product._id || product.id}`}>
                  <ProductImageCarousel 
                    product={product}
                  />
                </Link>

                <div className="p-4">
                  <Link href={`/urunler/${product._id || product.id}`}>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-[#a42a2a] transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mb-2">
                    {product.categories?.name || 'Diğer'}
                  </p>
                  {product.price && (
                    <p className="text-[#a42a2a] font-bold text-lg mb-3">
                      {product.price.toLocaleString('tr-TR')} TL
                    </p>
                  )}
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-[#0a0a0a] hover:bg-[#a42a2a] text-white"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Sepete Ekle
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Product Image Carousel Component
function ProductImageCarousel({ product }: { product: Product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Tüm resimleri birleştir (image_url + images array)
  const images = useMemo(() => {
    const imageList: string[] = [];
    if (product.image_url) {
      imageList.push(product.image_url);
    }
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && !imageList.includes(img)) {
          imageList.push(img);
        }
      });
    }
    return imageList;
  }, [product.image_url, product.images]);

  const hasMultipleImages = images.length > 1;

  // Otomatik geçiş efekti
  useEffect(() => {
    if (hasMultipleImages) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 5000); // 5 saniye

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [hasMultipleImages, images.length]);

  // Mouse hover'da durdur
  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (hasMultipleImages) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 5000);
    }
  };

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToImage = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  return (
    <div 
      className="relative h-64 bg-gray-100 overflow-hidden group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {images.length > 0 ? (
        <>
          <Image
            src={images[currentImageIndex]}
            alt={`${product.name} - Resim ${currentImageIndex + 1}`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          
          {/* Navigation Buttons */}
          {hasMultipleImages && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Önceki resim"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Sonraki resim"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => goToImage(e, index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-white w-6'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Resim ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400">
          Resim yok
        </div>
      )}
      
      {/* Store Type Badge */}
      <div className="absolute top-2 right-2 z-10">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            product.store_type === 'premium'
              ? 'bg-[#a42a2a] text-white'
              : 'bg-gray-800 text-white'
          }`}
        >
          {product.store_type === 'premium'
            ? 'Premium'
            : 'Home'}
        </span>
      </div>
    </div>
  );
}

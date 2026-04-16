'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { productsApi, categoriesApi } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Filter, ChevronLeft, ChevronRight, Search, ArrowUpDown } from 'lucide-react';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/useDebounce';

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
  sub_items?: Array<{
    product_id?: string;
    name?: string;
    description?: string;
    price?: number;
    image_url?: string;
    quantity: number;
    is_optional: boolean;
    sub_items?: Array<{
      product_id?: string;
      name?: string;
      description?: string;
      price?: number;
      image_url?: string;
      quantity: number;
      is_optional: boolean;
    }>;
  }>;
};

type Category = {
  _id: string;
  id?: string;
  name: string;
  slug: string;
};

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const PRODUCTS_PER_PAGE = 20;

  const loadCategories = useCallback(async () => {
    try {
      setLoadError(null);
      const data = await categoriesApi.getAll();
      const formatted = data.map((cat: any) => ({
        ...cat,
        id: cat._id,
      }));
      setCategories(formatted);
    } catch (error: any) {
      console.error('Category load error:', error);
      const errorMessage =
        error?.message || error?.error || error?.toString() || 'Kategoriler yüklenemedi';
      setLoadError(errorMessage);
      toast.error('Kategoriler yüklenemedi', { description: errorMessage });
    } finally {
      setCategoriesReady(true);
    }
  }, []);

  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;

  const loadProducts = useCallback(async (category: string, store: string) => {
    setLoading(true);
    try {
      setLoadError(null);
      const cat = categoriesRef.current.find((c) => c.slug === category);
      
      const params: any = { is_active: true, include_sub_items_minimal: true };
      if (category !== 'all' && cat) {
        params.category_id = cat._id;
      }
      if (store !== 'all') {
        params.store_type = store;
      }

      const productsData = await productsApi.getAll(params);

      const formatted = productsData.map((product: any) => ({
        ...product,
        id: product._id,
        category_id: product.category_id !== null && typeof product.category_id === 'object' ? product.category_id : null,
        // Sepet için gerekli olan `sub_items` minimal geliyor (nested olmayan)
      }));
      setAllProducts(formatted);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (error: any) {
      console.error('Product load error:', error);
      const errorMessage =
        error?.message || error?.error || error?.toString() || 'Ürünler yüklenemedi';
      setLoadError(errorMessage);
      toast.error('Ürünler yüklenemedi', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    loadCategories();
  }, []);

  // URL → filtre state (arama vb.)
  useEffect(() => {
    const categoryParam = searchParams.get('kategori') || 'all';
    const store = searchParams.get('magaza');
    const searchParam = searchParams.get('search');

    if (searchParams.get('kategori')) setSelectedCategory(categoryParam);
    if (store) setSelectedStore(store);

    if (searchParam !== null) {
      setSearchQuery(searchParam);
    } else if (searchQuery && !searchParam) {
      setSearchQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // "Tüm kategoriler" — kategori listesini beklemeden ürünleri yükle (canlıda takılmayı önler)
  useEffect(() => {
    const categoryParam = searchParams.get('kategori') || 'all';
    const store = searchParams.get('magaza') || 'all';
    if (categoryParam !== 'all') return;
    loadProducts(categoryParam, store);
  }, [searchParams, loadProducts]);

  // Slug ile kategori: liste hazır olunca yükle
  useEffect(() => {
    const categoryParam = searchParams.get('kategori') || 'all';
    const store = searchParams.get('magaza') || 'all';
    if (categoryParam === 'all' || !categoriesReady) return;
    loadProducts(categoryParam, store);
  }, [searchParams, categoriesReady, loadProducts]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }

    // Sort products
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name, 'tr'));
    }

    return filtered;
  }, [allProducts, debouncedSearch, sortBy]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const totalProductPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  }, [filteredProducts]);

  const handleAddToCart = useCallback(async (product: Product) => {
    const categoryName = product.category_id !== null && typeof product.category_id === 'object' 
      ? product.category_id?.name 
      : null;

    // Sub items'ı yükle (sadece product_id olanlar için API çağrısı yap)
    let subItems: any[] = [];
    if (product.sub_items && product.sub_items.length > 0) {
      try {
        // Sub items'ın detaylarını al (paralel yükleme)
        const subItemProducts = await Promise.all(
          product.sub_items.map(async (subItem) => {
            // Eğer product_id varsa mevcut ürünü çek (sub_items olmadan - daha hızlı)
            if (subItem.product_id) {
              try {
                const subProduct = await productsApi.getById(subItem.product_id, false);
                return {
                  id: subProduct._id,
                  name: subProduct.name,
                  image_url: subProduct.image_url,
                  price: subProduct.price,
                  quantity: subItem.quantity ?? 1,
                  is_optional: subItem.is_optional || false,
                };
              } catch {
                return null;
              }
            } else if (subItem.name) {
              // Yeni parça (name, description, price, image_url ile)
              // Name'i ID olarak kullan (tutarlılık için)
              return {
                id: subItem.name, // Name'i ID olarak kullan
                name: subItem.name,
                image_url: subItem.image_url || null,
                price: subItem.price || null,
                quantity: subItem.quantity ?? 1,
                is_optional: subItem.is_optional || false,
              };
            }
            return null;
          })
        );
        subItems = subItemProducts.filter(item => item !== null);
      } catch (error) {
        console.error('Sub items yüklenirken hata:', error);
      }
    }

    addToCart({
      id: product._id || product.id || '',
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category: categoryName || 'Diğer',
      store_type: product.store_type,
      sub_items: subItems,
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
        <div className="flex flex-col gap-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
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

            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Varsayılan</SelectItem>
                <SelectItem value="price-asc">Fiyat: Düşükten Yükseğe</SelectItem>
                <SelectItem value="price-desc">Fiyat: Yüksekten Düşüğe</SelectItem>
                <SelectItem value="name-asc">İsim: A-Z</SelectItem>
                <SelectItem value="name-desc">İsim: Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600 mb-4">
            {filteredProducts.length} ürün bulundu
            {filteredProducts.length > PRODUCTS_PER_PAGE && (
              <span className="ml-2">
                (Sayfa {currentPage} / {totalProductPages})
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a42a2a] mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Ürünler yükleniyor, lütfen bekleyin...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl shadow">
            <p className="text-red-600 font-medium mb-2">Ürünler yüklenemedi</p>
            <p className="text-gray-600 text-sm text-center mb-4 max-w-2xl break-words">
              {loadError}
            </p>
            <Button
              onClick={() => {
                const categoryParam = searchParams.get('kategori') || selectedCategory || 'all';
                const store = searchParams.get('magaza') || selectedStore || 'all';
                loadProducts(categoryParam, store);
              }}
              className="bg-[#a42a2a] hover:bg-[#8a2222]"
            >
              Yeniden dene
            </Button>
          </div>
        ) : (
          <>
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map((product) => (
                  <div
                    key={product._id || product.id}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-64 bg-gray-100">
                      {product.image_url ? (
                        product.image_url.startsWith('data:') ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            loading="lazy"
                          />
                        )
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                          Resim yok
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {product.category_id !== null && typeof product.category_id === 'object'
                          ? product.category_id.name
                          : 'Kategori yok'}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {product.store_type === 'premium' ? 'Kavi Premium' : 'Kavi Home'}
                      </p>
                      {product.price && (
                        <p className="text-[#a42a2a] font-bold text-lg mb-4">
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
                      <Link href={`/urunler/${product._id || product.id}`}>
                        <Button variant="outline" className="w-full mt-2">
                          Detayları Gör
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Ürün bulunamadı</p>
              </div>
            )}
          </>
        )}

        {/* Products Pagination */}
        {!loading && totalProductPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <button
                        onClick={() => {
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-1 px-4 py-2 rounded-md border transition-colors ${
                          currentPage === 1
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-100 cursor-pointer'
                        }`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Önceki</span>
                      </button>
                    </PaginationItem>
                    
                    {Array.from({ length: totalProductPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalProductPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <button
                              onClick={() => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`min-w-[40px] px-3 py-2 rounded-md border transition-colors ${
                                currentPage === page
                                  ? 'bg-[#a42a2a] text-white border-[#a42a2a]'
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              {page}
                            </button>
                          </PaginationItem>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={`ellipsis-${page}`}>
                            <span className="px-2 py-2">...</span>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <button
                        onClick={() => {
                          if (currentPage < totalProductPages) {
                            setCurrentPage(currentPage + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        disabled={currentPage === totalProductPages}
                        className={`flex items-center gap-1 px-4 py-2 rounded-md border transition-colors ${
                          currentPage === totalProductPages
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-100 cursor-pointer'
                        }`}
                      >
                        <span>Sonraki</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                
                <div className="text-sm text-gray-600">
                  Sayfa {currentPage} / {totalProductPages} - Toplam {filteredProducts.length} ürün
                </div>
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
          {images[currentImageIndex]?.startsWith('data:') ? (
            <img
              src={images[currentImageIndex]}
              alt={`${product.name} - Resim ${currentImageIndex + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <Image
              src={images[currentImageIndex]}
              alt={`${product.name} - Resim ${currentImageIndex + 1}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          )}
          
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

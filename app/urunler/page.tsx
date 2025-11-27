'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { productsApi, categoriesApi, packagesApi } from '@/lib/api';
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
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
};

type Category = {
  _id: string;
  id?: string;
  name: string;
  slug: string;
};

type Package = {
  _id: string;
  id?: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  store_type: 'home' | 'premium';
  products?: Array<{
    _id: string;
    name: string;
    image_url: string | null;
    price: number | null;
  }>;
};

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [packagesLoaded, setPackagesLoaded] = useState(false); // Paketler yüklendi mi?
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentPackagePage, setCurrentPackagePage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'products' | 'packages'>('products');
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const PRODUCTS_PER_PAGE = 20;

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

      // Sadece ürünleri yükle - paketler lazy load edilecek
      const productsData = await productsApi.getAll(params);

      const formatted = productsData.map((product: any) => ({
        ...product,
        id: product._id,
        categories: product.category_id !== null && typeof product.category_id === 'object' ? product.category_id : null,
      }));
      setAllProducts(formatted);
      setCurrentPage(1); // Reset to first page when filters change
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

  // Paketleri lazy load et - sadece paketler sekmesine tıklandığında yükle
  const loadPackages = useCallback(async (category: string, store: string) => {
    if (packagesLoaded) return; // Zaten yüklendiyse tekrar yükleme
    
    setPackagesLoading(true);
    try {
      const cat = categories.find((c) => c.slug === category);
      
      const params: any = { is_active: true };
      if (category !== 'all' && cat) {
        // Paketler kategori bazlı değil, sadece store_type'a göre filtrelenir
      }
      if (store !== 'all') {
        params.store_type = store;
      }

      const packagesData = await packagesApi.getAll(params).catch(() => []);

      const formattedPackages = packagesData.map((pkg: any) => ({
        ...pkg,
        id: pkg._id,
      }));
      setAllPackages(formattedPackages);
      setPackagesLoaded(true);
      setCurrentPackagePage(1);
    } catch (error: any) {
      console.error('Package load error:', error);
      // Silent fail
    } finally {
      setPackagesLoading(false);
    }
  }, [categories, packagesLoaded]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const category = searchParams.get('kategori');
    const store = searchParams.get('magaza');
    const searchParam = searchParams.get('search');

    if (category) setSelectedCategory(category);
    if (store) setSelectedStore(store);
    
    // URL'den gelen search parametresini set et
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    } else if (searchQuery && !searchParam) {
      // URL'de search yoksa ama state'te varsa temizle
      setSearchQuery('');
    }

    loadProducts(category || 'all', store || 'all');
  }, [searchParams, loadProducts]);

  // Filtered and sorted products and packages
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

  const filteredPackages = useMemo(() => {
    let filtered = [...allPackages];

    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((pkg) =>
        pkg.name.toLowerCase().includes(searchLower) ||
        (pkg.description && pkg.description.toLowerCase().includes(searchLower))
      );
    }

    // Sort packages
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
  }, [allPackages, debouncedSearch, sortBy]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const totalProductPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  }, [filteredProducts]);

  // Paginated packages
  const paginatedPackages = useMemo(() => {
    const startIndex = (currentPackagePage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    return filteredPackages.slice(startIndex, endIndex);
  }, [filteredPackages, currentPackagePage]);

  const totalPackagePages = useMemo(() => {
    return Math.ceil(filteredPackages.length / PRODUCTS_PER_PAGE);
  }, [filteredPackages]);

  const handleAddToCart = useCallback((product: Product) => {
    const categoryName = product.category_id !== null && typeof product.category_id === 'object' 
      ? product.category_id?.name 
      : null;

    addToCart({
      id: product._id || product.id || '',
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category: categoryName || 'Diğer',
      store_type: product.store_type,
      type: 'product',
    });
  }, [addToCart]);

  const handleAddPackageToCart = useCallback((pkg: Package) => {
    const packageProducts = (pkg.products || []).map((product) => ({
      id: product._id,
      name: product.name,
      image_url: product.image_url,
      price: product.price,
    }));

    addToCart({
      id: pkg._id || pkg.id || '',
      name: pkg.name,
      price: pkg.price,
      image_url: pkg.image_url,
      category: 'Paket',
      store_type: pkg.store_type,
      type: 'package',
      packageProducts: packageProducts,
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

        </div>

        {/* Tabs for Products and Packages */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value as 'products' | 'packages');
          if (value === 'packages' && !packagesLoaded) {
            loadPackages(selectedCategory, selectedStore);
          }
        }} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="products" className="text-base">
              Ürünler ({filteredProducts.length})
            </TabsTrigger>
            <TabsTrigger value="packages" className="text-base">
              Paketler ({filteredPackages.length})
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* Results Count */}
            <div className="text-sm text-gray-600">
              {filteredProducts.length} ürün bulundu
              {filteredProducts.length > PRODUCTS_PER_PAGE && (
                <span className="ml-2">
                  (Sayfa {currentPage} / {totalProductPages})
                </span>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl overflow-hidden shadow-md animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
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
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <p className="text-gray-500 text-lg">
                  {searchQuery ? 'Arama kriterlerinize uygun ürün bulunamadı.' : 'Seçili filtrelere uygun ürün bulunamadı.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedProducts.map((product, index) => (
                    <div
                      key={product._id || product.id}
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
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
                          {product.category_id !== null && typeof product.category_id === 'object' 
                            ? product.category_id.name 
                            : 'Diğer'}
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

                {/* Products Pagination */}
                {totalProductPages > 1 && (
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
              </>
            )}
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-6">
            {/* Results Count */}
            <div className="text-sm text-gray-600">
              {filteredPackages.length} paket bulundu
              {filteredPackages.length > PRODUCTS_PER_PAGE && (
                <span className="ml-2">
                  (Sayfa {currentPackagePage} / {totalPackagePages})
                </span>
              )}
            </div>

            {packagesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl overflow-hidden shadow-md animate-fade-in border-2 border-blue-200"
                    style={{ animationDelay: `${i * 100}ms` }}
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
            ) : filteredPackages.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <p className="text-gray-500 text-lg">
                  {searchQuery ? 'Arama kriterlerinize uygun paket bulunamadı.' : 'Seçili filtrelere uygun paket bulunamadı.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedPackages.map((pkg, index) => (
                    <div
                      key={pkg._id || pkg.id}
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group animate-fade-in-up border-2 border-blue-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="relative h-64 bg-gray-100">
                        {pkg.image_url ? (
                          pkg.image_url.startsWith('data:') ? (
                            <img
                              src={pkg.image_url}
                              alt={pkg.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src={pkg.image_url}
                              alt={pkg.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span>📦 Paket Görseli Yok</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                          PAKET
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          📦 {pkg.name}
                        </h3>
                        {pkg.description && (
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                            {pkg.description}
                          </p>
                        )}
                        {pkg.products && pkg.products.length > 0 && (
                          <p className="text-xs text-gray-400 mb-2">
                            {pkg.products.length} ürün içerir
                          </p>
                        )}
                        {pkg.price && (
                          <p className="text-[#a42a2a] font-bold text-lg mb-3">
                            {pkg.price.toLocaleString('tr-TR')} TL
                          </p>
                        )}
                        <Button
                          onClick={() => handleAddPackageToCart(pkg)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Paketi Sepete Ekle
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Packages Pagination */}
                {totalPackagePages > 1 && (
                  <div className="mt-12 flex flex-col items-center gap-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <button
                            onClick={() => {
                              if (currentPackagePage > 1) {
                                setCurrentPackagePage(currentPackagePage - 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            disabled={currentPackagePage === 1}
                            className={`flex items-center gap-1 px-4 py-2 rounded-md border transition-colors ${
                              currentPackagePage === 1
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-gray-100 cursor-pointer'
                            }`}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span>Önceki</span>
                          </button>
                        </PaginationItem>
                        
                        {Array.from({ length: totalPackagePages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <button
                              onClick={() => {
                                setCurrentPackagePage(page);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`px-4 py-2 rounded-md border transition-colors ${
                                currentPackagePage === page
                                  ? 'bg-[#a42a2a] text-white border-[#a42a2a]'
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              {page}
                            </button>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <button
                            onClick={() => {
                              if (currentPackagePage < totalPackagePages) {
                                setCurrentPackagePage(currentPackagePage + 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            disabled={currentPackagePage === totalPackagePages}
                            className={`flex items-center gap-1 px-4 py-2 rounded-md border transition-colors ${
                              currentPackagePage === totalPackagePages
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
                      Sayfa {currentPackagePage} / {totalPackagePages} - Toplam {filteredPackages.length} paket
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
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

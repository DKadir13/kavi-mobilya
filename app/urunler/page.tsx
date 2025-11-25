'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { productsApi, categoriesApi, packagesApi } from '@/lib/api';
import { useCart, type PackageItem } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { ShoppingCart, Filter, ChevronLeft, ChevronRight, Search, ArrowUpDown, Package, Plus, X, Boxes, ChevronDown, ChevronUp } from 'lucide-react';
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
};

type Category = {
  _id: string;
  id?: string;
  name: string;
  slug: string;
};

type PackageType = {
  _id: string;
  name: string;
  description?: string;
  image_url?: string;
  price?: number;
  product_ids: string[];
  products?: any[];
  product_count?: number;
  store_type: 'home' | 'premium' | 'both';
  is_active: boolean;
};

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set());
  const searchParams = useSearchParams();
  const { addToCart, addPackageToCart } = useCart();
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [packageName, setPackageName] = useState('');
  const [selectedPackageItems, setSelectedPackageItems] = useState<PackageItem[]>([]);
  const [packageSearchQuery, setPackageSearchQuery] = useState('');
  
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

  const loadPackages = useCallback(async () => {
    try {
      const storeParam = selectedStore !== 'all' ? selectedStore : undefined;
      const data = await packagesApi.getAll({ 
        is_active: true,
        store_type: storeParam,
      });
      setPackages(data);
    } catch (error: any) {
      console.error('Packages load error:', error);
      // Silent fail
    }
  }, [selectedStore]);

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

  useEffect(() => {
    loadCategories();
    loadPackages();
  }, [loadCategories, loadPackages]);

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

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

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
    });
  }, [addToCart]);

  const handleAddToPackage = useCallback((product: Product) => {
    if (selectedPackageItems.find((item) => item.id === product._id)) {
      toast.info('Bu ürün pakete zaten eklenmiş');
      return;
    }

    const categoryName = product.category_id !== null && typeof product.category_id === 'object' 
      ? product.category_id?.name 
      : null;

    const packageItem: PackageItem = {
      id: product._id || product.id || '',
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category: categoryName || 'Diğer',
      store_type: product.store_type,
    };

    setSelectedPackageItems((prev) => [...prev, packageItem]);
    toast.success(`${product.name} pakete eklendi`);
  }, [selectedPackageItems]);

  const handleRemoveFromPackage = useCallback((itemId: string) => {
    setSelectedPackageItems((prev) => {
      const removed = prev.find((item) => item.id === itemId);
      if (removed) {
        toast.success(`${removed.name} paketten kaldırıldı`);
      }
      return prev.filter((item) => item.id !== itemId);
    });
  }, []);

  const handleCreatePackage = useCallback(() => {
    if (!packageName.trim()) {
      toast.error('Lütfen paket adı girin');
      return;
    }

    if (selectedPackageItems.length === 0) {
      toast.error('Pakete en az bir ürün eklemelisiniz');
      return;
    }

    addPackageToCart(packageName.trim(), selectedPackageItems);
    setPackageDialogOpen(false);
    setPackageName('');
    setSelectedPackageItems([]);
    setPackageSearchQuery('');
  }, [packageName, selectedPackageItems, addPackageToCart]);

  const filteredProductsForPackage = useMemo(() => {
    if (!packageSearchQuery) return filteredProducts;
    const query = packageSearchQuery.toLowerCase();
    return filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(query)
    );
  }, [filteredProducts, packageSearchQuery]);

  const handleAddPackageToCart = useCallback((packageItem: PackageType) => {
    if (!packageItem.products || packageItem.products.length === 0) {
      toast.error('Paket içeriği yüklenemedi');
      return;
    }

    const packageItems: PackageItem[] = packageItem.products.map((p: any) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      image_url: p.image_url,
      category: 'Paket',
      store_type: p.store_type || 'home',
    }));

    addPackageToCart(packageItem.name, packageItems);
  }, [addPackageToCart]);

  const filteredPackages = useMemo(() => {
    if (selectedStore === 'all') return packages;
    return packages.filter((pkg) => 
      pkg.store_type === selectedStore || pkg.store_type === 'both'
    );
  }, [packages, selectedStore]);

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
          {/* Paket Oluştur Butonu ve Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white sm:w-auto"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Paket Oluştur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Paket Oluştur</DialogTitle>
                  <DialogDescription>
                    Birden fazla ürünü birleştirerek özel paket oluşturun
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="packageName">Paket Adı *</Label>
                    <Input
                      id="packageName"
                      placeholder="Örn: Oturma Odası Paketi"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                    />
                  </div>

                  {/* Seçili ürünler */}
                  {selectedPackageItems.length > 0 && (
                    <div className="space-y-2">
                      <Label>Pakete Eklenen Ürünler ({selectedPackageItems.length})</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                        {selectedPackageItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-2 bg-white rounded border"
                          >
                            <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                              {item.image_url ? (
                                <Image
                                  src={item.image_url}
                                  alt={item.name}
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
                              <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                              {item.price && (
                                <p className="text-xs text-gray-600">
                                  {item.price.toLocaleString('tr-TR')} TL
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveFromPackage(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ürün arama ve listesi */}
                  <div className="space-y-2">
                    <Label>Ürün Ara ve Ekle</Label>
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
                        filteredProductsForPackage
                          .filter((p) => !selectedPackageItems.find((item) => item.id === p._id))
                          .map((p) => {
                            const categoryName = p.category_id !== null && typeof p.category_id === 'object' 
                              ? p.category_id?.name 
                              : null;
                            
                            return (
                              <div
                                key={p._id}
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-200"
                                onClick={() => handleAddToPackage(p)}
                              >
                                <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                  {p.image_url ? (
                                    <Image
                                      src={p.image_url}
                                      alt={p.name}
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
                                  <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                                  <p className="text-xs text-gray-500">{categoryName || 'Diğer'}</p>
                                  {p.price && (
                                    <p className="text-xs text-[#a42a2a] font-medium">
                                      {p.price.toLocaleString('tr-TR')} TL
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToPackage(p);
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPackageDialogOpen(false);
                      setPackageName('');
                      setSelectedPackageItems([]);
                      setPackageSearchQuery('');
                    }}
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleCreatePackage}
                    disabled={!packageName.trim() || selectedPackageItems.length === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Paketi Sepete Ekle
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="relative flex-1">
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
          <div className="text-sm text-gray-600">
            {filteredProducts.length} ürün bulundu
            {filteredProducts.length > PRODUCTS_PER_PAGE && (
              <span className="ml-2">
                (Sayfa {currentPage} / {totalPages})
              </span>
            )}
          </div>
        </div>

        {/* Paketler Bölümü */}
        {!loading && filteredPackages.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#0a0a0a] mb-6 flex items-center gap-2">
              <Boxes className="h-6 w-6 text-[#a42a2a]" />
              Özel Paketler
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((packageItem) => (
                <div
                  key={packageItem._id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border-2 border-blue-100"
                >
                  <div className="relative h-64 bg-gradient-to-br from-blue-50 to-blue-100">
                    {packageItem.image_url ? (
                      <Image
                        src={packageItem.image_url}
                        alt={packageItem.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Boxes className="h-16 w-16 text-blue-400" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      📦 Paket
                    </div>
                    <div className="absolute top-2 right-2 bg-white/90 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {packageItem.product_count || packageItem.product_ids?.length || 0} ürün
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {packageItem.name}
                    </h3>
                    {packageItem.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {packageItem.description}
                      </p>
                    )}
                    {packageItem.price && (
                      <p className="text-[#a42a2a] font-bold text-lg mb-3">
                        {packageItem.price.toLocaleString('tr-TR')} TL
                      </p>
                    )}
                    <Button
                      onClick={() => handleAddPackageToCart(packageItem)}
                      className="w-full bg-[#0a0a0a] hover:bg-[#a42a2a] text-white mb-2"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Sepete Ekle
                    </Button>
                    {packageItem.products && packageItem.products.length > 0 && (
                      <div>
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedPackages);
                            if (newExpanded.has(packageItem._id)) {
                              newExpanded.delete(packageItem._id);
                            } else {
                              newExpanded.add(packageItem._id);
                            }
                            setExpandedPackages(newExpanded);
                          }}
                          className="w-full text-sm text-gray-600 hover:text-[#a42a2a] flex items-center justify-center gap-1"
                        >
                          {expandedPackages.has(packageItem._id) ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Paket İçeriğini Gizle
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Paket İçeriğini Gör
                            </>
                          )}
                        </button>
                        {expandedPackages.has(packageItem._id) && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            <p className="text-xs font-semibold text-gray-700 mb-2">
                              Paket İçeriği:
                            </p>
                            {packageItem.products.map((product: any) => (
                              <div
                                key={product._id}
                                className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded"
                              >
                                <div className="relative w-8 h-8 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                                  {product.image_url ? (
                                    <Image
                                      src={product.image_url}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                      sizes="32px"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                      -
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium line-clamp-1">{product.name}</p>
                                  {product.price && (
                                    <p className="text-gray-600">
                                      {product.price.toLocaleString('tr-TR')} TL
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ürünler Başlığı */}
        {!loading && filteredPackages.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#0a0a0a] mb-4">Tüm Ürünler</h2>
          </div>
        )}

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

            {/* Pagination */}
            {totalPages > 1 && (
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
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
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
                          if (currentPage < totalPages) {
                            setCurrentPage(currentPage + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        disabled={currentPage === totalPages}
                        className={`flex items-center gap-1 px-4 py-2 rounded-md border transition-colors ${
                          currentPage === totalPages
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
                  Sayfa {currentPage} / {totalPages} - Toplam {filteredProducts.length} ürün
                </div>
              </div>
            )}
          </>
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

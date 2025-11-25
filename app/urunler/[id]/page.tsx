'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api';
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
import { ShoppingCart, ArrowLeft, MessageCircle, ChevronLeft, ChevronRight, Package, Plus, X, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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
  category_id: string | {
    _id: string;
    name: string;
    slug: string;
  } | null;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, addPackageToCart } = useCart();
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [packageName, setPackageName] = useState('');
  const [selectedPackageItems, setSelectedPackageItems] = useState<PackageItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [packageSearchQuery, setPackageSearchQuery] = useState('');

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
    }
    loadAllProducts();
  }, [params.id]);

  const loadAllProducts = async () => {
    try {
      const data = await productsApi.getAll({ is_active: true });
      setAllProducts(data);
    } catch (error) {
      console.error('Products load error:', error);
    }
  };

  const loadProduct = async (id: string) => {
    try {
      const data = await productsApi.getById(id);

      if (!data) {
        router.push('/urunler');
        return;
      }

      const formatted = {
        ...data,
        id: data._id,
        categories: data.category_id !== null && typeof data.category_id === 'object' ? data.category_id : null,
      };

      setProduct(formatted);
    } catch (error) {
      router.push('/urunler');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = useCallback(() => {
    if (!product) return;

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
  }, [product, addToCart]);

  const handleWhatsAppContact = useCallback(() => {
    if (!product) return;

    const phone =
      product.store_type === 'premium' ? '905539019490' : '905537482279';
    const message = encodeURIComponent(
      `Merhaba, ${product.name} ürünü hakkında bilgi almak istiyorum.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  }, [product]);

  const handleAddToPackage = useCallback((productToAdd: Product) => {
    if (selectedPackageItems.find((item) => item.id === productToAdd._id)) {
      toast.info('Bu ürün pakete zaten eklenmiş');
      return;
    }

    const categoryName = productToAdd.category_id !== null && typeof productToAdd.category_id === 'object' 
      ? productToAdd.category_id?.name 
      : null;

    const packageItem: PackageItem = {
      id: productToAdd._id || productToAdd.id || '',
      name: productToAdd.name,
      price: productToAdd.price,
      image_url: productToAdd.image_url,
      category: categoryName || 'Diğer',
      store_type: productToAdd.store_type,
    };

    setSelectedPackageItems((prev) => [...prev, packageItem]);
    toast.success(`${productToAdd.name} pakete eklendi`);
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
    if (!packageSearchQuery) return allProducts;
    const query = packageSearchQuery.toLowerCase();
    return allProducts.filter((p) =>
      p.name.toLowerCase().includes(query)
    );
  }, [allProducts, packageSearchQuery]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3" />
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/urunler"
          className="inline-flex items-center text-gray-600 hover:text-[#a42a2a] mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Ürünlere Dön
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductImageCarousel product={product} />

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                    product.store_type === 'premium'
                      ? 'bg-[#a42a2a] text-white'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  {product.store_type === 'premium'
                    ? 'Kavi Premium'
                    : 'Kavi Home'}
                </span>
                {product.category_id !== null && typeof product.category_id === 'object' && (
                  <Link
                    href={`/urunler?kategori=${product.category_id.slug}`}
                    className="text-sm text-gray-600 hover:text-[#a42a2a] transition-colors"
                  >
                    {product.category_id.name}
                  </Link>
                )}
              </div>

              <h1 className="text-4xl font-bold text-[#0a0a0a] mb-4">
                {product.name}
              </h1>

              {product.price && (
                <p className="text-4xl font-bold text-[#a42a2a] mb-6">
                  {product.price.toLocaleString('tr-TR')} TL
                </p>
              )}
            </div>

            {product.description && (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="pt-6 space-y-4">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full bg-[#0a0a0a] hover:bg-[#a42a2a] text-white text-lg py-6"
              >
                <ShoppingCart className="h-5 w-5 mr-3" />
                Sepete Ekle
              </Button>

              <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full text-lg py-6 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    <Package className="h-5 w-5 mr-3" />
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

              <Button
                onClick={handleWhatsAppContact}
                size="lg"
                variant="outline"
                className="w-full text-lg py-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                <MessageCircle className="h-5 w-5 mr-3" />
                WhatsApp ile Bilgi Al
              </Button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md space-y-3">
              <h3 className="font-bold text-lg mb-4">Mağaza Bilgileri</h3>
              {product.store_type === 'premium' ? (
                <>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Adres:</span> Süvari
                    Mahallesi İstasyon Caddesi No:186 Etimesgut/Ankara
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Telefon:</span>{' '}
                    <a
                      href="tel:05539019490"
                      className="hover:text-[#a42a2a] transition-colors"
                    >
                      0 (553) 901 94 90
                    </a>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Adres:</span> Kazım
                    Karabekir Mahallesi İstasyon Caddesi No:64
                    Etimesgut/Ankara
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Telefon:</span>{' '}
                    <a
                      href="tel:05537482279"
                      className="hover:text-[#a42a2a] transition-colors"
                    >
                      0 (553) 748 22 79
                    </a>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Image Carousel Component for Detail Page
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

  const goToPrevious = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div 
      className="relative aspect-square bg-white rounded-2xl shadow-lg overflow-hidden group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {images.length > 0 ? (
        <>
          {images[currentImageIndex]?.startsWith('data:') ? (
            <img
              src={images[currentImageIndex]}
              alt={`${product.name} - Resim ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={images[currentImageIndex]}
              alt={`${product.name} - Resim ${currentImageIndex + 1}`}
              fill
              className="object-cover"
              priority={currentImageIndex === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
          
          {/* Navigation Buttons */}
          {hasMultipleImages && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Önceki resim"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Sonraki resim"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/75 w-2'
                    }`}
                    aria-label={`Resim ${index + 1}`}
                  />
                ))}
              </div>

              {/* Thumbnail Navigation (Optional - sadece çok fazla resim varsa) */}
              {images.length <= 5 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-white scale-110'
                          : 'border-white/50 hover:border-white/75'
                      }`}
                      aria-label={`Resim ${index + 1}`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <span className="text-xl">Resim yok</span>
        </div>
      )}
    </div>
  );
}

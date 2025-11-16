'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Product = {
  _id: string;
  id?: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
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
  const { addToCart } = useCart();

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
    }
  }, [params.id]);

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
        categories: typeof data.category_id === 'object' ? data.category_id : null,
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
          <div className="relative aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-xl">Resim yok</span>
              </div>
            )}
          </div>

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
                {product.category_id && typeof product.category_id === 'object' && (
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

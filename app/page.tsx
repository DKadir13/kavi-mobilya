'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Store, Award, Truck, Phone } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { productsApi } from '@/lib/api';
import Image from 'next/image';

type Product = {
  _id: string;
  name: string;
  image_url: string | null;
  store_type: 'home' | 'premium';
  price: number | null;
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const data = await productsApi.getFeatured();
      const formattedData = data.map((product: any) => ({
        ...product,
        id: product._id,
      }));
      setFeaturedProducts(formattedData);
    } catch (error) {
      // Silent fail - empty state will show
    }
  };

  return (
    <div className="pt-20">
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#a42a2a]" />
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-20" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            KAVİ MOBİLYA
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8">
            1995'ten Beri Kaliteli Mobilya Üretimi
          </p>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Ankara Ulus'ta kurulup bugün Etimesgut'ta iki mağazamızla hizmet
            veriyoruz. Tüm Türkiye'ye kaliteli mobilya çözümleri sunuyoruz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/urunler">
              <Button
                size="lg"
                className="bg-[#a42a2a] hover:bg-[#8a2222] text-white"
              >
                Ürünlerimizi İnceleyin
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/iletisim">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#0a0a0a]"
              >
                İletişime Geçin
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/urunler?magaza=home">
              <div className="group relative h-80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity" />
                <div className="relative h-full flex flex-col items-center justify-center text-white p-8">
                  <Store className="h-16 w-16 mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Kavi Home</h2>
                  <p className="text-center text-gray-200">
                    Kaliteli ve uygun fiyatlı mobilya çözümleri
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 border-white text-white hover:bg-white hover:text-gray-900"
                  >
                    Ürünleri Görüntüle
                  </Button>
                </div>
              </div>
            </Link>

            <Link href="/urunler?magaza=premium">
              <div className="group relative h-80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-[#a42a2a] to-[#7a1a1a]" />
                <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=800')] bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity" />
                <div className="relative h-full flex flex-col items-center justify-center text-white p-8">
                  <Award className="h-16 w-16 mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Kavi Premium</h2>
                  <p className="text-center text-gray-200">
                    Lüks ve özel tasarım mobilya koleksiyonu
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 border-white text-white hover:bg-white hover:text-[#a42a2a]"
                  >
                    Ürünleri Görüntüle
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0a0a0a] mb-4">
              Öne Çıkan Ürünler
            </h2>
            <p className="text-gray-600">
              En popüler ve beğenilen ürünlerimiz
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/urunler/${product._id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  <div className="relative h-64 bg-gray-100">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        Resim yok
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {product.store_type === 'premium'
                        ? 'Kavi Premium'
                        : 'Kavi Home'}
                    </p>
                    {product.price && (
                      <p className="text-[#a42a2a] font-bold">
                        {product.price.toLocaleString('tr-TR')} TL
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Henüz öne çıkan ürün eklenmemiş.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#a42a2a] text-white mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-xl mb-2">Kalite Garantisi</h3>
              <p className="text-gray-600">
                1995'ten beri sektörde edindiğimiz deneyimle kaliteli ürünler
                sunuyoruz
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#a42a2a] text-white mb-4">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-xl mb-2">
                Tüm Türkiye'ye Teslimat
              </h3>
              <p className="text-gray-600">
                Ürünlerinizi güvenle Türkiye'nin her yerine ulaştırıyoruz
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#a42a2a] text-white mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-xl mb-2">Profesyonel Destek</h3>
              <p className="text-gray-600">
                Uzman ekibimiz her zaman size yardımcı olmaya hazır
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Store, Award, Truck, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { productsApi } from '@/lib/api';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

type Product = {
  _id: string;
  name: string;
  image_url: string | null;
  store_type: 'home' | 'premium';
  price: number | null;
  featured_order?: number | null;
  images?: string[];
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
    
    // Intro overlay - 3 saniye sonra gradyanlı geçişle kaybolsun
    const hideTimer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);

    return () => clearTimeout(hideTimer);
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Autoplay functionality
  useEffect(() => {
    if (!api) {
      return;
    }

    const autoplayInterval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0); // Loop back to start
      }
    }, 5000);

    return () => {
      clearInterval(autoplayInterval);
    };
  }, [api]);

  const loadFeaturedProducts = async () => {
    try {
      const data = await productsApi.getFeatured();
      const formattedData = data
        .map((product: any) => ({
          ...product,
          id: product._id,
        }))
        // featured_order'a göre sırala (1'den 6'ya kadar)
        .sort((a: Product, b: Product) => {
          const orderA = a.featured_order ?? 999;
          const orderB = b.featured_order ?? 999;
          return orderA - orderB;
        });
      setFeaturedProducts(formattedData);
    } catch (error) {
      console.error('Featured products load error:', error);
      // Silent fail - empty state will show
    }
  };

  return (
    <div className="pt-32 relative">
      {/* Intro Overlay - Logo ve Yazı */}
      {showIntro && (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-2000 ease-out">
          <div className="flex flex-col items-center justify-center space-y-8">
            {/* Logo */}
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 animate-logo-fade-in">
              <Image
                src="/logo.png"
                alt="Kavi Mobilya Logo"
                fill
                className="object-contain"
                priority
                sizes="256px"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(5000%) hue-rotate(350deg) brightness(0.9) contrast(1.2)',
                }}
              />
            </div>
            
            {/* Alt Yazı */}
            <div className="animate-text-slide-up">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
                Evinize Değer Katar
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* Ana Sayfa İçeriği - Gradyanlı Geçiş */}
      <div className={`transition-opacity duration-2500 ease-out ${
        showIntro ? 'opacity-0' : 'opacity-100'
      }`}>

        {/* Hero Carousel Section */}
      <section className="relative h-[600px] overflow-hidden">
        <Carousel
          className="w-full h-full"
          setApi={setApi}
          opts={{
            align: 'start',
            loop: true,
          }}
        >
          <CarouselContent className="h-[600px]">
            <CarouselItem className="h-full">
              <div className="relative h-full w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#a42a2a]" />
                <Image
                  src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1920"
                  alt="Kavi Mobilya"
                  fill
                  className="object-cover opacity-30"
                  priority
                  sizes="100vw"
                />
                <div className="relative z-10 h-full flex items-center justify-center">
                  <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
                      KAVİ MOBİLYA
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 mb-8 animate-fade-in-delay">
                      1995'ten Beri Kaliteli Mobilya Üretimi
                    </p>
                    <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in-delay-2">
                      Ankara Ulus'ta kurulup bugün Etimesgut'ta iki mağazamızla hizmet
                      veriyoruz. Tüm Türkiye'ye kaliteli mobilya çözümleri sunuyoruz.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-3">
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
                          className="!border-white !text-white hover:bg-white hover:!text-[#0a0a0a] transition-colors bg-transparent"
                        >
                          İletişime Geçin
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem className="h-full">
              <div className="relative h-full w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[#a42a2a] via-[#1a1a1a] to-[#0a0a0a]" />
                <Image
                  src="https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=1920"
                  alt="Kavi Mobilya Premium"
                  fill
                  className="object-cover opacity-30"
                  sizes="100vw"
                />
                <div className="relative z-10 h-full flex items-center justify-center">
                  <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                      KALİTE VE GÜVEN
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 mb-8">
                      Yılların Deneyimi ile Hizmetinizdeyiz
                    </p>
                    <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                      Her bütçeye uygun mobilya çözümleri sunuyoruz. Eviniz için en iyisini seçin.
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem className="h-full">
              <div className="relative h-full w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#a42a2a] to-[#0a0a0a]" />
                <Image
                  src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920"
                  alt="Kavi Mobilya Koleksiyon"
                  fill
                  className="object-cover opacity-30"
                  sizes="100vw"
                />
                <div className="relative z-10 h-full flex items-center justify-center">
                  <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                      MODERN TASARIMLAR
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 mb-8">
                      Evinize Uygun Mobilya Çözümleri
                    </p>
                    <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                      Geniş ürün yelpazemizle hayalinizdeki evi oluşturun.
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-white/80 hover:bg-white text-gray-900" />
          <CarouselNext className="right-4 bg-white/80 hover:bg-white text-gray-900" />
        </Carousel>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/urunler?magaza=home">
              <div className="group relative h-80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 scroll-reveal">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity">
                  <Image
                    src="/kavi-home.jpeg"
                    alt="Kavi Home"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="relative h-full flex flex-col items-center justify-center text-white p-8">
                  <Store className="h-16 w-16 mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Kavi Home</h2>
                  <p className="text-center text-gray-200">
                    Kaliteli ve uygun fiyatlı mobilya çözümleri
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 !border-white !text-white hover:bg-white hover:!text-gray-900 transition-colors bg-transparent"
                  >
                    Ürünleri Görüntüle
                  </Button>
                </div>
              </div>
            </Link>

            <Link href="/urunler?magaza=premium">
              <div className="group relative h-80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 scroll-reveal scroll-reveal-delay-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[#a42a2a] to-[#7a1a1a]" />
                <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity">
                  <Image
                    src="/kavi-premium.jpeg"
                    alt="Kavi Premium"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="relative h-full flex flex-col items-center justify-center text-white p-8">
                  <Award className="h-16 w-16 mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Kavi Premium</h2>
                  <p className="text-center text-gray-200">
                    Lüks ve özel tasarım mobilya koleksiyonu
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 !border-white !text-white hover:bg-white hover:!text-[#a42a2a] transition-colors bg-transparent"
                  >
                    Ürünleri Görüntüle
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Galeri Bölümü - yan-yana klasöründeki fotoğraflar */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-3xl font-bold text-[#0a0a0a] mb-4">
              Galeri
            </h2>
            <p className="text-gray-600">
              Ürünlerimizden kareler
            </p>
          </div>
          
          {/* yan-yana klasöründeki fotoğraflar - Grid galeri */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {[
              'WhatsApp Image 2025-11-18 at 13.49.43 (1).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.43.jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.44 (1).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.44 (2).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.44.jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.47 (1).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.47 (2).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.47.jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.48 (1).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.48 (2).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.48 (3).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.48.jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.49 (1).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.49 (2).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.49 (3).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.49.jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.50 (1).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.50 (2).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.50.jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.51 (1).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.51 (2).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.51 (3).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.51.jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.52 (1).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.52 (2).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.52 (3).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.52.jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.53 (1).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.53 (2).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.53 (3).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.53 (4).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.53.jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.54 (1).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.54 (2).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.54 (3).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.54 (4).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.54.jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.55 (1).jpeg',
              'WhatsApp Image 2025-11-18 at 13.49.55.jpeg',
            ].map((imageName, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Image
                  src={`/yan-yana/${encodeURIComponent(imageName)}`}
                  alt={`Galeri ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 scroll-reveal">
              <h2 className="text-3xl font-bold text-[#0a0a0a] mb-4">
                Öne Çıkan Ürünler
              </h2>
              <p className="text-gray-600">
                En popüler ve beğenilen ürünlerimiz
              </p>
            </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product, index) => {
                // İlk resmi kullan (image_url veya images array'inden)
                const displayImage = product.images && product.images.length > 0 
                  ? product.images[0] 
                  : product.image_url;
                
                return (
                  <Link
                    key={product._id}
                    href={`/urunler/${product._id}`}
                    className={`group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all scroll-reveal ${
                      index === 0 ? '' : index === 1 ? 'scroll-reveal-delay-1' : 'scroll-reveal-delay-2'
                    }`}
                  >
                    <div className="relative h-64 bg-gray-100">
                      {displayImage ? (
                        displayImage.startsWith('data:') ? (
                          <img
                            src={displayImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <Image
                            src={displayImage}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            loading="lazy"
                          />
                        )
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                          Resim yok
                        </div>
                      )}
                      {/* Sıra numarası badge (opsiyonel) */}
                      {product.featured_order && (
                        <div className="absolute top-2 left-2 bg-[#a42a2a] text-white text-xs font-bold px-2 py-1 rounded-full">
                          #{product.featured_order}
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
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Henüz öne çıkan ürün eklenmemiş.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Yönetim panelinden öne çıkan ürün ekleyebilirsiniz.
              </p>
            </div>
          )}
          </div>
        </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center scroll-reveal">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#a42a2a] text-white mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-xl mb-2">Kalite Garantisi</h3>
              <p className="text-gray-600">
                1995'ten beri sektörde edindiğimiz deneyimle kaliteli ürünler
                sunuyoruz
              </p>
            </div>

            <div className="text-center scroll-reveal scroll-reveal-delay-1">
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

            <div className="text-center scroll-reveal scroll-reveal-delay-2">
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
    </div>
  );
}

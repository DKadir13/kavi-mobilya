'use client';

import Link from 'next/link';
import { Phone, MapPin, Mail } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Admin ve bakım sayfalarında footer'ı gösterme
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/bakim')) {
    return null;
  }

  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <div className="relative w-24 h-24 bg-white rounded-lg p-3 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Kavi Mobilya Logo"
                  fill
                  className="object-contain"
                  sizes="96px"
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">1995'ten beri</p>
            </div>
            <p className="text-gray-400 text-sm">
              1995 yılından beri Ankara'da kaliteli mobilya üretimi ve
              satışında hizmetinizdeyiz. Tüm Türkiye'ye hizmet sağlıyoruz.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-[#a42a2a]">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link
                  href="/hakkimizda"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  href="/urunler"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Ürünlerimiz
                </Link>
              </li>
              <li>
                <Link
                  href="/iletisim"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative w-8 h-8 bg-white rounded p-1 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Kavi Home Logo"
                  fill
                  className="object-contain"
                  sizes="32px"
                />
              </div>
              <h4 className="font-bold text-[#a42a2a]">Kavi Home</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-[#a42a2a] mt-1 flex-shrink-0" />
                <p className="text-gray-400">
                  Kazım Karabekir Mahallesi İstasyon Caddesi No:64
                  Etimesgut/Ankara
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-[#a42a2a] flex-shrink-0" />
                <a
                  href="tel:05537482279"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  0 (553) 748 22 79
                </a>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative w-8 h-8 bg-white rounded p-1 flex-shrink-0">
                <Image
                  src="/logo-premium.png"
                  alt="Kavi Premium Logo"
                  fill
                  className="object-contain"
                  sizes="32px"
                />
              </div>
              <h4 className="font-bold text-[#a42a2a]">Kavi Premium</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-[#a42a2a] mt-1 flex-shrink-0" />
                <p className="text-gray-400">
                  Süvari Mahallesi İstasyon Caddesi No:186 Etimesgut/Ankara
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-[#a42a2a] flex-shrink-0" />
                <a
                  href="tel:05539019490"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  0 (553) 901 94 90
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="text-center space-y-3">
            <div className="text-sm text-gray-400">
              <p className="mb-2">
            &copy; {new Date().getFullYear()} Kavi Mobilya. Tüm hakları
            saklıdır.
          </p>
              <p className="mb-2">
                <a
                  href="https://www.kavimobilya.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  www.kavimobilya.com
                </a>
              </p>
            </div>
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-800">
              <p>VAVI SOFTWARE TARAFINDAN YAPILMIŞTIR</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

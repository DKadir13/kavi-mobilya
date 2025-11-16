import Link from 'next/link';
import { Phone, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[#a42a2a] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">KM</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">KAVİ MOBİLYA</h3>
                <p className="text-sm text-gray-400">1995'ten beri</p>
              </div>
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
            <h4 className="font-bold mb-4 text-[#a42a2a]">Kavi Home</h4>
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
            <h4 className="font-bold mb-4 text-[#a42a2a]">Kavi Premium</h4>
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

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Kavi Mobilya. Tüm hakları
            saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}

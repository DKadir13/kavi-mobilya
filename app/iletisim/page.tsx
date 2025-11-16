import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="pt-20">
      <div className="bg-gradient-to-r from-[#0a0a0a] to-[#a42a2a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            İletişim
          </h1>
          <p className="text-xl text-gray-200">
            Bizimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz
          </p>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-gray-50 p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-lg">KH</span>
                </div>
                <h2 className="text-3xl font-bold text-[#0a0a0a]">
                  Kavi Home
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#0a0a0a] rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Adres</h3>
                    <p className="text-gray-600">
                      Kazım Karabekir Mahallesi
                      <br />
                      İstasyon Caddesi No:64
                      <br />
                      Etimesgut / Ankara
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#0a0a0a] rounded-lg flex items-center justify-center">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Telefon</h3>
                    <a
                      href="tel:05537482279"
                      className="text-gray-600 hover:text-[#a42a2a] transition-colors"
                    >
                      0 (553) 748 22 79
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">WhatsApp</h3>
                    <a
                      href="https://wa.me/905537482279"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2"
                    >
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        WhatsApp ile İletişim
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#0a0a0a] rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Çalışma Saatleri
                    </h3>
                    <p className="text-gray-600">
                      Pazartesi - Cumartesi: 09:00 - 19:00
                      <br />
                      Pazar: 10:00 - 18:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#a42a2a] to-[#8a2222] p-8 rounded-2xl shadow-lg text-white">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
                  <span className="text-[#a42a2a] font-bold text-lg">KP</span>
                </div>
                <h2 className="text-3xl font-bold">Kavi Premium</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Adres</h3>
                    <p className="text-white/90">
                      Süvari Mahallesi
                      <br />
                      İstasyon Caddesi No:186
                      <br />
                      Etimesgut / Ankara
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                      <Phone className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Telefon</h3>
                    <a
                      href="tel:05539019490"
                      className="text-white/90 hover:text-white transition-colors"
                    >
                      0 (553) 901 94 90
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">WhatsApp</h3>
                    <a
                      href="https://wa.me/905539019490"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2"
                    >
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        WhatsApp ile İletişim
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Çalışma Saatleri
                    </h3>
                    <p className="text-white/90">
                      Pazartesi - Cumartesi: 09:00 - 19:00
                      <br />
                      Pazar: 10:00 - 18:00
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#0a0a0a] mb-4">
            Tüm Türkiye'ye Hizmet Veriyoruz
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Ankara merkezli olarak faaliyet göstermekteyiz ancak ürünlerimizi
            Türkiye'nin her yerine güvenle gönderiyoruz. Detaylı bilgi için
            bizimle iletişime geçebilirsiniz.
          </p>
          <Link href="/urunler">
            <Button
              size="lg"
              className="bg-[#a42a2a] hover:bg-[#8a2222] text-white"
            >
              Ürünlerimizi İnceleyin
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

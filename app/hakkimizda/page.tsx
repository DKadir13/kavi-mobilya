import { Award, Users, MapPin, Calendar } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="pt-20">
      <div
        className="relative h-80 flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1920')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 to-[#a42a2a]/80" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Hakkımızda</h1>
          <p className="text-xl">1995'ten beri kaliteli mobilya üretimi</p>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0a0a0a] mb-4">
              Kavi Mobilya Hikayesi
            </h2>
            <div className="w-24 h-1 bg-[#a42a2a] mx-auto mb-6" />
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6 leading-relaxed">
              Kavi Mobilya, 1995 yılında Ankara Ulus'ta kurulmuş olup, mobilya
              sektöründe 30 yıla yaklaşan deneyimiyle Türkiye'nin önde gelen
              mobilya üreticileri arasında yer almaktadır. Kuruluşumuzdan bu
              yana kalite, güven ve müşteri memnuniyeti ilkelerimizden asla
              ödün vermedik.
            </p>

            <p className="text-gray-700 mb-6 leading-relaxed">
              Bugün Etimesgut'ta iki mağazamızla hizmet vermekteyiz. Kavi Home
              mağazamızda her bütçeye uygun, kaliteli mobilya çözümleri
              sunarken, Kavi Premium mağazamızda özel tasarım, lüks ve prestijli
              mobilyalar sunarak farklı müşteri ihtiyaçlarına cevap veriyoruz.
            </p>

            <p className="text-gray-700 mb-6 leading-relaxed">
              Tüm Türkiye'ye hizmet veren firmamız, modern üretim teknolojileri
              ve deneyimli ekibimizle müşterilerimize en iyi hizmeti sunmak için
              çalışmaktadır. Yatak odası, yemek odası, oturma grubu, genç odası,
              çocuk odası, mutfak mobilyaları ve daha fazlasında uzmanlaşmış
              bulunmaktayız.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#a42a2a] text-white mb-4">
                <Calendar className="h-10 w-10" />
              </div>
              <h3 className="font-bold text-2xl mb-2">1995</h3>
              <p className="text-gray-600">Kuruluş Yılı</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#a42a2a] text-white mb-4">
                <MapPin className="h-10 w-10" />
              </div>
              <h3 className="font-bold text-2xl mb-2">2</h3>
              <p className="text-gray-600">Mağaza</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#a42a2a] text-white mb-4">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="font-bold text-2xl mb-2">1000+</h3>
              <p className="text-gray-600">Mutlu Müşteri</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#a42a2a] text-white mb-4">
                <Award className="h-10 w-10" />
              </div>
              <h3 className="font-bold text-2xl mb-2">30</h3>
              <p className="text-gray-600">Yıllık Deneyim</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0a0a0a] mb-4">
              Mağazalarımız
            </h2>
            <div className="w-24 h-1 bg-[#a42a2a] mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-[#0a0a0a] mb-4">
                Kavi Home
              </h3>
              <p className="text-gray-700 mb-6">
                Kaliteli ve uygun fiyatlı mobilya çözümlerimizi bulabileceğiniz
                mağazamız.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-[#a42a2a] mt-1 flex-shrink-0" />
                  <p className="text-gray-600">
                    Kazım Karabekir Mahallesi İstasyon Caddesi No:64
                    Etimesgut/Ankara
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#a42a2a] to-[#8a2222] p-8 rounded-xl shadow-lg text-white">
              <h3 className="text-2xl font-bold mb-4">Kavi Premium</h3>
              <p className="mb-6 text-gray-100">
                Lüks ve özel tasarım mobilya koleksiyonumuzu keşfedebileceğiniz
                mağazamız.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
                  <p>
                    Süvari Mahallesi İstasyon Caddesi No:186 Etimesgut/Ankara
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0a0a0a] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Vizyonumuz ve Misyonumuz</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Müşterilerimize en kaliteli mobilya ürünlerini en uygun fiyatlarla
            sunmak, sektörde öncü olmaya devam etmek ve Türkiye'nin her köşesine
            ulaşarak evlere değer katmak bizim vizyonumuzdur.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            Kaliteden ödün vermeden, müşteri memnuniyetini ön planda tutarak,
            yenilikçi tasarımlar ve güvenilir hizmetle mobilya sektörünün en
            güvenilir markası olmak misyonumuzdur.
          </p>
        </div>
      </section>
    </div>
  );
}

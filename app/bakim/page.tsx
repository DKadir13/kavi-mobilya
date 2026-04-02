import Image from 'next/image';

export default function BakimSayfasi() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl text-center">
        <div className="flex flex-col items-center">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-6">
            <Image
              src="/logo.png"
              alt="Kavi Mobilya Logo"
              fill
              className="object-contain"
              sizes="128px"
              priority
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Bakımda
          </h1>

          <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed">
            Web sitemiz 4 Nisan 2026 14:00&apos;a kadar bakımdadır.
            <br />
            Kısa süre içinde tekrar hizmetinizde olacağız.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 text-gray-500 text-xs sm:text-sm">
          VAVI SOFTWARE TARAFINDAN YAPILMIŞTIR
        </div>
      </div>
    </div>
  );
}


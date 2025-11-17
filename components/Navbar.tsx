'use client';

import Link from 'next/link';
import { Menu, ShoppingCart, X, Phone, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import CartSidebar from './CartSidebar';
import CategorySidebar from './CategorySidebar';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getTotalItems } = useCart();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Premium sayfalarında premium logo kullan
  const magazaParam = searchParams?.get('magaza');
  const isPremiumPage = pathname?.includes('premium') || magazaParam === 'premium';
  const logoSrc = isPremiumPage ? '/logo-premium.png' : '/logo.png';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/hakkimizda', label: 'Hakkımızda' },
    { href: '/urunler', label: 'Ürünlerimiz' },
    { href: '/iletisim', label: 'İletişim' },
  ];

  // Admin sayfalarında navbar'ı gösterme
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Üst Bilgi Çubuğu */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] text-white text-xs sm:text-sm py-1.5 sm:py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <a
                href="tel:05537482279"
                className="flex items-center space-x-1 sm:space-x-2 hover:text-[#a42a2a] transition-colors"
              >
                <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">0 (553) 748 22 79</span>
                <span className="sm:hidden">0537 482 22 79</span>
              </a>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Ankara Etimesgut</span>
              <span className="sm:hidden">Etimesgut</span>
            </div>
          </div>
        </div>
      </div>

      <nav
        className={`fixed top-10 left-0 right-0 z-40 transition-all duration-300 bg-white shadow-md ${
          scrolled ? 'shadow-lg' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center group">
              <div className="relative w-28 h-28 transform group-hover:scale-110 transition-transform duration-300 animate-navbar-logo-fade">
                <Image
                  src={logoSrc}
                  alt="Kavi Mobilya Logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="112px"
                  style={{
                    filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(5000%) hue-rotate(350deg) brightness(0.9) contrast(1.2)',
                  }}
                />
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-[#a42a2a] px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCategoriesOpen(true)}
                className="text-gray-700 hover:text-[#a42a2a] hover:bg-gray-50 hidden sm:flex"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartOpen(true)}
                className="text-gray-700 hover:text-[#a42a2a] hover:bg-gray-50 relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#a42a2a] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-[#a42a2a] hover:bg-gray-50 md:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-700 hover:text-[#a42a2a] px-3 py-2 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setCategoriesOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left block text-gray-700 hover:text-[#a42a2a] px-3 py-2 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
              >
                Kategoriler
              </button>
            </div>
          </div>
        )}
      </nav>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <CategorySidebar
        open={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
      />
    </>
  );
}

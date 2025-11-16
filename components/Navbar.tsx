'use client';

import Link from 'next/link';
import { Menu, ShoppingCart, X } from 'lucide-react';
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
      setScrolled(window.scrollY > 20);
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

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-black/95 backdrop-blur-md shadow-lg'
            : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 transform group-hover:scale-110 transition-transform duration-300">
                <Image
                  src={logoSrc}
                  alt="Kavi Mobilya Logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="48px"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl tracking-wider">
                  KAVİ MOBİLYA
                </span>
                <span className="text-gray-400 text-xs">1995'ten beri</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-white/10"
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
                className="text-white hover:bg-white/10 hidden sm:flex"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartOpen(true)}
                className="text-white hover:bg-white/10 relative"
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
                className="text-white hover:bg-white/10 md:hidden"
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
          <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10">
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg text-base font-medium hover:bg-white/10 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setCategoriesOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left block text-gray-300 hover:text-white px-3 py-2 rounded-lg text-base font-medium hover:bg-white/10 transition-colors"
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

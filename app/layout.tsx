import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundaryWrapper from '@/components/ErrorBoundaryWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kavi Mobilya - Kaliteli Mobilya 1995\'ten Beri',
  description:
    'Ankara\'da 1995 yılından beri kaliteli mobilya üretimi. Yatak odası, yemek odası, oturma grubu ve daha fazlası. Tüm Türkiye\'ye hizmet.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  verification: {
    google: 'EZZKEGHA2dIc6pR5KhGWmI4ES3lU-Gqvaw32yTGQnVU',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <ErrorBoundaryWrapper>
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
            <Toaster />
        </CartProvider>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}

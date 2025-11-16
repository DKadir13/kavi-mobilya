'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Star,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    // Önce localStorage kontrolü (statik admin için) - sadece client-side
    if (typeof window !== 'undefined') {
      const adminAuth = localStorage.getItem('admin_auth');
      const adminEmail = localStorage.getItem('admin_email');
      
      if (adminAuth === 'true' && adminEmail) {
        const adminUser = localStorage.getItem('admin_user');
        if (adminUser) {
          setUser(JSON.parse(adminUser));
          setLoading(false);
          return;
        }
      }
    }

    // MongoDB auth kontrolü (token varsa)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (token) {
        // Token geçerliliğini kontrol et (basit kontrol)
        try {
          const adminUser = localStorage.getItem('admin_user');
          if (adminUser) {
            setUser(JSON.parse(adminUser));
            setLoading(false);
            return;
          }
        } catch (error) {
          // Token parse hatası - sessizce devam et
        }
      }
    }

    // Hiçbir auth yoksa login sayfasına yönlendir
    if (typeof window !== 'undefined') {
      const adminAuth = localStorage.getItem('admin_auth');
      if (!adminAuth || adminAuth !== 'true') {
        router.push('/admin');
        return;
      }
    } else {
      router.push('/admin');
      return;
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    // LocalStorage'ı temizle
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#a42a2a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      href: '/admin/dashboard',
      label: 'Panel',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/dashboard/products',
      label: 'Ürünler',
      icon: Package,
    },
    {
      href: '/admin/dashboard/categories',
      label: 'Kategoriler',
      icon: FolderTree,
    },
    {
      href: '/admin/dashboard/featured',
      label: 'Öne Çıkan Ürünler',
      icon: Star,
    },
    {
      href: '/admin/dashboard/sales',
      label: 'Satışlar',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] text-white transform transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#a42a2a] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">KM</span>
              </div>
              <div>
                <h2 className="font-bold text-sm">Kavi Mobilya</h2>
                <p className="text-xs text-gray-400">Yönetim Paneli</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="mb-3 px-4">
              <p className="text-sm text-gray-400">Oturum açan</p>
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Çıkış Yap
            </Button>
          </div>
        </aside>

        <div className="flex-1 lg:ml-64">
          <header className="bg-white border-b sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 py-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-4">
                <Link href="/" target="_blank">
                  <Button variant="outline" size="sm">
                    Siteyi Görüntüle
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

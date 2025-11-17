'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

// STATİK ADMIN BİLGİLERİ - Veritabanı kurulduktan sonra bu kısmı kaldırabilirsiniz
// Bu bilgiler MongoDB'deki admin kullanıcıları ile aynı olmalı
const STATIC_ADMINS = [
  { username: 'nyc0606', password: '1170nyc.' },
  { username: 'ibo123', password: '1453ibo.' },
];

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Önce statik admin kontrolü yap
      const staticAdmin = STATIC_ADMINS.find(
        (admin) => admin.username === username && admin.password === password
      );
      
      if (staticAdmin) {
        // LocalStorage'a admin bilgisini kaydet
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_username', username);
        localStorage.setItem('admin_user', JSON.stringify({
          id: 'static-admin-id',
          username: username,
          email: username,
          role: 'admin'
        }));
        
        router.push('/admin/dashboard');
        return;
      }

      // MongoDB auth denemesi
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Giriş bilgileri hatalı');
        }

        const { user, token } = await response.json();
        
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_username', user.username || user.email);
        localStorage.setItem('admin_email', user.email);
        localStorage.setItem('admin_user', JSON.stringify(user));
        localStorage.setItem('admin_token', token);
        
        router.push('/admin/dashboard');
      } catch (mongoError: any) {
        throw new Error(mongoError.message || 'Giriş bilgileri hatalı. Lütfen tekrar deneyin.');
      }
    } catch (error: any) {
      setError(error.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#a42a2a] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#a42a2a] rounded-xl mb-4">
              <span className="text-white font-bold text-2xl">KM</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0a0a0a]">
              Yönetim Paneli
            </h1>
            <p className="text-gray-600 mt-2">Kavi Mobilya Admin</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınızı girin"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#a42a2a] hover:bg-[#8a2222] text-white"
              disabled={loading}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        </div>

        <p className="text-center text-white text-sm mt-6">
          Kavi Mobilya &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

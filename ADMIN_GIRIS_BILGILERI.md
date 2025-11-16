# 🔐 Admin Panel Giriş Bilgileri

## Statik Admin Giriş Bilgileri

Veritabanı kurulumu tamamlanana kadar geçici olarak statik admin giriş bilgileri kullanılabilir.

### Giriş Bilgileri

```
E-posta: admin@kavimobilya.com
Şifre: KaviMobilya2024!
```

### Nasıl Kullanılır?

1. `/admin` adresine gidin
2. Yukarıdaki e-posta ve şifre ile giriş yapın
3. Admin paneline erişim sağlayın

### Önemli Notlar

⚠️ **GÜVENLİK UYARISI:**
- Bu statik giriş bilgileri sadece geliştirme/test amaçlıdır
- Veritabanı kurulumu tamamlandıktan sonra bu statik kontrolü kaldırmanız önerilir
- Production ortamında mutlaka Supabase Authentication kullanın

### Veritabanı Kurulduktan Sonra

Veritabanı kurulumu tamamlandığında:

1. Supabase Dashboard > Authentication > Users
2. "Add User" ile yeni kullanıcı oluşturun
3. `admin_users` tablosuna ekleyin:
   ```sql
   INSERT INTO admin_users (id, email, full_name, role)
   VALUES ('USER_ID_BURAYA', 'email@example.com', 'Ad Soyad', 'admin');
   ```

4. Statik kontrolü kaldırmak için:
   - `app/admin/page.tsx` dosyasındaki `STATIC_ADMIN_EMAIL` ve `STATIC_ADMIN_PASSWORD` kısımlarını kaldırın
   - Sadece Supabase auth kontrolünü kullanın

---

**Son Güncelleme:** 16 Kasım 2024


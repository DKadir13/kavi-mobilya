# Kavi Mobilya - Kurulum Adımları

## ✅ Tamamlanan İşlemler

1. ✅ Proje bağımlılıkları kuruldu (`npm install`)
2. ✅ Navbar logo entegrasyonu tamamlandı
   - Ana logo: `/public/logo.png`
   - Premium logo: `/public/logo-premium.png`
   - Premium sayfalarında otomatik olarak premium logo gösterilir
3. ✅ Öne Çıkan Ürünler yönetim sayfası eklendi
   - Yol: `/admin/dashboard/featured`
   - Maksimum 6 ürün seçilebilir
   - Sıralama yönetimi (1-6)
4. ✅ Ana sayfada öne çıkan ürünler bölümü güncellendi
   - Her zaman gösterilir (ürün yoksa mesaj gösterilir)
   - Sıralama özelliği eklendi

## 📋 Yapılması Gerekenler

### 1. Veritabanı Migration'ını Çalıştırın

Supabase Dashboard'a giriş yapın ve SQL Editor'de şu migration'ı çalıştırın:

```sql
-- Add featured_order column to products table for managing featured products order
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS featured_order integer;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_featured_order ON products(featured_order) WHERE is_featured = true;

-- Add comment
COMMENT ON COLUMN products.featured_order IS 'Sıralama numarası (1-6) - Öne çıkan ürünlerin gösterim sırası';
```

**Dosya konumu:** `supabase/migrations/20251116000000_add_featured_order.sql`

### 2. Projeyi Çalıştırın

```bash
npm run dev
```

Proje http://localhost:3000 adresinde çalışacaktır.

### 3. Admin Paneline Giriş Yapın

1. `/admin` adresine gidin
2. Supabase Authentication'dan oluşturduğunuz kullanıcı bilgileriyle giriş yapın
3. Admin kullanıcı oluşturmak için:
   - Supabase Dashboard > Authentication > Users
   - "Add User" ile yeni kullanıcı oluşturun
   - SQL Editor'de şu sorguyu çalıştırın:
   ```sql
   INSERT INTO admin_users (id, email, full_name, role)
   VALUES ('USER_ID_BURAYA', 'email@example.com', 'Ad Soyad', 'admin');
   ```

### 4. Öne Çıkan Ürünleri Yönetin

1. Admin panelinde "Öne Çıkan Ürünler" menüsüne gidin
2. "Ürün Ekle" butonuna tıklayın
3. Ürün seçin ve sıralama numarası belirleyin (1-6)
4. Maksimum 6 ürün ekleyebilirsiniz
5. Sıralamayı değiştirmek için tablodaki dropdown menüyü kullanın
6. Ürünü çıkarmak için çöp kutusu ikonuna tıklayın

## 🎨 Logo Kullanımı

- **Ana Logo (`logo.png`)**: Tüm sayfalarda varsayılan olarak gösterilir
- **Premium Logo (`logo-premium.png`)**: 
  - Premium ürün sayfalarında
  - `?magaza=premium` parametresi olan sayfalarda
  - Otomatik olarak değişir

## 📁 Dosya Yapısı

```
kavi-mobilya/
├── app/
│   ├── admin/
│   │   └── dashboard/
│   │       └── featured/          # YENİ: Öne çıkan ürünler yönetimi
│   │           └── page.tsx
│   └── page.tsx                   # GÜNCELLENDİ: Öne çıkan ürünler bölümü
├── components/
│   └── Navbar.tsx                 # GÜNCELLENDİ: Logo entegrasyonu
├── public/
│   ├── logo.png                   # Ana logo
│   └── logo-premium.png          # Premium logo
└── supabase/
    └── migrations/
        └── 20251116000000_add_featured_order.sql  # YENİ: Migration dosyası
```

## 🔧 Teknik Detaylar

### Veritabanı Değişiklikleri

- `products` tablosuna `featured_order` kolonu eklendi
- Bu kolon öne çıkan ürünlerin sıralamasını tutar (1-6)
- Index eklendi: `idx_products_featured_order`

### Yeni Özellikler

1. **Öne Çıkan Ürünler Yönetimi**
   - Admin panelinden 6 ürüne kadar seçim
   - Sıralama yönetimi
   - Kolay ekleme/çıkarma

2. **Logo Sistemi**
   - Dinamik logo değişimi
   - Premium sayfalarda otomatik premium logo

3. **Ana Sayfa Güncellemeleri**
   - Öne çıkan ürünler her zaman gösterilir
   - Sıralama özelliği

## 🐛 Sorun Giderme

### Migration Hatası
Eğer migration çalışmazsa, Supabase Dashboard > SQL Editor'den manuel olarak çalıştırın.

### Logo Görünmüyor
- Logo dosyalarının `public/` klasöründe olduğundan emin olun
- Dosya isimlerinin tam olarak `logo.png` ve `logo-premium.png` olduğunu kontrol edin

### Öne Çıkan Ürünler Görünmüyor
- Veritabanında `is_featured = true` olan ürünlerin olduğundan emin olun
- `featured_order` kolonunun eklendiğini kontrol edin
- Admin panelinden ürün eklediğinizden emin olun

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Browser console'u kontrol edin
2. Supabase connection'ı doğrulayın
3. Migration'ların çalıştığından emin olun

---

**Son Güncelleme:** 16 Kasım 2024


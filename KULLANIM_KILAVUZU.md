# Kavi Mobilya - Kullanım Kılavuzu

## Proje Özeti

Kavi Mobilya için tam özellikli, modern bir e-ticaret web sitesi ve yönetim paneli oluşturulmuştur.

## Ana Özellikler

### 🏠 Kullanıcı Tarafı

1. **Ana Sayfa**
   - Hero bölümü ile etkileyici giriş
   - Kavi Home ve Kavi Premium mağaza kartları
   - Öne çıkan ürünler bölümü
   - Hizmet avantajları

2. **Ürünler Sayfası** (`/urunler`)
   - Kategori filtreleme
   - Mağaza filtreleme (Home/Premium)
   - Arama fonksiyonu
   - Sepete ekleme
   - Responsive grid layout

3. **Ürün Detay Sayfası**
   - Büyük ürün görseli
   - Detaylı ürün bilgisi
   - Sepete ekleme
   - WhatsApp ile iletişim butonu
   - Mağaza bilgileri

4. **Sepet Sistemi**
   - Sidebar sepet
   - Adet artırma/azaltma
   - WhatsApp entegrasyonu
   - Otomatik mesaj oluşturma
   - LocalStorage ile kalıcı sepet

5. **Kategori Sidebar**
   - Tüm kategoriler
   - Mağaza bazlı filtreleme
   - Hızlı navigasyon

### 🔧 Yönetim Paneli (`/admin`)

1. **Dashboard**
   - Toplam ürün sayısı
   - Kategori sayısı
   - Aylık satış istatistikleri
   - Son satışlar listesi

2. **Ürün Yönetimi** (`/admin/dashboard/products`)
   - Ürün ekleme/düzenleme/silme
   - Görsel yükleme
   - Fiyat belirleme
   - Kategori atama
   - Mağaza seçimi (Home/Premium)
   - Öne çıkan ürün işaretleme
   - Aktif/Pasif durumu
   - Arama fonksiyonu

3. **Kategori Yönetimi** (`/admin/dashboard/categories`)
   - Kategori ekleme/düzenleme/silme
   - Sıralama
   - URL slug oluşturma
   - Açıklama ekleme

4. **Satış Yönetimi** (`/admin/dashboard/sales`)
   - Satış kaydı ekleme
   - Aylık satış raporu
   - Müşteri bilgileri
   - Satış tutarı hesaplama
   - Toplam ciro gösterimi
   - Tarih filtreleme

## Veritabanı Yapısı

### Categories (Kategoriler)
- id, name, slug, description, order_index
- Varsayılan kategoriler: Yatak Odası, Yemek Odası, Oturma Grubu, vb.

### Products (Ürünler)
- id, name, description, price, image_url
- category_id, store_type (home/premium)
- is_featured, is_active, stock_status

### Sales (Satışlar)
- id, product_id, quantity, sale_price
- customer_name, customer_phone, notes
- sale_date

### Admin Users
- id, email, full_name, role

## Güvenlik

- Row Level Security (RLS) tüm tablolarda aktif
- Ürünler herkese açık (read-only)
- Yönetim işlemleri sadece authenticated kullanıcılar
- WhatsApp entegrasyonu güvenli

## Tasarım

- **Renk Paleti**:
  - Ana Renk: #a42a2a (Kırmızı)
  - İkincil Renk: #0a0a0a (Siyah)

- **Responsive Tasarım**:
  - Mobile-first yaklaşım
  - Tüm cihazlarda optimize görünüm
  - Touch-friendly arayüz

- **Modern UI**:
  - Smooth transitions
  - Hover efektleri
  - Loading states
  - Toast notifications hazır

## WhatsApp Entegrasyonu

### Sepetten İletişim
Kullanıcı sepete ürün ekleyip "WhatsApp ile İletişime Geç" butonuna tıkladığında:

```
Merhaba, aşağıdaki ürünler hakkında bilgi almak istiyorum:

1. [Ürün Adı]
   Mağaza: Kavi Premium/Home
   Kategori: [Kategori]
   Adet: [Adet]
   Fiyat: [Fiyat] TL

Detaylı bilgi ve fiyat teklifi alabilir miyim?
```

### Ürün Detayından İletişim
Tek ürün için doğrudan WhatsApp iletişimi

## Kurulum Adımları

1. **Supabase Ayarları**
   ```bash
   # .env.local dosyasını düzenleyin
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

2. **Paketleri Yükleyin**
   ```bash
   npm install
   ```

3. **Geliştirme Sunucusu**
   ```bash
   npm run dev
   ```

4. **Admin Kullanıcı Oluşturun**
   - Supabase Dashboard'dan kullanıcı ekleyin
   - `admin_users` tablosuna kaydedin

## Önemli Notlar

- Migration dosyaları otomatik oluşturulmuştur
- Varsayılan kategoriler otomatik eklenmiştir
- Görsel URL'leri Pexels veya kendi hosting'inizden kullanabilirsiniz
- WhatsApp numaraları kodda mevcuttur (değiştirilebilir)
- Tüm tarih formatları Türkçe'ye göre ayarlanmıştır

## Gelecek Geliştirmeler İçin Öneriler

1. Görsel yükleme sistemi (Supabase Storage)
2. E-posta bildirimleri
3. Stok takibi
4. Ödeme entegrasyonu
5. Müşteri paneli
6. Sipariş takibi
7. İndirim/kampanya sistemi
8. Blog/haberler bölümü

## Destek

Herhangi bir sorun yaşarsanız:
1. README_SETUP.md dosyasını kontrol edin
2. Supabase connection'ı doğrulayın
3. Browser console'u kontrol edin
4. Migration'ların çalıştığından emin olun

---

**Kavi Mobilya © 2024 - Tüm hakları saklıdır**

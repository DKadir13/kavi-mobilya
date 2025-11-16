# Kavi Mobilya Web Sitesi - Kurulum Kılavuzu

## Projeyi Çalıştırmak İçin Gerekli Adımlar

### 1. Supabase Yapılandırması

Proje Supabase veritabanı kullanmaktadır. `.env.local` dosyasını aşağıdaki bilgilerle güncelleyin:

```
NEXT_PUBLIC_SUPABASE_URL=supabase_proje_url_buraya
NEXT_PUBLIC_SUPABASE_ANON_KEY=supabase_anon_key_buraya
```

### 2. Veritabanı Kurulumu

Veritabanı migration'ları otomatik olarak oluşturulmuştur. Aşağıdaki tablolar oluşturuldu:

- **categories**: Ürün kategorileri
- **products**: Ürünler
- **sales**: Satış kayıtları
- **admin_users**: Yönetici kullanıcılar

### 3. Admin Kullanıcı Oluşturma

Yönetim paneline giriş yapmak için Supabase Authentication'dan bir kullanıcı oluşturun:

1. Supabase Dashboard > Authentication > Users
2. "Add User" butonuna tıklayın
3. E-posta ve şifre girin
4. Kullanıcı oluşturulduktan sonra, `admin_users` tablosuna manuel olarak ekleyin:

```sql
INSERT INTO admin_users (id, email, full_name, role)
VALUES ('kullanici_uid_buraya', 'email@example.com', 'Ad Soyad', 'admin');
```

### 4. Projeyi Çalıştırma

```bash
npm install
npm run dev
```

Proje http://localhost:3000 adresinde çalışacaktır.

### 5. Önemli Sayfalar

- **Ana Sayfa**: `/`
- **Hakkımızda**: `/hakkimizda`
- **Ürünler**: `/urunler`
- **İletişim**: `/iletisim`
- **Yönetim Paneli**: `/admin`

## Özellikler

### Kullanıcı Tarafı
- Modern ve responsive tasarım
- Kavi Home ve Kavi Premium mağaza ayırımı
- Ürün listeleme ve filtreleme
- Sepet yönetimi
- WhatsApp entegrasyonu
- Kategori bazlı navigasyon

### Yönetim Paneli
- Ürün ekleme, düzenleme, silme
- Kategori yönetimi
- Satış kayıtları
- Aylık satış raporları
- İstatistikler

## Renk Paleti

- Ana Renk (Kırmızı): #a42a2a
- İkincil Renk (Siyah): #0a0a0a

## İletişim Bilgileri

### Kavi Home
- Adres: Kazım Karabekir Mahallesi İstasyon Caddesi No:64 Etimesgut/Ankara
- Telefon: 0 (553) 748 22 79

### Kavi Premium
- Adres: Süvari Mahallesi İstasyon Caddesi No:186 Etimesgut/Ankara
- Telefon: 0 (553) 901 94 90

## Teknik Detaylar

- **Framework**: Next.js 13 (App Router)
- **Veritabanı**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Build

```bash
npm run build
```

Proje başarıyla build edilmiştir ve production için hazırdır.

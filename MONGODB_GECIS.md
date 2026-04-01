# MongoDB Geçiş Rehberi

## ✅ Tamamlanan İşlemler

1. ✅ MongoDB ve Mongoose paketleri kuruldu
2. ✅ MongoDB bağlantı dosyası oluşturuldu (`lib/mongodb.ts`)
3. ✅ Mongoose modelleri oluşturuldu:
   - Category
   - Product
   - Sale
   - AdminUser
4. ✅ API route'ları oluşturuldu:
   - `/api/categories` - Kategori CRUD işlemleri
   - `/api/products` - Ürün CRUD işlemleri
   - `/api/products/featured` - Öne çıkan ürünler
   - `/api/sales` - Satış CRUD işlemleri
   - `/api/auth/login` - Admin girişi
5. ✅ Frontend sayfaları güncellendi:
   - Ana sayfa (`app/page.tsx`)
   - Ürünler sayfası (`app/urunler/page.tsx`)
   - Ürün detay sayfası (`app/urunler/[id]/page.tsx`)
   - CategorySidebar (`components/CategorySidebar.tsx`)

## 📋 Yapılması Gerekenler

### 1. Admin Panel Sayfalarını Güncelleme

Admin panel sayfaları henüz MongoDB API'lerini kullanmıyor. Şu dosyaları güncellemeniz gerekiyor:

- `app/admin/dashboard/products/page.tsx`
- `app/admin/dashboard/categories/page.tsx`
- `app/admin/dashboard/sales/page.tsx`
- `app/admin/dashboard/featured/page.tsx`
- `app/admin/dashboard/page.tsx`
- `app/admin/page.tsx` (Authentication)

### 2. Environment Variables

`.env.local` dosyasına MongoDB connection string ekleyin:

```env
MONGODB_URI=mongodb+srv://kavihomemobilya_db_user:<db_password>@cluster0.rpfuter.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=kavi_mobilya
JWT_SECRET=your-secret-key-here-change-in-production
```

### 3. İlk Admin Kullanıcı Oluşturma

MongoDB'de ilk admin kullanıcıyı oluşturmak için bir script çalıştırın veya MongoDB Compass kullanın:

```javascript
// MongoDB Shell veya Compass'te çalıştırın
db.adminusers.insertOne({
  email: "admin@kavimobilya.com",
  password: "$2a$10$...", // bcrypt hash (şifre: KaviMobilya2024!)
  full_name: "Admin Kullanıcı",
  role: "admin",
  created_at: new Date(),
  updated_at: new Date()
})
```

Veya API route ile oluşturabilirsiniz (şifre hash'lenmeli).

### 4. Varsayılan Kategorileri Ekleme

MongoDB'ye varsayılan kategorileri ekleyin:

```javascript
db.categories.insertMany([
  { name: "Yatak Odası", slug: "yatak-odasi", description: "Modern ve klasik yatak odası takımları", order_index: 1 },
  { name: "Yemek Odası", slug: "yemek-odasi", description: "Şık yemek odası takımları", order_index: 2 },
  { name: "Oturma Grubu", slug: "oturma-grubu", description: "Konforlu koltuk ve oturma grupları", order_index: 3 },
  { name: "Genç Odası", slug: "genc-odasi", description: "Genç odası mobilyaları", order_index: 4 },
  { name: "Çocuk Odası", slug: "cocuk-odasi", description: "Çocuk odası mobilyaları", order_index: 5 },
  { name: "Mutfak", slug: "mutfak", description: "Mutfak dolabı ve mobilyaları", order_index: 6 },
  { name: "TV Ünitesi", slug: "tv-unitesi", description: "Modern TV üniteleri", order_index: 7 },
  { name: "Çalışma Masası", slug: "calisma-masasi", description: "Ofis ve ev çalışma masaları", order_index: 8 }
])
```

## 🔧 Teknik Detaylar

### MongoDB Connection

- Connection pooling kullanılıyor
- Global cache ile bağlantı yeniden kullanılıyor
- Her API route'da `connectDB()` çağrılıyor

### API Response Format

MongoDB'den gelen veriler `_id` kullanıyor. Frontend'de `id` olarak kullanmak için mapping yapılıyor:

```typescript
const formatted = data.map((item: any) => ({
  ...item,
  id: item._id,
}));
```

### Authentication

- JWT token kullanılıyor
- HTTP-only cookie'de saklanıyor
- 7 gün geçerli

## 🐛 Sorun Giderme

### MongoDB Bağlantı Hatası

- Connection string'in doğru olduğundan emin olun
- IP whitelist kontrolü yapın (MongoDB Atlas)
- Network erişimini kontrol edin

### Populate Sorunları

MongoDB'de `category_id` string olduğu için populate çalışmıyor. Manuel populate yapılıyor:

```typescript
const category = await Category.findById(product.category_id);
```

### Type Errors

MongoDB `_id` kullanırken frontend `id` bekliyor. Mapping yapıldığından emin olun.

---

**Son Güncelleme:** 16 Kasım 2024


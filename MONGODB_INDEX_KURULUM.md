# 🔧 MongoDB Index Kurulum Rehberi

## Sorun

MongoDB sort işlemleri memory limit'ini aşıyor:
```
Sort exceeded memory limit of 33554432 bytes
```

## Çözüm

Index'ler ekleyerek sort işlemlerini optimize ettik. Index'ler sort işlemlerini çok daha hızlı yapar ve memory limit sorununu önler.

## 🚀 Otomatik Index Oluşturma

### Yöntem 1: Script ile (Önerilen)

```bash
npx tsx scripts/create-indexes.ts
```

Bu script tüm gerekli index'leri otomatik olarak oluşturur.

### Yöntem 2: MongoDB Atlas'ta Manuel Oluşturma

1. **MongoDB Atlas Dashboard'a gidin**: https://cloud.mongodb.com
2. **Collections** sekmesine gidin
3. **products** collection'ını seçin
4. **Indexes** sekmesine tıklayın
5. **Create Index** butonuna tıklayın
6. Şu index'leri oluşturun:

#### Products Collection Indexes:
- `created_at` (descending: -1)
- `category_id` (ascending: 1)
- `store_type` (ascending: 1)
- `is_active` (ascending: 1)
- `is_featured` + `featured_order` (compound index)

#### Sales Collection Indexes:
- `created_at` (descending: -1)
- `product_id` (ascending: 1)
- `sale_date` (ascending: 1)

#### Categories Collection Indexes:
- `order_index` (ascending: 1)
- `slug` (ascending: 1, unique: true)

## ✅ Yapılan Değişiklikler

1. **Product Model**: `created_at` index'i eklendi
2. **Sale Model**: `created_at` index'i eklendi
3. **API Routes**: Aggregation pipeline'lara `allowDiskUse: true` eklendi
4. **Limit Optimizasyonu**: Products API limit'i 1000'den 500'e düşürüldü (memory limit sorununu önlemek için)

## 📝 Notlar

- Index'ler otomatik olarak oluşturulur (ilk sorgu sırasında)
- Ancak script ile oluşturmak daha hızlı ve güvenilirdir
- Index'ler disk alanı kullanır ama sorgu performansını çok artırır
- `created_at` index'i sort işlemleri için kritik öneme sahiptir

## 🔍 Index'leri Kontrol Etme

MongoDB Atlas'ta:
1. Collection'ı seçin
2. **Indexes** sekmesine gidin
3. Oluşturulan index'leri görebilirsiniz

Veya MongoDB Shell'de:
```javascript
db.products.getIndexes()
db.sales.getIndexes()
db.categories.getIndexes()
```

## 🎯 Sonuç

Index'ler oluşturulduktan sonra:
- ✅ Sort işlemleri çok daha hızlı olacak
- ✅ Memory limit hatası çözülecek
- ✅ Yönetim paneli hatasız çalışacak


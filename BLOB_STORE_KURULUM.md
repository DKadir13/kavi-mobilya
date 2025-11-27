# 📦 Vercel Blob Store Kurulum Rehberi

Bu proje artık Vercel Blob Store kullanarak resim dosyalarını saklamaktadır. Bu rehber, Vercel Blob Store'un nasıl kurulacağını ve yapılandırılacağını açıklar.

## 🎯 Genel Bakış

Vercel Blob Store entegrasyonu ile:
- ✅ Resimler artık Vercel Blob Store'da saklanıyor (MongoDB'de base64 yerine)
- ✅ Daha hızlı yükleme ve görüntüleme
- ✅ Daha az veritabanı yükü
- ✅ Otomatik CDN desteği
- ✅ Kolay silme ve yönetim

## 📋 Kurulum Adımları

### 1. Vercel Blob Store Oluşturma

1. **Vercel Dashboard'a gidin**: https://vercel.com
2. Projenizi seçin
3. Üst menüden **"Storage"** sekmesine tıklayın
4. **"Create Database"** veya **"Add Storage"** butonuna tıklayın
5. **"Blob"** seçeneğini seçin
6. Blob store için bir isim girin (örn: `kavi-mobilya-blob`)
7. Region seçin (örn: `IAD1` - Washington D.C. veya size en yakın region)
8. **"Create"** butonuna tıklayın

### 2. Environment Variable Kontrolü

Vercel Blob Store oluşturulduktan sonra, Vercel otomatik olarak `BLOB_READ_WRITE_TOKEN` environment variable'ını ekler.

**Kontrol etmek için:**
1. Vercel Dashboard'da projenizi seçin
2. **Settings** > **Environment Variables** bölümüne gidin
3. `BLOB_READ_WRITE_TOKEN` değişkeninin listede olduğunu kontrol edin

**Eğer yoksa:**
1. Blob store sayfasında **"Settings"** sekmesine gidin
2. **"Tokens"** bölümünden token'ı kopyalayın
3. **Settings** > **Environment Variables** bölümüne gidin
4. **"Add New"** butonuna tıklayın
5. **Name**: `BLOB_READ_WRITE_TOKEN`
6. **Value**: Kopyaladığınız token'ı yapıştırın
7. **Environment**: Production, Preview, Development (hepsini seçin)
8. **"Save"** butonuna tıklayın

### 3. Local Development için Environment Variable

Local development için `.env.local` dosyanıza ekleyin:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Token'ı nereden alabilirim?**
- Vercel Dashboard > Projeniz > Storage > Blob Store > Settings > Tokens

## 🔄 Mevcut Verilerin Migrasyonu

Eğer projenizde zaten base64 formatında saklanmış resimler varsa:

1. Mevcut base64 resimler çalışmaya devam edecek (geriye dönük uyumluluk)
2. Yeni yüklenen resimler otomatik olarak Blob Store'a yüklenecek
3. İsteğe bağlı: Eski base64 resimleri manuel olarak Blob Store'a taşıyabilirsiniz

## ✅ Test Etme

Kurulumu test etmek için:

1. Admin paneline gidin: `/admin`
2. Ürün ekleme/düzenleme sayfasına gidin
3. Bir resim yükleyin
4. Resmin başarıyla yüklendiğini kontrol edin
5. Yüklenen resmin URL'sinin `https://` ile başladığını kontrol edin (Blob Store URL'si)

## 🐛 Sorun Giderme

### "BLOB_READ_WRITE_TOKEN is not defined" Hatası

**Çözüm:**
- Vercel Dashboard'da environment variable'ın eklendiğini kontrol edin
- Local development için `.env.local` dosyasına ekleyin
- Deployment sonrası environment variable'ın tüm environment'larda (Production, Preview, Development) olduğundan emin olun

### Resimler Yüklenmiyor

**Kontrol listesi:**
1. ✅ Blob Store oluşturuldu mu?
2. ✅ `BLOB_READ_WRITE_TOKEN` environment variable eklendi mi?
3. ✅ Vercel logs'u kontrol edin: Dashboard > Deployments > [Latest] > Functions
4. ✅ Network tab'ında upload request'inin başarılı olduğunu kontrol edin

### Eski Base64 Resimler Görünmüyor

**Not:** Eski base64 resimler (`data:image/...` formatında) hala çalışmalı. Eğer görünmüyorsa:
- Tarayıcı console'unu kontrol edin
- Resim URL'lerinin doğru format olduğunu kontrol edin

## 📚 Daha Fazla Bilgi

- [Vercel Blob Store Dokümantasyonu](https://vercel.com/docs/storage/vercel-blob)
- [@vercel/blob NPM Paketi](https://www.npmjs.com/package/@vercel/blob)

## 🔐 Güvenlik Notları

- `BLOB_READ_WRITE_TOKEN` hassas bir bilgidir, asla public repository'lerde paylaşmayın
- `.env.local` dosyasını `.gitignore`'a eklediğinizden emin olun
- Production'da sadece gerekli environment variable'ları ekleyin


# Vercel Deployment Rehberi

## 1. MongoDB Atlas IP Whitelist Ayarları

Vercel deployment için MongoDB Atlas'ta IP whitelist ayarlarını yapmanız gerekiyor:

1. https://cloud.mongodb.com adresine gidin
2. **Network Access** bölümüne gidin
3. **"Add IP Address"** butonuna tıklayın
4. **"Allow Access from Anywhere"** seçeneğini seçin
5. IP adresi: `0.0.0.0/0` olarak ayarlayın
6. **"Confirm"** butonuna tıklayın

Bu ayar, Vercel'in dinamik IP adreslerinden bağlantıya izin verir.

## 2. Vercel Blob Store Kurulumu

### 2.1 Blob Store Oluşturma

1. Vercel dashboard'a gidin: https://vercel.com
2. Projenizi seçin
3. **Storage** sekmesine gidin
4. **"Create Database"** veya **"Add Storage"** butonuna tıklayın
5. **"Blob"** seçeneğini seçin
6. Blob store adını girin (örn: `kavi-mobilya-blob`)
7. Region seçin (örn: `IAD1` - Washington D.C.)
8. **"Create"** butonuna tıklayın

### 2.2 Blob Store Token Alma

Blob store oluşturulduktan sonra, Vercel otomatik olarak `BLOB_READ_WRITE_TOKEN` environment variable'ını ekler. Eğer eklenmemişse:

1. Blob store sayfasında **"Settings"** sekmesine gidin
2. **"Tokens"** bölümünden token'ı kopyalayın
3. Environment variables'a ekleyin (aşağıdaki adımları takip edin)

## 3. Vercel Environment Variables

Vercel dashboard'da şu environment variable'ları ekleyin:

### Gerekli Environment Variables:

```
MONGODB_URI=mongodb+srv://kavihomemobilya_db_user:<db_password>@cluster0.rpfuter.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=kavi_mobilya
JWT_SECRET=<strong-secret>
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Not:** `BLOB_READ_WRITE_TOKEN` genellikle Vercel tarafından otomatik olarak eklenir. Eğer eklenmemişse manuel olarak eklemeniz gerekir.

### Vercel'de Environment Variable Ekleme:

1. Vercel dashboard'a gidin: https://vercel.com
2. Projenizi seçin
3. **Settings** > **Environment Variables** bölümüne gidin
4. **"Add New"** butonuna tıklayın
5. **Name**: `MONGODB_URI` veya `BLOB_READ_WRITE_TOKEN`
6. **Value**: İlgili değeri yapıştırın
7. **Environment**: Production, Preview, Development (hepsini seçin)
8. **"Save"** butonuna tıklayın

## 4. Vercel Deployment Adımları

### GitHub ile Deploy:

1. Projenizi GitHub'a push edin:
   ```bash
   git add .
   git commit -m "Vercel deployment hazır"
   git push origin main
   ```

2. Vercel dashboard'a gidin: https://vercel.com
3. **"Add New Project"** butonuna tıklayın
4. GitHub repository'nizi seçin
5. **"Import"** butonuna tıklayın
6. Environment variables'ı ekleyin (yukarıdaki adımları takip edin)
7. **"Deploy"** butonuna tıklayın

### Vercel CLI ile Deploy:

```bash
# Vercel CLI'yi yükleyin
npm i -g vercel

# Projeyi deploy edin
vercel

# Production'a deploy edin
vercel --prod
```

## 5. Build Ayarları

Vercel otomatik olarak Next.js projelerini algılar ve build eder. Ekstra bir ayar gerekmez.

## 6. Post-Deployment Kontrolleri

Deployment sonrası kontrol edin:

1. ✅ API route'ları çalışıyor mu? (`/api/categories`, `/api/products`)
2. ✅ MongoDB bağlantısı başarılı mı?
3. ✅ Admin paneli çalışıyor mu?
4. ✅ Ürünler ve kategoriler yükleniyor mu?

## 7. Troubleshooting

### MongoDB Bağlantı Hatası:
- MongoDB Atlas IP whitelist'te `0.0.0.0/0` olduğundan emin olun
- Environment variable'ın doğru eklendiğini kontrol edin
- Vercel logs'u kontrol edin: Vercel Dashboard > Project > Deployments > [Latest] > Functions

### Build Hatası:
- `package.json` dosyasında tüm dependencies'in olduğundan emin olun
- Vercel build logs'unu kontrol edin

### Blob Store Hatası:
- Blob store'un oluşturulduğundan emin olun
- `BLOB_READ_WRITE_TOKEN` environment variable'ının doğru eklendiğini kontrol edin
- Vercel logs'u kontrol edin: Vercel Dashboard > Project > Deployments > [Latest] > Functions

## 8. Notlar

- Vercel'de environment variables production, preview ve development için ayrı ayrı ayarlanabilir
- MongoDB Atlas'ta `0.0.0.0/0` ayarı production için güvenli değildir, ancak development için kullanılabilir
- Production için MongoDB Atlas'ta sadece Vercel'in IP range'lerini eklemek daha güvenlidir (ancak Vercel'in IP'leri dinamik olduğu için `0.0.0.0/0` kullanmak pratik bir çözümdür)


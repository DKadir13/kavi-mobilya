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

## 2. Vercel Environment Variables

Vercel dashboard'da şu environment variable'ları ekleyin:

### Gerekli Environment Variables:

```
MONGODB_URI=mongodb+srv://kavihomemobilya_db_user:Vy4tGlPZgjkGPFth@cluster0.rpfuter.mongodb.net/kavi_mobilya?retryWrites=true&w=majority&appName=Cluster0
```

### Vercel'de Environment Variable Ekleme:

1. Vercel dashboard'a gidin: https://vercel.com
2. Projenizi seçin
3. **Settings** > **Environment Variables** bölümüne gidin
4. **"Add New"** butonuna tıklayın
5. **Name**: `MONGODB_URI`
6. **Value**: MongoDB connection string'inizi yapıştırın
7. **Environment**: Production, Preview, Development (hepsini seçin)
8. **"Save"** butonuna tıklayın

## 3. Vercel Deployment Adımları

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

## 4. Build Ayarları

Vercel otomatik olarak Next.js projelerini algılar ve build eder. Ekstra bir ayar gerekmez.

## 5. Post-Deployment Kontrolleri

Deployment sonrası kontrol edin:

1. ✅ API route'ları çalışıyor mu? (`/api/categories`, `/api/products`)
2. ✅ MongoDB bağlantısı başarılı mı?
3. ✅ Admin paneli çalışıyor mu?
4. ✅ Ürünler ve kategoriler yükleniyor mu?

## 6. Troubleshooting

### MongoDB Bağlantı Hatası:
- MongoDB Atlas IP whitelist'te `0.0.0.0/0` olduğundan emin olun
- Environment variable'ın doğru eklendiğini kontrol edin
- Vercel logs'u kontrol edin: Vercel Dashboard > Project > Deployments > [Latest] > Functions

### Build Hatası:
- `package.json` dosyasında tüm dependencies'in olduğundan emin olun
- Vercel build logs'unu kontrol edin

## 7. Notlar

- Vercel'de environment variables production, preview ve development için ayrı ayrı ayarlanabilir
- MongoDB Atlas'ta `0.0.0.0/0` ayarı production için güvenli değildir, ancak development için kullanılabilir
- Production için MongoDB Atlas'ta sadece Vercel'in IP range'lerini eklemek daha güvenlidir (ancak Vercel'in IP'leri dinamik olduğu için `0.0.0.0/0` kullanmak pratik bir çözümdür)


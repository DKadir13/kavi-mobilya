# 🚀 Vercel Deployment - Adım Adım Rehber

## 📋 ÖN HAZIRLIK

### Adım 1: Projeyi GitHub'a Push Edin

```bash
# 1. Git durumunu kontrol edin
git status

# 2. Tüm değişiklikleri ekleyin
git add .

# 3. Commit yapın
git commit -m "Vercel deployment hazır"

# 4. GitHub'a push edin
git push origin main
```

**Not:** Eğer GitHub repository'niz yoksa:
```bash
# GitHub'da yeni repository oluşturun, sonra:
git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADI.git
git branch -M main
git push -u origin main
```

---

## 🔐 ADIM 2: MongoDB Atlas IP Whitelist Ayarları

### 2.1 MongoDB Atlas'a Giriş
1. Tarayıcınızda https://cloud.mongodb.com adresine gidin
2. MongoDB Atlas hesabınıza giriş yapın

### 2.2 Network Access Ayarları
1. Sol menüden **"Network Access"** (veya **"Security" > "Network Access"**) seçeneğine tıklayın
2. **"Add IP Address"** butonuna tıklayın
3. Açılan pencerede:
   - **"Allow Access from Anywhere"** butonuna tıklayın
   - IP adresi otomatik olarak `0.0.0.0/0` olarak ayarlanacak
   - **"Confirm"** butonuna tıklayın
4. 1-2 dakika bekleyin (durum "Active" olana kadar)

**✅ Kontrol:** Network Access listesinde `0.0.0.0/0` görünmeli ve durumu "Active" olmalı

---

## 🌐 ADIM 3: Vercel Hesabı ve Proje Oluşturma

### 3.1 Vercel Hesabı Oluşturma
1. Tarayıcınızda https://vercel.com adresine gidin
2. **"Sign Up"** butonuna tıklayın
3. GitHub hesabınızla giriş yapın (önerilir)

### 3.2 Yeni Proje Oluşturma
1. Vercel Dashboard'da **"Add New..."** butonuna tıklayın
2. **"Project"** seçeneğini seçin
3. GitHub repository'nizi seçin (eğer görünmüyorsa "Import Git Repository" ile ekleyin)
4. **"Import"** butonuna tıklayın

---

## ⚙️ ADIM 4: Vercel Proje Ayarları

### 4.1 Framework Preset
- **Framework Preset:** Next.js (otomatik algılanır)
- **Root Directory:** `./` (varsayılan)
- **Build Command:** `npm run build` (varsayılan)
- **Output Directory:** `.next` (varsayılan)
- **Install Command:** `npm install` (varsayılan)

### 4.2 Environment Variables Ekleme
1. **"Environment Variables"** bölümüne gidin
2. **"Add New"** butonuna tıklayın
3. Şu bilgileri girin:
   - **Name:** `MONGODB_URI`
   - **Value:** `mongodb+srv://kavihomemobilya_db_user:Vy4tGlPZgjkGPFth@cluster0.rpfuter.mongodb.net/kavi_mobilya?retryWrites=true&w=majority&appName=Cluster0`
   - **Environment:** 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
     - (Hepsini seçin)
4. **"Save"** butonuna tıklayın

**✅ Kontrol:** Environment Variables listesinde `MONGODB_URI` görünmeli

---

## 🚀 ADIM 5: Deployment

### 5.1 İlk Deployment
1. Tüm ayarları kontrol edin
2. **"Deploy"** butonuna tıklayın
3. Build işlemi başlayacak (2-5 dakika sürebilir)

### 5.2 Build Loglarını İzleme
- Build sırasında logları görebilirsiniz
- Hata olursa logları kontrol edin
- Başarılı olursa "Ready" mesajı görünecek

---

## ✅ ADIM 6: Deployment Sonrası Kontroller

### 6.1 Siteyi Test Edin
1. Deployment tamamlandıktan sonra Vercel size bir URL verecek (örn: `proje-adiniz.vercel.app`)
2. Bu URL'yi tarayıcıda açın
3. Site açılıyor mu kontrol edin

### 6.2 API Route'larını Test Edin
Tarayıcıda şu URL'leri test edin:
- `https://proje-adiniz.vercel.app/api/categories`
- `https://proje-adiniz.vercel.app/api/products`

**Beklenen Sonuç:** JSON verisi görmelisiniz (boş array `[]` bile olsa sorun değil)

### 6.3 Admin Paneli Test Edin
1. `https://proje-adiniz.vercel.app/admin` adresine gidin
2. Giriş yapmayı deneyin
3. Dashboard'a erişebiliyor musunuz kontrol edin

---

## 🔧 ADIM 7: Sorun Giderme

### Sorun: MongoDB Bağlantı Hatası
**Çözüm:**
1. MongoDB Atlas → Network Access → `0.0.0.0/0` olduğundan emin olun
2. Vercel → Settings → Environment Variables → `MONGODB_URI` doğru mu kontrol edin
3. Vercel → Deployments → [Latest] → Functions → Logs'u kontrol edin

### Sorun: Build Hatası
**Çözüm:**
1. Vercel → Deployments → [Failed] → Build Logs'u kontrol edin
2. `package.json` dosyasında tüm dependencies'in olduğundan emin olun
3. Local'de `npm run build` komutunu çalıştırıp hata var mı kontrol edin

### Sorun: Environment Variables Çalışmıyor
**Çözüm:**
1. Vercel → Settings → Environment Variables → Değişkenin tüm environment'larda olduğundan emin olun
2. Yeni bir deployment yapın (Environment Variables değişiklikleri için gerekli)

---

## 📝 ADIM 8: Custom Domain (Opsiyonel)

### 8.1 Domain Ekleme
1. Vercel → Settings → Domains
2. Domain'inizi girin
3. DNS ayarlarını yapın (Vercel size talimat verecek)

---

## 🎉 TAMAMLANDI!

Artık projeniz Vercel'de canlı! 

### Önemli Linkler:
- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com
- **GitHub Repository:** https://github.com/KULLANICI_ADINIZ/REPO_ADI

### Sonraki Adımlar:
- ✅ Her `git push` sonrası otomatik deployment yapılacak
- ✅ Preview deployments için PR'lar otomatik deploy edilecek
- ✅ Production deployment için `main` branch'e push yapın

---

## 📞 Yardım Gerekiyorsa

1. Vercel Logs: Vercel Dashboard → Deployments → [Latest] → Functions
2. MongoDB Atlas Logs: MongoDB Atlas → Monitoring → Logs
3. GitHub Actions: GitHub → Repository → Actions (eğer kullanıyorsanız)


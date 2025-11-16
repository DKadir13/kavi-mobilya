# MongoDB Atlas IP Whitelist Kurulumu

## Sorun
API route'larında 500 hatası alıyorsunuz çünkü IP adresiniz MongoDB Atlas cluster'ında whitelist'te değil.

## Çözüm

### Adım 1: MongoDB Atlas'a Giriş Yapın
1. https://cloud.mongodb.com adresine gidin
2. Hesabınıza giriş yapın

### Adım 2: Network Access (IP Whitelist) Ayarları
1. Sol menüden **"Network Access"** veya **"Security" > "Network Access"** seçeneğine tıklayın
2. **"Add IP Address"** butonuna tıklayın

### Adım 3: IP Adresinizi Ekleyin
**Seçenek 1: Tüm IP'lere İzin Ver (Development için)**
- **"Allow Access from Anywhere"** seçeneğini seçin
- IP adresi: `0.0.0.0/0`
- **"Confirm"** butonuna tıklayın

**Seçenek 2: Sadece Mevcut IP'nizi Ekleyin (Production için önerilir)**
- **"Add Current IP Address"** butonuna tıklayın
- Otomatik olarak IP adresiniz eklenecek
- **"Confirm"** butonuna tıklayın

### Adım 4: Değişikliklerin Aktif Olmasını Bekleyin
- IP whitelist değişiklikleri genellikle 1-2 dakika içinde aktif olur
- Durum "Active" olana kadar bekleyin

### Adım 5: Uygulamayı Test Edin
1. Next.js sunucusunu yeniden başlatın: `npm run dev`
2. Tarayıcıda sayfayı yenileyin
3. API route'ları artık çalışmalı

## Notlar
- Development ortamı için `0.0.0.0/0` kullanabilirsiniz (tüm IP'lere izin verir)
- Production ortamı için sadece belirli IP adreslerini eklemeniz önerilir
- IP adresiniz değişirse (örneğin farklı bir WiFi ağına bağlanırsanız), yeni IP'yi de eklemeniz gerekebilir

## Hata Mesajı
Eğer hala hata alıyorsanız, terminal'de şu mesajı göreceksiniz:
```
Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

Bu durumda yukarıdaki adımları tekrar kontrol edin.


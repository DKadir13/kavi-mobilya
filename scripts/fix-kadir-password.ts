import connectDB from '../lib/mongodb';
import AdminUser from '../models/AdminUser';
import bcrypt from 'bcryptjs';

async function fixPassword() {
  try {
    console.log('MongoDB bağlantısı kuruluyor...');
    await connectDB();
    console.log('MongoDB bağlantısı başarılı!');

    const user = await AdminUser.findOne({ email: 'kadir' });
    if (!user) {
      console.log('❌ Kadir kullanıcısı bulunamadı!');
      process.exit(1);
    }

    console.log('Kullanıcı bulundu:', user.email);
    
    // Mevcut şifreyi kontrol et
    const oldMatch = await bcrypt.compare('Kadir.3327', user.password);
    console.log('Mevcut şifre kontrolü:', oldMatch ? '✅ Eşleşiyor' : '❌ Eşleşmiyor');

    if (!oldMatch) {
      // Şifreyi düz metin olarak set et (pre-save hook hash'leyecek)
      console.log('Şifre yeniden hashleniyor...');
      user.password = 'Kadir.3327';
      await user.save();
      
      // Yeni şifreyi kontrol et
      const updatedUser = await AdminUser.findOne({ email: 'kadir' });
      const newMatch = await bcrypt.compare('Kadir.3327', updatedUser!.password);
      console.log('Yeni şifre kontrolü:', newMatch ? '✅ Başarılı!' : '❌ Hata!');
      
      if (newMatch) {
        console.log('\n✅ Şifre başarıyla güncellendi!');
      } else {
        console.log('\n❌ Şifre güncelleme başarısız!');
      }
    } else {
      console.log('\n✅ Şifre zaten doğru!');
    }

    console.log('\n🔐 Giriş Bilgileri:');
    console.log('  Email: kadir');
    console.log('  Şifre: Kadir.3327');

    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

fixPassword();


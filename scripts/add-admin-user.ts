import connectDB from '../lib/mongodb';
import AdminUser from '../models/AdminUser';
import bcrypt from 'bcryptjs';

async function addAdminUser() {
  try {
    console.log('MongoDB bağlantısı kuruluyor...');
    await connectDB();
    console.log('MongoDB bağlantısı başarılı!');

    // Mevcut kullanıcıyı kontrol et
    const existingUser = await AdminUser.findOne({ email: 'kadir' });
    if (existingUser) {
      console.log('⚠️  Kadir kullanıcısı zaten mevcut. Güncelleniyor...');
      // Şifreyi güncelle
      const hashedPassword = await bcrypt.hash('Kadir.3327', 10);
      existingUser.password = hashedPassword;
      existingUser.full_name = 'Kadir Admin';
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('✅ Kadir kullanıcısı güncellendi!');
    } else {
      // Yeni kullanıcı oluştur
      const hashedPassword = await bcrypt.hash('Kadir.3327', 10);
      const adminUser = await AdminUser.create({
        email: 'kadir',
        password: hashedPassword,
        full_name: 'Kadir Admin',
        role: 'admin',
      });
      console.log(`✅ Admin kullanıcı eklendi: ${adminUser.email}`);
    }

    console.log('\n🔐 Admin Giriş Bilgileri:');
    console.log('  Email: kadir');
    console.log('  Şifre: Kadir.3327');

    process.exit(0);
  } catch (error) {
    console.error('Kullanıcı ekleme işlemi sırasında hata:', error);
    process.exit(1);
  }
}

addAdminUser();


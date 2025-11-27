import connectDB from '../lib/mongodb';
import Category from '../models/Category';
import Product from '../models/Product';
import AdminUser from '../models/AdminUser';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    console.log('MongoDB bağlantısı kuruluyor...');
    await connectDB();
    console.log('MongoDB bağlantısı başarılı!');

    // Test verilerini temizle
    console.log('Test verileri temizleniyor...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Test verileri temizlendi!');

    // Admin kullanıcıları ekle
    console.log('Admin kullanıcıları ekleniyor...');
    
    // Mevcut admin kullanıcıları temizle
    await AdminUser.deleteMany({});
    
    // İlk admin kullanıcı: nyc0606 / 1170nyc.
    const hashedPassword1 = await bcrypt.hash('1170nyc.', 10);
    const adminUser1 = await AdminUser.create({
      email: 'nyc0606',
      password: hashedPassword1,
      full_name: 'NYC Admin',
      role: 'admin',
    });
    console.log(`Admin kullanıcı eklendi: ${adminUser1.email}`);

    // İkinci admin kullanıcı: ibo123 / 1453ibo.
    const hashedPassword2 = await bcrypt.hash('1453ibo.', 10);
    const adminUser2 = await AdminUser.create({
      email: 'ibo123',
      password: hashedPassword2,
      full_name: 'IBO Admin',
      role: 'admin',
    });
    console.log(`Admin kullanıcı eklendi: ${adminUser2.email}`);

    console.log('\n✅ Veritabanı seed işlemi tamamlandı!');
    console.log('\n📊 Özet:');
    console.log('- Test verileri temizlendi');
    console.log('- 2 admin kullanıcı eklendi');
    console.log('\n🔐 Admin Giriş Bilgileri:');
    console.log('Kullanıcı 1:');
    console.log('  Email: nyc0606');
    console.log('  Şifre: 1170nyc.');
    console.log('\nKullanıcı 2:');
    console.log('  Email: ibo123');
    console.log('  Şifre: 1453ibo.');

    process.exit(0);
  } catch (error) {
    console.error('Seed işlemi sırasında hata:', error);
    process.exit(1);
  }
}

seedDatabase();


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

    // Kategorileri temizle ve ekle
    console.log('Kategoriler ekleniyor...');
    await Category.deleteMany({});
    const categories = await Category.insertMany([
      {
        name: 'Yatak Odası',
        slug: 'yatak-odasi',
        description: 'Modern ve klasik yatak odası takımları',
        order_index: 1,
      },
      {
        name: 'Yemek Odası',
        slug: 'yemek-odasi',
        description: 'Şık yemek odası takımları',
        order_index: 2,
      },
      {
        name: 'Oturma Grubu',
        slug: 'oturma-grubu',
        description: 'Konforlu koltuk ve oturma grupları',
        order_index: 3,
      },
      {
        name: 'Genç Odası',
        slug: 'genc-odasi',
        description: 'Genç odası mobilyaları',
        order_index: 4,
      },
      {
        name: 'Çocuk Odası',
        slug: 'cocuk-odasi',
        description: 'Çocuk odası mobilyaları',
        order_index: 5,
      },
      {
        name: 'Mutfak',
        slug: 'mutfak',
        description: 'Mutfak dolabı ve mobilyaları',
        order_index: 6,
      },
      {
        name: 'TV Ünitesi',
        slug: 'tv-unitesi',
        description: 'Modern TV üniteleri',
        order_index: 7,
      },
      {
        name: 'Çalışma Masası',
        slug: 'calisma-masasi',
        description: 'Ofis ve ev çalışma masaları',
        order_index: 8,
      },
    ]);
    console.log(`${categories.length} kategori eklendi!`);

    // Ürünleri temizle ve ekle
    console.log('Ürünler ekleniyor...');
    await Product.deleteMany({});

    const yatakOdasi = categories.find((c: any) => c.slug === 'yatak-odasi');
    const yemekOdasi = categories.find((c: any) => c.slug === 'yemek-odasi');
    const oturmaGrubu = categories.find((c: any) => c.slug === 'oturma-grubu');
    const tvUnitesi = categories.find((c: any) => c.slug === 'tv-unitesi');

    const products = await Product.insertMany([
      // Kavi Home Ürünleri
      {
        name: 'Modern Yatak Odası Takımı',
        description: 'Şık ve modern tasarımlı yatak odası takımı. Yatak, komodin ve gardırop dahil.',
        price: 12500,
        image_url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
        store_type: 'home',
        category_id: yatakOdasi?._id.toString(),
        is_featured: true,
        featured_order: 1,
        is_active: true,
        stock_status: 'in_stock',
      },
      {
        name: 'Klasik Yemek Odası Takımı',
        description: 'Klasik ve şık yemek odası takımı. 6 kişilik masa ve sandalye seti.',
        price: 18900,
        image_url: 'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=800',
        store_type: 'home',
        category_id: yemekOdasi?._id.toString(),
        is_featured: true,
        featured_order: 2,
        is_active: true,
        stock_status: 'in_stock',
      },
      {
        name: 'Rahat Koltuk Takımı',
        description: 'Konforlu ve modern koltuk takımı. 3+2+1 oturma grubu.',
        price: 15900,
        image_url: 'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=800',
        store_type: 'home',
        category_id: oturmaGrubu?._id.toString(),
        is_featured: true,
        featured_order: 3,
        is_active: true,
        stock_status: 'in_stock',
      },
      {
        name: 'Modern TV Ünitesi',
        description: 'Şık ve modern TV ünitesi. Geniş depolama alanı.',
        price: 4500,
        image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
        store_type: 'home',
        category_id: tvUnitesi?._id.toString(),
        is_featured: false,
        is_active: true,
        stock_status: 'in_stock',
      },
      {
        name: 'Genç Odası Takımı',
        description: 'Modern ve fonksiyonel genç odası takımı.',
        price: 9800,
        image_url: 'https://images.pexels.com/photos/1648771/pexels-photo-1648771.jpeg?auto=compress&cs=tinysrgb&w=800',
        store_type: 'home',
        category_id: categories.find((c: any) => c.slug === 'genc-odasi')?._id.toString(),
        is_featured: false,
        is_active: true,
        stock_status: 'in_stock',
      },
      {
        name: 'Çocuk Odası Takımı',
        description: 'Renkli ve eğlenceli çocuk odası takımı.',
        price: 7500,
        image_url: 'https://images.pexels.com/photos/1337371/pexels-photo-1337371.jpeg?auto=compress&cs=tinysrgb&w=800',
        store_type: 'home',
        category_id: categories.find((c: any) => c.slug === 'cocuk-odasi')?._id.toString(),
        is_featured: false,
        is_active: true,
        stock_status: 'in_stock',
      },
      // Kavi Premium Ürünleri
      {
        name: 'Lüks Yatak Odası Takımı',
        description: 'Premium kalitede lüks yatak odası takımı. El işçiliği detaylar.',
        price: 35000,
        image_url: 'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=800',
        store_type: 'premium',
        category_id: yatakOdasi?._id.toString(),
        is_featured: true,
        featured_order: 4,
        is_active: true,
        stock_status: 'in_stock',
      },
      {
        name: 'Premium Yemek Odası Takımı',
        description: 'Lüks ve özel tasarım yemek odası takımı. 8 kişilik.',
        price: 45000,
        image_url: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800',
        store_type: 'premium',
        category_id: yemekOdasi?._id.toString(),
        is_featured: true,
        featured_order: 5,
        is_active: true,
        stock_status: 'in_stock',
      },
      {
        name: 'Tasarım Koltuk Takımı',
        description: 'Özel tasarım premium koltuk takımı. İtalyan deri.',
        price: 42000,
        image_url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
        store_type: 'premium',
        category_id: oturmaGrubu?._id.toString(),
        is_featured: true,
        featured_order: 6,
        is_active: true,
        stock_status: 'in_stock',
      },
      {
        name: 'Lüks TV Ünitesi',
        description: 'Premium kalitede lüks TV ünitesi. Cam ve ahşap kombinasyonu.',
        price: 12000,
        image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
        store_type: 'premium',
        category_id: tvUnitesi?._id.toString(),
        is_featured: false,
        is_active: true,
        stock_status: 'in_stock',
      },
      {
        name: 'Premium Çalışma Masası',
        description: 'Lüks ve fonksiyonel çalışma masası seti.',
        price: 8500,
        image_url: 'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=800',
        store_type: 'premium',
        category_id: categories.find((c: any) => c.slug === 'calisma-masasi')?._id.toString(),
        is_featured: false,
        is_active: true,
        stock_status: 'in_stock',
      },
      {
        name: 'Mutfak Dolabı Seti',
        description: 'Modern ve fonksiyonel mutfak dolabı seti.',
        price: 18500,
        image_url: 'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=800',
        store_type: 'home',
        category_id: categories.find((c: any) => c.slug === 'mutfak')?._id.toString(),
        is_featured: false,
        is_active: true,
        stock_status: 'in_stock',
      },
    ]);
    console.log(`${products.length} ürün eklendi!`);

    // Admin kullanıcı ekle
    console.log('Admin kullanıcı ekleniyor...');
    await AdminUser.deleteMany({ email: 'admin@kavimobilya.com' });
    const hashedPassword = await bcrypt.hash('KaviMobilya2024!', 10);
    const adminUser = await AdminUser.create({
      email: 'admin@kavimobilya.com',
      password: hashedPassword,
      full_name: 'Admin Kullanıcı',
      role: 'admin',
    });
    console.log(`Admin kullanıcı eklendi: ${adminUser.email}`);

    console.log('\n✅ Veritabanı seed işlemi tamamlandı!');
    console.log('\n📊 Özet:');
    console.log(`- ${categories.length} kategori`);
    console.log(`- ${products.length} ürün`);
    console.log(`- 1 admin kullanıcı`);
    console.log('\n🔐 Admin Giriş Bilgileri:');
    console.log('Email: admin@kavimobilya.com');
    console.log('Şifre: KaviMobilya2024!');

    process.exit(0);
  } catch (error) {
    console.error('Seed işlemi sırasında hata:', error);
    process.exit(1);
  }
}

seedDatabase();


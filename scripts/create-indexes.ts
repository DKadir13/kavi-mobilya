/**
 * MongoDB Index Oluşturma Script'i
 * 
 * Bu script, MongoDB'de performans için gerekli index'leri oluşturur.
 * Memory limit sorunlarını önlemek için kritik index'ler.
 * 
 * Çalıştırma:
 * npx tsx scripts/create-indexes.ts
 */

import mongoose from 'mongoose';
import connectDB from '../lib/mongodb';
import Product from '../models/Product';
import Sale from '../models/Sale';
import Category from '../models/Category';

async function createIndexes() {
  try {
    console.log('MongoDB bağlantısı kuruluyor...');
    await connectDB();
    
    console.log('Index\'ler oluşturuluyor...\n');

    // Product Indexes
    console.log('Product index\'leri oluşturuluyor...');
    try {
      await Product.collection.createIndex({ created_at: -1 });
      console.log('✅ Product.created_at index oluşturuldu');
    } catch (error: any) {
      if (error.code === 85) {
        console.log('ℹ️  Product.created_at index zaten mevcut');
      } else {
        console.error('❌ Product.created_at index hatası:', error.message);
      }
    }

    try {
      await Product.collection.createIndex({ category_id: 1 });
      console.log('✅ Product.category_id index oluşturuldu');
    } catch (error: any) {
      if (error.code === 85) {
        console.log('ℹ️  Product.category_id index zaten mevcut');
      } else {
        console.error('❌ Product.category_id index hatası:', error.message);
      }
    }

    try {
      await Product.collection.createIndex({ store_type: 1 });
      console.log('✅ Product.store_type index oluşturuldu');
    } catch (error: any) {
      if (error.code === 85) {
        console.log('ℹ️  Product.store_type index zaten mevcut');
      } else {
        console.error('❌ Product.store_type index hatası:', error.message);
      }
    }

    try {
      await Product.collection.createIndex({ is_active: 1 });
      console.log('✅ Product.is_active index oluşturuldu');
    } catch (error: any) {
      if (error.code === 85) {
        console.log('ℹ️  Product.is_active index zaten mevcut');
      } else {
        console.error('❌ Product.is_active index hatası:', error.message);
      }
    }

    try {
      await Product.collection.createIndex({ is_featured: 1, featured_order: 1 });
      console.log('✅ Product.is_featured + featured_order index oluşturuldu');
    } catch (error: any) {
      if (error.code === 85) {
        console.log('ℹ️  Product.is_featured + featured_order index zaten mevcut');
      } else {
        console.error('❌ Product.is_featured + featured_order index hatası:', error.message);
      }
    }

    // Sale Indexes
    console.log('\nSale index\'leri oluşturuluyor...');
    try {
      await Sale.collection.createIndex({ created_at: -1 });
      console.log('✅ Sale.created_at index oluşturuldu');
    } catch (error: any) {
      if (error.code === 85) {
        console.log('ℹ️  Sale.created_at index zaten mevcut');
      } else {
        console.error('❌ Sale.created_at index hatası:', error.message);
      }
    }

    try {
      await Sale.collection.createIndex({ product_id: 1 });
      console.log('✅ Sale.product_id index oluşturuldu');
    } catch (error: any) {
      if (error.code === 85) {
        console.log('ℹ️  Sale.product_id index zaten mevcut');
      } else {
        console.error('❌ Sale.product_id index hatası:', error.message);
      }
    }

    try {
      await Sale.collection.createIndex({ sale_date: 1 });
      console.log('✅ Sale.sale_date index oluşturuldu');
    } catch (error: any) {
      if (error.code === 85) {
        console.log('ℹ️  Sale.sale_date index zaten mevcut');
      } else {
        console.error('❌ Sale.sale_date index hatası:', error.message);
      }
    }

    // Category Indexes
    console.log('\nCategory index\'leri oluşturuluyor...');
    try {
      await Category.collection.createIndex({ order_index: 1 });
      console.log('✅ Category.order_index index oluşturuldu');
    } catch (error: any) {
      if (error.code === 85) {
        console.log('ℹ️  Category.order_index index zaten mevcut');
      } else {
        console.error('❌ Category.order_index index hatası:', error.message);
      }
    }

    try {
      await Category.collection.createIndex({ slug: 1 }, { unique: true });
      console.log('✅ Category.slug unique index oluşturuldu');
    } catch (error: any) {
      if (error.code === 85) {
        console.log('ℹ️  Category.slug unique index zaten mevcut');
      } else {
        console.error('❌ Category.slug unique index hatası:', error.message);
      }
    }

    console.log('\n✅ Tüm index\'ler başarıyla oluşturuldu!');
    console.log('\n📝 Not: Index\'ler otomatik olarak oluşturuldu. MongoDB Atlas\'ta da kontrol edebilirsiniz.');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Index oluşturma hatası:', error);
    process.exit(1);
  }
}

createIndexes();


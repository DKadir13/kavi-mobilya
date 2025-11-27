import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();
    // Optimize: Sadece gerekli alanları seç, limit ekle
    // allowDiskUse: true - Büyük sort işlemleri için disk kullanımına izin ver
    // Aggregation pipeline kullanarak allowDiskUse desteği
    const categories = await Category.aggregate([
      { $sort: { order_index: 1 } },
      { $limit: 100 }, // Maksimum 100 kategori (admin panel için yeterli)
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          description: 1,
          image_url: 1,
          order_index: 1,
        }
      }
    ], { allowDiskUse: true });
    
    const response = NextResponse.json(categories);
    
    // Cache categories for 10 minutes (they change rarely)
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    
    return response;
  } catch (error: any) {
    console.error('Categories API Error:', error);
    
    // Check if it's a MongoDB connection error
    const errorMessage = error.message || 'Kategoriler yüklenirken bir hata oluştu';
    if (errorMessage.includes('Invalid scheme') || errorMessage.includes('mongodb://')) {
      return NextResponse.json(
        { 
          error: 'MongoDB bağlantı yapılandırması hatalı. Lütfen MONGODB_URI environment variable\'ını kontrol edin.',
        }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validasyon
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Kategori adı zorunludur' },
        { status: 400 }
      );
    }

    if (!body.slug || !body.slug.trim()) {
      return NextResponse.json(
        { error: 'Slug zorunludur' },
        { status: 400 }
      );
    }

    // Slug unique kontrolü
    const existingCategory = await Category.findOne({ slug: body.slug.trim() });
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor. Lütfen farklı bir slug kullanın.' },
        { status: 400 }
      );
    }

    // Kategori verilerini hazırla
    const categoryData = {
      name: body.name.trim(),
      slug: body.slug.trim(),
      description: body.description?.trim() || null,
      image_url: body.image_url?.trim() || null,
      order_index: body.order_index !== undefined ? parseInt(body.order_index) : 0,
    };

    const category = await Category.create(categoryData);
    
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Categories POST API Error:', error);
    
    // MongoDB duplicate key hatası
    if (error.code === 11000 || error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor. Lütfen farklı bir slug kullanın.' },
        { status: 400 }
      );
    }

    // Validation hatası
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      return NextResponse.json(
        { 
          error: 'Kategori bilgileri geçersiz',
          details: validationErrors
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Kategori oluşturulurken bir hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}


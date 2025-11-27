import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get('category_id');
    const store_type = searchParams.get('store_type');
    const is_featured = searchParams.get('is_featured');
    const is_active = searchParams.get('is_active');

    let query: any = {};

    if (category_id) query.category_id = category_id;
    if (store_type) query.store_type = store_type;
    if (is_featured === 'true') query.is_featured = true;
    if (is_active === 'true') query.is_active = true;
    if (is_active === 'false') query.is_active = false;

    // Only select necessary fields for better performance
    // Optimize: Sadece gerekli alanları seç, limit ekle
    // allowDiskUse: true - Büyük sort işlemleri için disk kullanımına izin ver
    // Aggregation pipeline kullanarak allowDiskUse desteği
    // Not: Limit'i 500'e düşürdük (memory limit sorununu önlemek için)
    // sub_items'ı sadece admin panel için yükle (is_active parametresi varsa)
    const includeSubItems = is_active !== undefined || is_featured !== undefined;
    const products: any[] = await Product.aggregate([
      { $match: query },
      { $sort: { created_at: -1 } },
      { $limit: 500 }, // Maksimum 500 ürün (admin panel için yeterli, memory limit sorununu önler)
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image_url: 1,
          images: 1,
          store_type: 1,
          category_id: 1,
          is_featured: 1,
          is_active: 1,
          featured_order: 1,
          ...(includeSubItems ? { sub_items: 1 } : {}), // Sadece admin panel için sub_items
          created_at: 1,
        }
      }
    ], { allowDiskUse: true });
    
    // Get all unique category IDs
    const categoryIds = Array.from(
      new Set(
        products
          .map((p: any) => p.category_id)
          .filter((id): id is string => !!id)
      )
    );

    // Fetch all categories in one query (only needed fields)
    const categories: any[] = await Category.find({
      _id: { $in: categoryIds },
    })
      .select('_id name slug')
      .lean();

    // Create category map for O(1) lookup
    const categoryMap = new Map(
      categories.map((cat) => [cat._id.toString(), cat])
    );

    // Populate category efficiently
    const productsWithCategories = products.map((product: any) => {
      const productObj: any = { ...product };
      if (product.category_id) {
        const category: any = categoryMap.get(product.category_id.toString());
        if (category) {
          productObj.category_id = {
            _id: category._id,
            name: category.name,
            slug: category.slug,
          };
        }
      }
      return productObj;
    });

    const response = NextResponse.json(productsWithCategories);
    
    // Cache for 5 minutes (public) or no cache (admin panel)
    if (is_active !== undefined || is_featured !== undefined) {
      // Admin panel için cache yok
      response.headers.set('Cache-Control', 'no-store, must-revalidate');
    } else {
      // Public için cache
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    }
    
    return response;
  } catch (error: any) {
    console.error('Products API Error:', error);
    
    // Check if it's a MongoDB connection error
    const errorMessage = error.message || 'Ürünler yüklenirken bir hata oluştu';
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
    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Ürünler yüklenirken bir hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}


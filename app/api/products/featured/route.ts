import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET() {
  try {
    // Validate MongoDB URI before connecting
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri || (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://'))) {
      console.error('Invalid MongoDB URI format');
      return NextResponse.json(
        { 
          error: 'MongoDB bağlantı yapılandırması hatalı. Lütfen MONGODB_URI environment variable\'ını kontrol edin.',
        }, 
        { status: 500 }
      );
    }

    await connectDB();
    const products: any[] = await Product.find({ is_featured: true, is_active: true })
      .select('name image_url store_type price category_id featured_order')
      .sort({ featured_order: 1 })
      .limit(6)
      .lean();
    
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
      categories.map((cat: any) => [cat._id.toString(), cat])
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
    
    // Cache for 5 minutes (featured products change less frequently)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error: any) {
    console.error('Featured Products API Error:', error);
    
    // Check if it's a MongoDB connection error
    const errorMessage = error.message || 'Öne çıkan ürünler yüklenirken bir hata oluştu';
    if (errorMessage.includes('Invalid scheme') || errorMessage.includes('mongodb://')) {
      return NextResponse.json(
        { 
          error: 'MongoDB bağlantı yapılandırması hatalı. Lütfen MONGODB_URI environment variable\'ını kontrol edin.',
        }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


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
    const forAdmin = searchParams.get('admin') === '1' || searchParams.get('forAdmin') === '1';
    const includeSubItemsFull =
      forAdmin ||
      searchParams.get('include_sub_items') === 'true' ||
      searchParams.get('include_sub_items') === '1';
    const includeSubItemsMinimal =
      searchParams.get('include_sub_items_minimal') === 'true' ||
      searchParams.get('include_sub_items_minimal') === '1';

    const query: Record<string, unknown> = {};
    if (category_id) query.category_id = category_id;
    if (store_type) query.store_type = store_type;
    if (is_featured === 'true') query.is_featured = true;
    if (is_active === 'true') query.is_active = true;
    if (is_active === 'false') query.is_active = false;

    // Public ürün listesi için sadece gerekli alanlar dönsün.
    // - Full nested sub_items: sadece admin veya include_sub_items=true
    // - Minimal sub_items: sadece include_sub_items_minimal=true (cart için yeterli, nested olmayan)
    const selectFields =
      '_id name description price image_url images store_type category_id' +
      (forAdmin || includeSubItemsFull
        ? ' is_featured is_active featured_order created_at'
        : '') +
      (includeSubItemsFull
        ? ' sub_items'
        : includeSubItemsMinimal
          ? ' sub_items.product_id sub_items.name sub_items.price sub_items.image_url sub_items.quantity sub_items.is_optional'
          : '');

    const products: any[] = await Product.find(query)
      .sort({ created_at: -1 })
      .limit(500)
      .select(selectFields)
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
    
    // Cache: sadece full nested sub_items (veya admin) için kapat; minimal/public için cache açık.
    if (forAdmin || includeSubItemsFull) {
      response.headers.set('Cache-Control', 'no-store, must-revalidate');
    } else {
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    }
    
    return response;
  } catch (error: any) {
    console.error('Products API Error:', error);
    
    // Check if it's a MongoDB connection error
    const errorMessage = error.message || 'Ürünler yüklenirken bir hata oluştu';
    const isMongoConfigError =
      errorMessage.includes('MONGODB_URI') ||
      errorMessage.includes('MongoDB URI must start');
    if (isMongoConfigError) {
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


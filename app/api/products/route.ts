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
    const products = await Product.find(query)
      .select('name description price image_url images store_type category_id is_featured is_active featured_order created_at')
      .sort({ created_at: -1 })
      .lean();
    
    // Get all unique category IDs
    const categoryIds = Array.from(
      new Set(
        products
          .map((p) => p.category_id)
          .filter((id): id is string => !!id)
      )
    );

    // Fetch all categories in one query (only needed fields)
    const categories = await Category.find({
      _id: { $in: categoryIds },
    })
      .select('_id name slug')
      .lean();

    // Create category map for O(1) lookup
    const categoryMap = new Map(
      categories.map((cat) => [cat._id.toString(), cat])
    );

    // Populate category efficiently
    const productsWithCategories = products.map((product) => {
      const productObj: any = { ...product };
      if (product.category_id) {
        const category = categoryMap.get(product.category_id.toString());
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
    
    // Cache for 60 seconds
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return response;
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


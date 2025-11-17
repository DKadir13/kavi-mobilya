import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const product: any = await Product.findById(params.id)
      .select('name description price image_url images store_type category_id is_featured is_active featured_order created_at')
      .lean();
    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }
    
    const productObj: any = { ...product };
    if (product.category_id) {
      const category: any = await Category.findById(product.category_id)
        .select('name slug')
        .lean();
      if (category) {
        productObj.category_id = {
          _id: category._id,
          name: category.name,
          slug: category.slug,
        };
      }
    }
    
    const response = NextResponse.json(productObj);
    
    // Cache individual products for 5 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const product: any = await Product.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }
    
    const productObj: any = { ...product };
    if (product.category_id) {
      const category: any = await Category.findById(product.category_id).lean();
      if (category) {
        productObj.category_id = {
          _id: category._id,
          name: category.name,
          slug: category.slug,
        };
      }
    }
    
    return NextResponse.json(productObj);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const product = await Product.findByIdAndDelete(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Ürün silindi' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


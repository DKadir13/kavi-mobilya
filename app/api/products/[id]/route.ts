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
        .select('_id name slug')
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
    
    // Featured order güncellemesi için çakışma kontrolü
    if (body.featured_order !== undefined && body.is_featured === true) {
      // Aynı featured_order'a sahip başka bir ürün var mı kontrol et
      const existingProduct = await Product.findOne({
        _id: { $ne: params.id },
        is_featured: true,
        featured_order: body.featured_order,
      }).lean();
      
      if (existingProduct) {
        // Mevcut ürünün sırasını null yap
        await Product.findByIdAndUpdate(existingProduct._id, {
          featured_order: null,
        });
      }
    }
    
    // is_featured false yapılıyorsa featured_order'ı da null yap
    if (body.is_featured === false) {
      body.featured_order = null;
    }
    
    // Optimize: Önce category'yi al, sonra update yap
    const existingProduct: any = await Product.findById(params.id).lean();
    if (!existingProduct) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    const product: any = await Product.findByIdAndUpdate(
      params.id,
      { ...body, updated_at: new Date() },
      {
        new: true,
        runValidators: true,
      }
    ).select('name description price image_url images store_type category_id is_featured is_active featured_order created_at').lean();
    
    const productObj: any = { ...product };
    // Category bilgisini sadece değiştiyse veya yoksa al
    if (product.category_id) {
      const category: any = await Category.findById(product.category_id).select('_id name slug').lean();
      if (category) {
        productObj.category_id = {
          _id: category._id,
          name: category.name,
          slug: category.slug,
        };
      }
    }
    
    const response = NextResponse.json(productObj);
    // Admin panel için cache bypass
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json({ 
      error: error.message || 'Ürün güncellenirken bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
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
    
    const response = NextResponse.json({ message: 'Ürün silindi' });
    // Admin panel için cache bypass
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


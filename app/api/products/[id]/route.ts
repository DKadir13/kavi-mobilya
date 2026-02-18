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
    // sub_items'ı sadece gerektiğinde yükle (query parametresi ile kontrol)
    const { searchParams } = new URL(request.url);
    const includeSubItems = searchParams.get('include_sub_items') === 'true';
    
    const selectFields = 'name description price image_url images store_type category_id is_featured is_active featured_order created_at' + 
      (includeSubItems ? ' sub_items' : '');
    
    const product: any = await Product.findById(params.id)
      .select(selectFields)
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
    
    console.log('Product update request:', { id: params.id, body });
    
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
    
    // Sadece gönderilen alanları güncelle (undefined/null olmayan) - kısmi güncellemede category_id kaybolmasın
    const updateFields: Record<string, unknown> = { updated_at: new Date() };
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined && value !== null) {
        updateFields[key] = value;
      }
    }
    const product: any = await Product.findByIdAndUpdate(
      params.id,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
      }
    ).lean();
    
    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }
    
    console.log('Product updated successfully:', product._id);
    
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
    
    const response = NextResponse.json(productObj);
    
    // Cache'i invalidate et (featured products değişti)
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    
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
    return NextResponse.json({ message: 'Ürün silindi' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


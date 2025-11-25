import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Package from '@/models/Package';
import Product from '@/models/Product';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const packageData: any = await Package.findById(params.id).lean();
    
    if (!packageData) {
      return NextResponse.json({ error: 'Paket bulunamadı' }, { status: 404 });
    }

    // Ürün detaylarını getir
    const products: any[] = await Product.find({
      _id: { $in: packageData.product_ids || [] },
    })
      .select('_id name price image_url store_type category_id')
      .lean();

    const response = NextResponse.json({
      ...packageData,
      products,
      product_count: products.length,
    });

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

    // Eğer product_ids değiştirildiyse, ürünlerin aktif olduğunu kontrol et
    if (body.product_ids && Array.isArray(body.product_ids) && body.product_ids.length > 0) {
      const products = await Product.find({
        _id: { $in: body.product_ids },
        is_active: true,
      }).lean();

      if (products.length !== body.product_ids.length) {
        return NextResponse.json(
          { error: 'Seçilen ürünlerden bazıları aktif değil veya bulunamadı' },
          { status: 400 }
        );
      }

      // Fiyat güncelle
      if (!body.price) {
        const totalPrice = products.reduce((sum: number, p: any) => sum + (p.price || 0), 0);
        body.price = totalPrice;
      }

      // Store type güncelle
      if (!body.store_type) {
        const uniqueStoreTypes = [...new Set(products.map((p: any) => p.store_type))];
        body.store_type = uniqueStoreTypes.length === 1 ? uniqueStoreTypes[0] : 'both';
      }

      // Image güncelle (eğer verilmediyse)
      if (!body.image_url && products.length > 0) {
        body.image_url = products[0]?.image_url || null;
      }
    }

    const updatedPackage: any = await Package.findByIdAndUpdate(
      params.id,
      { ...body, updated_at: new Date() },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!updatedPackage) {
      return NextResponse.json({ error: 'Paket bulunamadı' }, { status: 404 });
    }

    const response = NextResponse.json(updatedPackage);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error: any) {
    console.error('Package update error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Paket güncellenirken bir hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const packageData = await Package.findByIdAndDelete(params.id);
    
    if (!packageData) {
      return NextResponse.json({ error: 'Paket bulunamadı' }, { status: 404 });
    }

    const response = NextResponse.json({ message: 'Paket silindi' });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


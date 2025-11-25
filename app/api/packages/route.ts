import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Package from '@/models/Package';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const store_type = searchParams.get('store_type');
    const is_active = searchParams.get('is_active');

    let query: any = {};

    if (store_type) {
      if (store_type === 'home' || store_type === 'premium') {
        query.$or = [
          { store_type: store_type },
          { store_type: 'both' }
        ];
      } else {
        query.store_type = store_type;
      }
    }
    
    if (is_active === 'true') query.is_active = true;
    if (is_active === 'false') query.is_active = false;

    const packages: any[] = await Package.find(query)
      .select('name description image_url price product_ids store_type is_active display_order created_at')
      .sort({ display_order: 1, created_at: -1 })
      .limit(100)
      .lean();

    // Ürün detaylarını getir
    const productIds = Array.from(
      new Set(
        packages
          .flatMap((pkg) => pkg.product_ids || [])
          .filter((id): id is string => !!id)
      )
    );

    const products: any[] = await Product.find({
      _id: { $in: productIds },
    })
      .select('_id name price image_url store_type category_id')
      .lean();

    const productMap = new Map(
      products.map((p) => [p._id.toString(), p])
    );

    // Paketlere ürün bilgilerini ekle
    const packagesWithProducts = packages.map((pkg) => {
      const packageProducts = (pkg.product_ids || [])
        .map((id: string) => productMap.get(id))
        .filter(Boolean);

      return {
        ...pkg,
        products: packageProducts,
        product_count: packageProducts.length,
      };
    });

    const response = NextResponse.json(packagesWithProducts);
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (error: any) {
    console.error('Packages API Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Paketler yüklenirken bir hata oluştu',
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
        { error: 'Paket adı zorunludur' },
        { status: 400 }
      );
    }

    if (!body.product_ids || !Array.isArray(body.product_ids) || body.product_ids.length === 0) {
      return NextResponse.json(
        { error: 'Pakete en az bir ürün eklemelisiniz' },
        { status: 400 }
      );
    }

    // Ürünlerin aktif olduğunu kontrol et
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

    // Fiyat hesapla (opsiyonel)
    let totalPrice = body.price;
    if (!totalPrice) {
      totalPrice = products.reduce((sum, p) => sum + (p.price || 0), 0);
    }

    // Store type belirle (eğer belirtilmediyse)
    let storeType = body.store_type || 'both';
    if (storeType === 'both' || !storeType) {
      const uniqueStoreTypes = [...new Set(products.map((p: any) => p.store_type))];
      if (uniqueStoreTypes.length === 1) {
        storeType = uniqueStoreTypes[0];
      } else {
        storeType = 'both';
      }
    }

    const packageData = {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      image_url: body.image_url?.trim() || products[0]?.image_url || null,
      price: totalPrice,
      product_ids: body.product_ids,
      store_type: storeType,
      is_active: body.is_active !== undefined ? body.is_active : true,
      display_order: body.display_order || 0,
    };

    const newPackage = await Package.create(packageData);

    const response = NextResponse.json(newPackage, { status: 201 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error: any) {
    console.error('Packages POST API Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Paket oluşturulurken bir hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}


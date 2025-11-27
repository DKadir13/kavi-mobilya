import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Package from '@/models/Package';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const store_type = searchParams.get('store_type');
    const is_featured = searchParams.get('is_featured');
    const is_active = searchParams.get('is_active');

    let query: any = {};

    if (store_type) query.store_type = store_type;
    if (is_featured === 'true') query.is_featured = true;
    if (is_active === 'true') query.is_active = true;
    if (is_active === 'false') query.is_active = false;

    // Aggregation pipeline kullanarak allowDiskUse desteği
    const packages: any[] = await Package.aggregate([
      { $match: query },
      { $sort: { created_at: -1 } },
      { $limit: 100 },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image_url: 1,
          product_ids: 1,
          store_type: 1,
          is_featured: 1,
          is_active: 1,
          created_at: 1,
        }
      }
    ], { allowDiskUse: true });

    // Paket içindeki ürünleri getir
    const allProductIds = Array.from(
      new Set(
        packages
          .flatMap((pkg: any) => pkg.product_ids || [])
          .filter((id): id is string => !!id)
      )
    );

    const products: any[] = await Product.find({
      _id: { $in: allProductIds },
    })
      .select('_id name image_url price store_type')
      .lean();

    const productMap = new Map(
      products.map((prod: any) => [prod._id.toString(), prod])
    );

    // Paketlere ürün bilgilerini ekle
    const packagesWithProducts = packages.map((pkg: any) => {
      const packageProducts = (pkg.product_ids || [])
        .map((id: string) => {
          const product = productMap.get(id);
          if (product) {
            return {
              _id: product._id,
              name: product.name,
              image_url: product.image_url,
              price: product.price,
              store_type: product.store_type,
            };
          }
          return null;
        })
        .filter((p: any) => p !== null);

      return {
        ...pkg,
        products: packageProducts,
      };
    });

    const response = NextResponse.json(packagesWithProducts);
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return response;
  } catch (error: any) {
    console.error('Packages API Error:', error);
    
    const errorMessage = error.message || 'Paketler yüklenirken bir hata oluştu';
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
        { error: 'Paket adı zorunludur' },
        { status: 400 }
      );
    }

    if (!body.product_ids || !Array.isArray(body.product_ids) || body.product_ids.length === 0) {
      return NextResponse.json(
        { error: 'Paket en az bir ürün içermelidir' },
        { status: 400 }
      );
    }

    if (!body.store_type) {
      return NextResponse.json(
        { error: 'Mağaza tipi zorunludur' },
        { status: 400 }
      );
    }

    const packageData = {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      price: body.price ? parseFloat(body.price) : null,
      image_url: body.image_url?.trim() || null,
      product_ids: body.product_ids,
      store_type: body.store_type,
      is_featured: body.is_featured || false,
      is_active: body.is_active !== undefined ? body.is_active : true,
    };

    const packageDoc = await Package.create(packageData);
    
    return NextResponse.json(packageDoc, { status: 201 });
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


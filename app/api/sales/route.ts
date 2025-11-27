import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    let query: any = {};

    if (month) {
      const startDate = new Date(month + '-01');
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      query.sale_date = { $gte: startDate, $lt: endDate };
    }

    // allowDiskUse: true - Büyük sort işlemleri için disk kullanımına izin ver
    // Aggregation pipeline kullanarak allowDiskUse desteği
    const sales: any[] = await Sale.aggregate([
      { $match: query },
      { $sort: { created_at: -1 } }
    ], { allowDiskUse: true });
    
    // Get all unique product IDs
    const productIds = Array.from(
      new Set(
        sales
          .map((s: any) => s.product_id)
          .filter((id): id is string => !!id)
      )
    );

    // Fetch all products in one query
    const products: any[] = await Product.find({
      _id: { $in: productIds },
    }).lean();

    // Create product map for O(1) lookup
    const productMap = new Map(
      products.map((prod: any) => [prod._id.toString(), prod])
    );

    // Populate product efficiently
    const salesWithProducts = sales.map((sale: any) => {
      const saleObj: any = { ...sale };
      if (sale.product_id) {
        const product: any = productMap.get(sale.product_id.toString());
        if (product) {
          saleObj.product_id = {
            _id: product._id,
            name: product.name,
            store_type: product.store_type,
          };
        }
      }
      return saleObj;
    });

    return NextResponse.json(salesWithProducts);
  } catch (error: any) {
    console.error('Sales API Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Satışlar yüklenirken bir hata oluştu',
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
    const sale = await Sale.create(body);
    return NextResponse.json(sale, { status: 201 });
  } catch (error: any) {
    console.error('Sales API Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Satışlar yüklenirken bir hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}


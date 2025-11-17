import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Product from '@/models/Product';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const sale: any = await Sale.findById(params.id).lean();
    if (!sale) {
      return NextResponse.json({ error: 'Satış bulunamadı' }, { status: 404 });
    }
    
    const saleObj: any = { ...sale };
    if (sale.product_id) {
      const product: any = await Product.findById(sale.product_id).lean();
      if (product) {
        saleObj.product_id = {
          _id: product._id,
          name: product.name,
          store_type: product.store_type,
        };
      }
    }
    
    return NextResponse.json(saleObj);
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
    const sale: any = await Sale.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!sale) {
      return NextResponse.json({ error: 'Satış bulunamadı' }, { status: 404 });
    }
    
    const saleObj: any = { ...sale };
    if (sale.product_id) {
      const product: any = await Product.findById(sale.product_id).lean();
      if (product) {
        saleObj.product_id = {
          _id: product._id,
          name: product.name,
          store_type: product.store_type,
        };
      }
    }
    
    return NextResponse.json(saleObj);
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
    const sale = await Sale.findByIdAndDelete(params.id);
    if (!sale) {
      return NextResponse.json({ error: 'Satış bulunamadı' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Satış silindi' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


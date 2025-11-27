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
    const packageDoc = await Package.findById(params.id).lean();

    if (!packageDoc) {
      return NextResponse.json(
        { error: 'Paket bulunamadı' },
        { status: 404 }
      );
    }

    // Paket içindeki ürünleri getir
    const products = await Product.find({
      _id: { $in: packageDoc.product_ids || [] },
    })
      .select('_id name image_url images price store_type description')
      .lean();

    const packageWithProducts = {
      ...packageDoc,
      products: products,
    };

    return NextResponse.json(packageWithProducts);
  } catch (error: any) {
    console.error('Package GET API Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Paket yüklenirken bir hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();

    // Validasyon
    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json(
        { error: 'Paket adı boş olamaz' },
        { status: 400 }
      );
    }

    if (body.product_ids !== undefined && (!Array.isArray(body.product_ids) || body.product_ids.length === 0)) {
      return NextResponse.json(
        { error: 'Paket en az bir ürün içermelidir' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.price !== undefined) updateData.price = body.price ? parseFloat(body.price) : null;
    if (body.image_url !== undefined) updateData.image_url = body.image_url?.trim() || null;
    if (body.product_ids !== undefined) updateData.product_ids = body.product_ids;
    if (body.store_type !== undefined) updateData.store_type = body.store_type;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    updateData.updated_at = new Date();

    const packageDoc = await Package.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!packageDoc) {
      return NextResponse.json(
        { error: 'Paket bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(packageDoc);
  } catch (error: any) {
    console.error('Package PUT API Error:', error);
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
    const packageDoc = await Package.findByIdAndDelete(params.id);

    if (!packageDoc) {
      return NextResponse.json(
        { error: 'Paket bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Paket başarıyla silindi' });
  } catch (error: any) {
    console.error('Package DELETE API Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Paket silinirken bir hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}


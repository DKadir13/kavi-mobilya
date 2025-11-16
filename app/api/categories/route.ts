import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find()
      .select('name slug description image_url order_index')
      .sort({ order_index: 1 })
      .lean();
    
    const response = NextResponse.json(categories);
    
    // Cache categories for 10 minutes (they change rarely)
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    
    return response;
  } catch (error: any) {
    console.error('Categories API Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Kategoriler yüklenirken bir hata oluştu',
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
    const category = await Category.create(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Categories POST API Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Kategori oluşturulurken bir hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}


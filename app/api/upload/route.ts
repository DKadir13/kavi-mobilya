import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
    
    // Klasör yoksa oluştur
    try {
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
    } catch (dirError: any) {
      console.error('Directory creation error:', dirError);
      return NextResponse.json({ 
        error: 'Upload klasörü oluşturulamadı: ' + dirError.message 
      }, { status: 500 });
    }

    const uploadedFiles: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        errors.push('Geçersiz dosya formatı');
        continue;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Geçersiz dosya tipi (sadece resim dosyaları kabul edilir)`);
        continue;
      }

      // Dosya boyutu kontrolü (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: Dosya boyutu çok büyük (max 5MB)`);
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Benzersiz dosya adı oluştur
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop() || 'jpg';
        const filename = `${timestamp}-${randomString}.${extension}`;
        const filepath = join(uploadDir, filename);

        // Dosyayı kaydet
        try {
          await writeFile(filepath, buffer);
          
          // Public URL'yi oluştur
          const publicUrl = `/uploads/products/${filename}`;
          uploadedFiles.push(publicUrl);
        } catch (writeError: any) {
          // Vercel veya read-only dosya sistemi hatası
          if (writeError.code === 'EACCES' || writeError.code === 'EROFS' || writeError.message?.includes('read-only')) {
            throw new Error('Dosya sistemi read-only. Vercel ortamında dosya yükleme desteklenmiyor. Lütfen cloud storage (S3, Cloudinary) kullanın.');
          }
          throw writeError;
        }
      } catch (fileError: any) {
        console.error(`File upload error for ${file.name}:`, fileError);
        // Eğer Vercel hatası ise, tüm işlemi durdur
        if (fileError.message?.includes('read-only') || fileError.message?.includes('Vercel')) {
          return NextResponse.json({ 
            error: fileError.message,
            code: 'VERCEL_FILE_SYSTEM_READONLY',
            details: ['Vercel ortamında dosya sistemi read-only olduğu için dosya yükleme desteklenmiyor. Lütfen cloud storage (S3, Cloudinary, vb.) entegrasyonu yapın.']
          }, { status: 500 });
        }
        errors.push(`${file.name}: ${fileError.message || 'Yükleme hatası'}`);
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json({ 
        error: 'Hiçbir dosya yüklenemedi',
        details: errors.length > 0 ? errors : ['Geçerli resim dosyası bulunamadı']
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles,
      message: `${uploadedFiles.length} dosya başarıyla yüklendi`,
      warnings: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: error.message || 'Dosya yüklenirken bir hata oluştu',
      code: error.code || 'UNKNOWN_ERROR'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json({ error: 'Dosya URL\'si gerekli' }, { status: 400 });
    }

    // Public URL'den dosya yolunu çıkar
    const filename = fileUrl.replace('/uploads/products/', '');
    const filepath = join(process.cwd(), 'public', 'uploads', 'products', filename);

    // Dosyayı sil
    const { unlink } = await import('fs/promises');
    await unlink(filepath);

    return NextResponse.json({ success: true, message: 'Dosya silindi' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Dosya silinirken bir hata oluştu' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';

// Sharp'ı dynamic import ile yükle (runtime hatası önlemek için)
let sharp: any = null;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('Sharp modülü yüklenemedi:', e);
}

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            "BLOB_READ_WRITE_TOKEN tanımlı değil. Vercel > Project > Storage (Blob) kurulumunu yapın ve token'ı Environment Variables'a ekleyin.",
          code: 'BLOB_TOKEN_MISSING',
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
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

      // Dosya boyutu kontrolü (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: Dosya boyutu çok büyük (max 10MB)`);
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Resmi sıkıştır ve optimize et
        let optimizedBuffer: Buffer;
        let mimeType = 'image/jpeg';
        let fileExtension = 'jpg';

        if (sharp) {
          try {
            // Resmi optimize et:
            // - Maksimum genişlik: 1920px
            // - Kalite: 80%
            // - Format: JPEG
            optimizedBuffer = await sharp(buffer)
              .resize(1920, 1920, {
                fit: 'inside',
                withoutEnlargement: true,
              })
              .jpeg({
                quality: 80,
                progressive: true,
                mozjpeg: true,
              })
              .toBuffer();

            mimeType = 'image/jpeg';
            fileExtension = 'jpg';
          } catch (sharpError: any) {
            console.warn(`Sharp processing failed for ${file.name}, using original:`, sharpError.message);
            optimizedBuffer = buffer;
            mimeType = file.type;
            // Dosya uzantısını belirle
            if (file.type === 'image/png') fileExtension = 'png';
            else if (file.type === 'image/webp') fileExtension = 'webp';
            else if (file.type === 'image/jpeg' || file.type === 'image/jpg') fileExtension = 'jpg';
            else fileExtension = 'jpg'; // default
          }
        } else {
          // Sharp yoksa orijinal buffer'ı kullan
          optimizedBuffer = buffer;
          mimeType = file.type;
          // Dosya uzantısını belirle
          if (file.type === 'image/png') fileExtension = 'png';
          else if (file.type === 'image/webp') fileExtension = 'webp';
          else if (file.type === 'image/jpeg' || file.type === 'image/jpg') fileExtension = 'jpg';
          else fileExtension = 'jpg'; // default
        }

        // Benzersiz dosya adı oluştur
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileName = `products/${timestamp}-${randomString}.${fileExtension}`;

        // Vercel Blob Store'a yükle
        const blob = await put(fileName, optimizedBuffer, {
          access: 'public',
          contentType: mimeType,
        });
        
        uploadedFiles.push(blob.url);
      } catch (fileError: any) {
        console.error(`File upload error for ${file.name}:`, fileError);
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
      message: `${uploadedFiles.length} dosya başarıyla yüklendi ve sıkıştırıldı`,
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
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            "BLOB_READ_WRITE_TOKEN tanımlı değil. Vercel > Project > Storage (Blob) kurulumunu yapın ve token'ı Environment Variables'a ekleyin.",
          code: 'BLOB_TOKEN_MISSING',
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ 
        error: 'Silinecek dosya URL\'si belirtilmedi' 
      }, { status: 400 });
    }

    // Vercel Blob Store'dan sil
    try {
      await del(url);
      return NextResponse.json({ 
        success: true, 
        message: 'Dosya başarıyla silindi' 
      });
    } catch (deleteError: any) {
      // Eğer dosya zaten yoksa veya başka bir hata varsa
      console.warn('Blob delete error:', deleteError);
      // Base64 URL'ler için (eski veriler) hata verme
      if (url.startsWith('data:')) {
        return NextResponse.json({ 
          success: true, 
          message: 'Base64 resimler için silme işlemi gerekmez' 
        });
      }
      throw deleteError;
    }
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ 
      error: error.message || 'İşlem sırasında bir hata oluştu' 
    }, { status: 500 });
  }
}

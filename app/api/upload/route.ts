import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
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

      // Dosya boyutu kontrolü (max 10MB - sıkıştırma sonrası çok daha küçük olacak)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: Dosya boyutu çok büyük (max 10MB)`);
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Resmi sıkıştır ve optimize et
        let optimizedBuffer: Buffer;
        let mimeType = 'image/jpeg'; // Varsayılan olarak JPEG

        try {
          // Resmi optimize et:
          // - Maksimum genişlik: 1920px (daha büyük resimler küçültülür)
          // - Kalite: 80% (iyi kalite/küçük boyut dengesi)
          // - Format: JPEG (en iyi sıkıştırma)
          optimizedBuffer = await sharp(buffer)
            .resize(1920, 1920, {
              fit: 'inside',
              withoutEnlargement: true, // Küçük resimleri büyütme
            })
            .jpeg({
              quality: 80,
              progressive: true, // Progressive JPEG (daha iyi yükleme deneyimi)
              mozjpeg: true, // Daha iyi sıkıştırma
            })
            .toBuffer();

          mimeType = 'image/jpeg';
        } catch (sharpError: any) {
          // Sharp ile işlenemezse (SVG gibi), orijinal buffer'ı kullan
          console.warn(`Sharp processing failed for ${file.name}, using original:`, sharpError.message);
          optimizedBuffer = buffer;
          mimeType = file.type;
        }

        // Base64'e çevir
        const base64String = optimizedBuffer.toString('base64');
        
        // Data URL formatında oluştur (data:image/jpeg;base64,...)
        const dataUrl = `data:${mimeType};base64,${base64String}`;
        
        uploadedFiles.push(dataUrl);
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
    
    // Sharp hatası kontrolü
    if (error.message?.includes('sharp') || error.code === 'MODULE_NOT_FOUND' || error.message?.includes('Cannot find module')) {
      return NextResponse.json({ 
        error: 'Resim işleme modülü yüklenemedi. Lütfen sharp paketinin kurulu olduğundan emin olun.',
        code: 'SHARP_ERROR',
        details: [error.message]
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Dosya yüklenirken bir hata oluştu',
      code: error.code || 'UNKNOWN_ERROR'
    }, { status: 500 });
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function DELETE(request: NextRequest) {
  try {
    // Base64 resimler MongoDB'de saklandığı için silme işlemi gerekmez
    // Eğer ürün silinirse resimler de otomatik olarak silinir
    return NextResponse.json({ 
      success: true, 
      message: 'Base64 resimler ürünle birlikte saklandığı için ayrı silme gerekmez' 
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ 
      error: error.message || 'İşlem sırasında bir hata oluştu' 
    }, { status: 500 });
  }
}

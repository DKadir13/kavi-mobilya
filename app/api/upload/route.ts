import { NextRequest, NextResponse } from 'next/server';

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
          } catch (sharpError: any) {
            console.warn(`Sharp processing failed for ${file.name}, using original:`, sharpError.message);
            optimizedBuffer = buffer;
            mimeType = file.type;
          }
        } else {
          // Sharp yoksa orijinal buffer'ı kullan
          optimizedBuffer = buffer;
          mimeType = file.type;
        }

        // Base64'e çevir
        const base64String = optimizedBuffer.toString('base64');
        
        // Data URL formatında oluştur
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
    
    return NextResponse.json({ 
      error: error.message || 'Dosya yüklenirken bir hata oluştu',
      code: error.code || 'UNKNOWN_ERROR'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Base64 resimler MongoDB'de saklandığı için silme işlemi gerekmez
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

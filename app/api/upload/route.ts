import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Sharp'ı dynamic import ile yükle (runtime hatası önlemek için)
let sharp: any = null;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('Sharp modülü yüklenemedi:', e);
}

export const runtime = 'nodejs';
export const maxDuration = 30;

/** Kaydedilen dosyanın MongoDB’de saklanacak tam URL öneki (varsayılan canlı domain). */
const PUBLIC_UPLOAD_BASE_URL =
  (process.env.PUBLIC_UPLOAD_BASE_URL || 'https://kavimobilya.com').replace(
    /\/$/,
    ''
  );

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

const MAX_FILE_SIZE_MB = Number.parseFloat(
  (process.env.UPLOAD_MAX_FILE_SIZE_MB || '25').trim()
);
const MAX_FILE_SIZE_BYTES =
  Number.isFinite(MAX_FILE_SIZE_MB) && MAX_FILE_SIZE_MB > 0
    ? Math.floor(MAX_FILE_SIZE_MB * 1024 * 1024)
    : 25 * 1024 * 1024;

function publicUrlForFile(fileName: string) {
  return `${PUBLIC_UPLOAD_BASE_URL}/uploads/${fileName}`;
}

/** URL veya path’ten güvenli dosya adı çıkar (/uploads/ altı). */
function uploadsFileNameFromParam(urlOrPath: string): string | null {
  if (!urlOrPath || urlOrPath.startsWith('data:')) return null;
  try {
    const pathname = urlOrPath.includes('://')
      ? new URL(urlOrPath).pathname
      : urlOrPath.startsWith('/')
        ? urlOrPath
        : null;
    if (!pathname || !pathname.startsWith('/uploads/')) return null;
    const name = pathname.slice('/uploads/'.length).split('/')[0];
    if (!name || name.includes('..') || name.includes('/') || name.includes('\\'))
      return null;
    return name;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });

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

      if (!file.type.startsWith('image/')) {
        errors.push(
          `${file.name}: Geçersiz dosya tipi (sadece resim dosyaları kabul edilir)`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(
          `${file.name}: Dosya boyutu çok büyük (max ${MAX_FILE_SIZE_MB}MB)`
        );
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        let optimizedBuffer: Buffer;
        let fileExtension = 'jpg';

        if (sharp) {
          try {
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
            fileExtension = 'jpg';
          } catch (sharpError: any) {
            console.warn(
              `Sharp processing failed for ${file.name}, using original:`,
              sharpError.message
            );
            optimizedBuffer = buffer;
            if (file.type === 'image/png') fileExtension = 'png';
            else if (file.type === 'image/webp') fileExtension = 'webp';
            else if (file.type === 'image/jpeg' || file.type === 'image/jpg')
              fileExtension = 'jpg';
            else fileExtension = 'jpg';
          }
        } else {
          optimizedBuffer = buffer;
          if (file.type === 'image/png') fileExtension = 'png';
          else if (file.type === 'image/webp') fileExtension = 'webp';
          else if (file.type === 'image/jpeg' || file.type === 'image/jpg')
            fileExtension = 'jpg';
          else fileExtension = 'jpg';
        }

        const uniqueName = `${Date.now()}-${randomUUID().replace(/-/g, '')}.${fileExtension}`;
        const diskPath = join(UPLOAD_DIR, uniqueName);

        await writeFile(diskPath, optimizedBuffer);

        uploadedFiles.push(publicUrlForFile(uniqueName));
      } catch (fileError: any) {
        console.error(`File upload error for ${file.name}:`, fileError);
        errors.push(`${file.name}: ${fileError.message || 'Yükleme hatası'}`);
      }
    }

    if (uploadedFiles.length === 0) {
      const hasTooLarge = errors.some((e) => e.includes('Dosya boyutu çok büyük'));
      return NextResponse.json(
        {
          error: 'Hiçbir dosya yüklenemedi',
          details:
            errors.length > 0 ? errors : ['Geçerli resim dosyası bulunamadı'],
        },
        { status: hasTooLarge ? 413 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} dosya başarıyla yüklendi ve sıkıştırıldı`,
      warnings: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Upload error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Dosya yüklenirken bir hata oluştu',
        code: error.code || 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: "Silinecek dosya URL'si belirtilmedi" },
        { status: 400 }
      );
    }

    if (url.startsWith('data:')) {
      return NextResponse.json({
        success: true,
        message: 'Base64 resimler için silme işlemi gerekmez',
      });
    }

    const fileName = uploadsFileNameFromParam(url);
    if (!fileName) {
      return NextResponse.json(
        {
          error:
            'Yalnızca bu sitedeki /uploads/ altındaki yerel dosyalar silinebilir',
        },
        { status: 400 }
      );
    }

    const diskPath = join(UPLOAD_DIR, fileName);
    try {
      await unlink(diskPath);
    } catch (e: any) {
      if (e?.code !== 'ENOENT') throw e;
    }

    return NextResponse.json({
      success: true,
      message: 'Dosya başarıyla silindi',
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error.message || 'İşlem sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

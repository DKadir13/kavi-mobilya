import mongoose from 'mongoose';

/** Yerel MongoDB (geliştirme). Production’da mutlaka MONGODB_URI env ile geçin. */
const LOCAL_DEV_MONGODB_URI =
  'mongodb://adminKullanici:GucluSifre123@127.0.0.1:27017/kavi_mobilya?authSource=admin';

const uri =
  (process.env.MONGODB_URI || '').trim() ||
  (process.env.NODE_ENV !== 'production' ? LOCAL_DEV_MONGODB_URI : '');
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'kavi_mobilya';

// Validate MongoDB URI format - only at runtime, not during build
function validateMongoUri(uri: string): void {
  if (!uri) {
    // Vercel/Next.js'te en sık sebep: Environment Variables eksik veya yanlış environment'a eklenmiş.
    throw new Error(
      'MONGODB_URI tanımlı değil. Vercel > Project > Settings > Environment Variables altında ' +
        'MONGODB_URI değerini Production/Preview/Development için ekleyin ve redeploy edin.'
    );
  }
  
  // Trim whitespace that might come from environment variables
  const trimmedUri = uri.trim();
  
  if (!trimmedUri.startsWith('mongodb://') && !trimmedUri.startsWith('mongodb+srv://')) {
    throw new Error('MongoDB URI must start with "mongodb://" or "mongodb+srv://"');
  }
}

function ensureDbInMongoUri(uri: string, dbName: string) {
  const trimmed = uri.trim();
  const url = new URL(trimmed);

  // URL.pathname boş veya "/" ise db belirtilmemiş demektir
  if (!url.pathname || url.pathname === '/') {
    url.pathname = `/${dbName}`;
  }

  return url.toString();
}

// Not: URI loglamak (maskeli bile olsa) prod/preview loglarında gereksiz risk oluşturabilir.
// Bu yüzden burada loglamıyoruz.

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  // Validate URI only at runtime (when function is called), not during build
  try {
    validateMongoUri(uri || '');
  } catch (error: any) {
    console.error('MongoDB URI validation error:', error.message);
    throw error;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const shouldForceIpv4 =
      process.env.MONGODB_FORCE_IPV4 === '1' ||
      process.env.MONGODB_FORCE_IPV4 === 'true' ||
      // Vercel'de bazı ortamlarda IPv6/DNS kaynaklı bağlantı sorunları görülebiliyor.
      // Varsayılanı "force" yapmayıp env ile kontrol ediyoruz.
      false;

    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 0,
      connectTimeoutMS: 30000,
      maxIdleTimeMS: 60000,
      heartbeatFrequencyMS: 10000,
      ...(shouldForceIpv4 ? { family: 4 } : {}),
    };

    const trimmedUri = (uri || '').trim();
    const normalizedUri = ensureDbInMongoUri(trimmedUri, MONGODB_DB_NAME);

    cached.promise = mongoose.connect(normalizedUri, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('MongoDB connection error:', error);
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection failed:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;


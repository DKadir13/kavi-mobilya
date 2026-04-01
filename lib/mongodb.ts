import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

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

// Log MongoDB URI (without password) for debugging - only in development
if (process.env.NODE_ENV === 'development') {
  console.log('MongoDB URI:', MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));
}

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
    validateMongoUri(MONGODB_URI || '');
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
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Serverless ortamda ilk bağlantı daha yavaş olabilir
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000,
      ...(shouldForceIpv4 ? { family: 4 } : {}),
    };

    // Trim URI in case there's whitespace
    const trimmedUri = (MONGODB_URI || '').trim();

    cached.promise = mongoose.connect(trimmedUri, opts).then((mongoose) => {
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


import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

function maskMongoUri(uri: string) {
  // mongodb+srv://user:pass@host/db -> mongodb+srv://user:****@host/db
  return uri.replace(/:[^:@]+@/, ':****@');
}

export async function GET() {
  const startedAt = Date.now();

  const mongoUri = process.env.MONGODB_URI;
  const jwtSecret = process.env.JWT_SECRET;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  const base = {
    ok: true,
    ts: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV || null,
      vercel: {
        env: process.env.VERCEL_ENV || null,
        region: process.env.VERCEL_REGION || null,
      },
    },
    config: {
      hasMongoUri: Boolean(mongoUri && mongoUri.trim()),
      mongoUriMasked: mongoUri ? maskMongoUri(mongoUri.trim()) : null,
      hasJwtSecret: Boolean(jwtSecret && jwtSecret.trim()),
      forceIpv4: process.env.MONGODB_FORCE_IPV4 || null,
      hasBlobToken: Boolean(blobToken && blobToken.trim()),
    },
    mongoose: {
      readyState: mongoose.connection.readyState, // 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
    },
    timingMs: 0,
  };

  try {
    await connectDB();
    base.mongoose.readyState = mongoose.connection.readyState;
    return NextResponse.json({ ...base, timingMs: Date.now() - startedAt });
  } catch (error: any) {
    const message = error?.message || 'Healthcheck failed';
    const name = error?.name || null;
    const code = error?.code || null;

    return NextResponse.json(
      {
        ...base,
        ok: false,
        error: { name, code, message },
        timingMs: Date.now() - startedAt,
      },
      { status: 500 }
    );
  }
}


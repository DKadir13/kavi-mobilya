import mongoose, { Schema } from 'mongoose';

export interface IPackage {
  _id?: string;
  name: string;
  description?: string;
  image_url?: string;
  price?: number;
  product_ids: string[]; // Pakete dahil ürün ID'leri
  store_type: 'home' | 'premium' | 'both'; // Paket hangi mağazada görünecek
  is_active: boolean;
  display_order?: number; // Görüntülenme sırası
  created_at?: Date;
  updated_at?: Date;
}

const PackageSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    image_url: { type: String },
    price: { type: Number }, // Toplam fiyat (opsiyonel, ürün fiyatlarından otomatik hesaplanabilir)
    product_ids: { type: [String], required: true, default: [] },
    store_type: { type: String, required: true, enum: ['home', 'premium', 'both'], default: 'both' },
    is_active: { type: Boolean, default: true },
    display_order: { type: Number },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
PackageSchema.index({ is_active: 1 });
PackageSchema.index({ store_type: 1 });
PackageSchema.index({ display_order: 1 });

const Package: any =
  mongoose.models.Package || mongoose.model('Package', PackageSchema);

export default Package;


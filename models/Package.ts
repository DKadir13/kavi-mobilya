import mongoose, { Schema } from 'mongoose';

export interface IPackage {
  _id?: string;
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
  product_ids: string[]; // Paket içindeki ürün ID'leri
  store_type: 'home' | 'premium';
  is_featured: boolean;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

const PackageSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number },
    image_url: { type: String },
    product_ids: { type: [String], default: [], required: true },
    store_type: { type: String, required: true, enum: ['home', 'premium'] },
    is_featured: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
PackageSchema.index({ store_type: 1 });
PackageSchema.index({ is_active: 1 });
PackageSchema.index({ is_featured: 1 });
PackageSchema.index({ created_at: -1 });

const Package: any =
  mongoose.models.Package || mongoose.model('Package', PackageSchema);

export default Package;


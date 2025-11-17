import mongoose, { Schema, Model } from 'mongoose';

export interface IProduct {
  _id?: string;
  category_id?: string;
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
  images?: string[];
  store_type: 'home' | 'premium';
  is_featured: boolean;
  is_active: boolean;
  stock_status: 'in_stock' | 'out_of_stock' | 'on_order';
  featured_order?: number;
  created_at?: Date;
  updated_at?: Date;
}

const ProductSchema = new Schema(
  {
    category_id: { type: String, ref: 'Category' },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number },
    image_url: { type: String },
    images: { type: [String], default: [] },
    store_type: { type: String, required: true, enum: ['home', 'premium'] },
    is_featured: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    stock_status: {
      type: String,
      enum: ['in_stock', 'out_of_stock', 'on_order'],
      default: 'in_stock',
    },
    featured_order: { type: Number },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
ProductSchema.index({ category_id: 1 });
ProductSchema.index({ store_type: 1 });
ProductSchema.index({ is_active: 1 });
ProductSchema.index({ is_featured: 1, featured_order: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;


import mongoose, { Schema, Model } from 'mongoose';

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  order_index: number;
  created_at?: Date;
  updated_at?: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    image_url: { type: String },
    order_index: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ order_index: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;


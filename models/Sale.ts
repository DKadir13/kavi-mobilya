import mongoose, { Schema, Model } from 'mongoose';

export interface ISale {
  _id?: string;
  product_id?: string;
  quantity: number;
  sale_price: number;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  sale_date: Date;
  created_at?: Date;
}

const SaleSchema = new Schema<ISale>(
  {
    product_id: { type: String, ref: 'Product' },
    quantity: { type: Number, required: true, default: 1 },
    sale_price: { type: Number, required: true },
    customer_name: { type: String },
    customer_phone: { type: String },
    notes: { type: String },
    sale_date: { type: Date, required: true, default: Date.now },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
SaleSchema.index({ product_id: 1 });
SaleSchema.index({ sale_date: 1 });

const Sale: Model<ISale> =
  mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);

export default Sale;


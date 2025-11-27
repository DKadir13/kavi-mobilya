import mongoose, { Schema } from 'mongoose';

export interface IProductSubItem {
  product_id?: string; // Parça olarak eklenen ürünün ID'si (opsiyonel - eğer mevcut ürün ise)
  name?: string; // Parça adı (yeni parça ise)
  description?: string; // Parça açıklaması
  price?: number; // Parça fiyatı
  image_url?: string; // Parça görseli
  quantity?: number; // Varsayılan adet (opsiyonel)
  is_optional?: boolean; // Opsiyonel parça mı? (sepette çıkarılabilir)
  sub_items?: IProductSubItem[]; // Parçanın kendi parçaları (nested)
}

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
  sub_items?: IProductSubItem[]; // Ürünün parçaları (ör: yatak odası takımı = yatak + komodin + gardırop)
  created_at?: Date;
  updated_at?: Date;
}

const ProductSubItemSchema = new Schema(
  {
    product_id: { type: String, ref: 'Product' }, // Opsiyonel - eğer mevcut ürün ise
    name: { type: String }, // Parça adı (yeni parça ise)
    description: { type: String }, // Parça açıklaması
    price: { type: Number }, // Parça fiyatı
    image_url: { type: String }, // Parça görseli
    quantity: { type: Number, default: 0 },
    is_optional: { type: Boolean, default: false }, // Opsiyonel parça mı? (sepette çıkarılabilir)
    sub_items: { type: [Schema.Types.Mixed], default: [] }, // Parçanın kendi parçaları (nested)
  },
  { _id: false }
);

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
    sub_items: { type: [ProductSubItemSchema], default: [] }, // Ürünün parçaları
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
ProductSchema.index({ created_at: -1 }); // Sort işlemleri için kritik index (memory limit sorununu önler)

const Product: any =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;


-- Add featured_order column to products table for managing featured products order
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS featured_order integer;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_featured_order ON products(featured_order) WHERE is_featured = true;

-- Add comment
COMMENT ON COLUMN products.featured_order IS 'Sıralama numarası (1-6) - Öne çıkan ürünlerin gösterim sırası';


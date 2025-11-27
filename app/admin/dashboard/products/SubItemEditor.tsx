'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

type SubItem = {
  product_id?: string;
  name?: string;
  description?: string;
  price?: number | string;
  image_url?: string;
  quantity: number;
  is_optional: boolean;
  sub_items?: SubItem[];
};

type Product = {
  _id: string;
  id?: string;
  name: string;
};

type SubItemEditorProps = {
  subItem: SubItem;
  index: number;
  products: Product[];
  editingProduct: Product | null;
  onUpdate: (subItem: SubItem) => void;
  onDelete: () => void;
  level?: number; // Nested level (0 = top level)
};

export default function SubItemEditor({
  subItem,
  index,
  products,
  editingProduct,
  onUpdate,
  onDelete,
  level = 0,
}: SubItemEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [useExistingProduct, setUseExistingProduct] = useState(!!subItem.product_id);

  const availableProducts = products.filter(
    (p) => (p._id || p.id) !== (editingProduct?._id || editingProduct?.id)
  );

  const selectedProduct = subItem.product_id
    ? products.find((p) => (p._id || p.id) === subItem.product_id)
    : null;

  const handleUpdate = (field: keyof SubItem, value: any) => {
    onUpdate({ ...subItem, [field]: value });
  };

  const handleAddNestedSubItem = () => {
    const newSubItems = [...(subItem.sub_items || []), {
      name: '',
      description: '',
      price: '',
      image_url: '',
      quantity: 0,
      is_optional: false,
      sub_items: [],
    }];
    onUpdate({ ...subItem, sub_items: newSubItems });
  };

  const handleUpdateNestedSubItem = (nestedIndex: number, updatedNested: SubItem) => {
    const newSubItems = [...(subItem.sub_items || [])];
    newSubItems[nestedIndex] = updatedNested;
    onUpdate({ ...subItem, sub_items: newSubItems });
  };

  const handleDeleteNestedSubItem = (nestedIndex: number) => {
    const newSubItems = (subItem.sub_items || []).filter((_, i) => i !== nestedIndex);
    onUpdate({ ...subItem, sub_items: newSubItems });
  };

  return (
    <div className={`border rounded-lg p-4 ${level > 0 ? 'ml-6 bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>

        <div className="flex-1 space-y-3">
          {/* Parça Tipi Seçimi */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id={`existing-${index}`}
                checked={useExistingProduct}
                onChange={() => {
                  setUseExistingProduct(true);
                  onUpdate({ ...subItem, product_id: '', name: undefined, description: undefined, price: undefined, image_url: undefined });
                }}
                className="w-4 h-4"
              />
              <Label htmlFor={`existing-${index}`} className="text-sm font-normal cursor-pointer">
                Mevcut Ürün Kullan
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id={`new-${index}`}
                checked={!useExistingProduct}
                onChange={() => {
                  setUseExistingProduct(false);
                  onUpdate({ ...subItem, product_id: undefined });
                }}
                className="w-4 h-4"
              />
              <Label htmlFor={`new-${index}`} className="text-sm font-normal cursor-pointer">
                Yeni Parça Oluştur
              </Label>
            </div>
          </div>

          {isExpanded && (
            <>
              {useExistingProduct ? (
                <div className="space-y-2">
                  <Label>Mevcut Ürün Seç</Label>
                  <Select
                    value={subItem.product_id || ''}
                    onValueChange={(productId) => {
                      const product = products.find((p) => (p._id || p.id) === productId);
                      onUpdate({
                        ...subItem,
                        product_id: productId,
                        name: product?.name,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ürün seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => {
                        const productId = product._id || product.id || '';
                        return (
                          <SelectItem key={productId} value={productId}>
                            {product.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedProduct && (
                    <p className="text-xs text-gray-500">
                      Seçili: {selectedProduct.name}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Parça Adı *</Label>
                    <Input
                      value={subItem.name || ''}
                      onChange={(e) => handleUpdate('name', e.target.value)}
                      placeholder="Örn: Yatak"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Parça Açıklaması</Label>
                    <Textarea
                      value={subItem.description || ''}
                      onChange={(e) => handleUpdate('description', e.target.value)}
                      rows={2}
                      placeholder="Parça açıklaması..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Parça Fiyatı (TL)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={subItem.price || ''}
                        onChange={(e) => handleUpdate('price', e.target.value || '')}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Parça Görseli URL</Label>
                      <Input
                        type="url"
                        value={subItem.image_url || ''}
                        onChange={(e) => handleUpdate('image_url', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Adet</Label>
                  <Input
                    type="number"
                    min="0"
                    value={subItem.quantity}
                    onChange={(e) => handleUpdate('quantity', parseInt(e.target.value) ?? 0)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor={`optional-${index}`} className="text-sm">Opsiyonel</Label>
                  <Switch
                    id={`optional-${index}`}
                    checked={subItem.is_optional}
                    onCheckedChange={(checked) => handleUpdate('is_optional', checked)}
                  />
                </div>
              </div>

              {/* Nested Sub Items */}
              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Parçanın Alt Parçaları</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddNestedSubItem}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Alt Parça Ekle
                  </Button>
                </div>
                {subItem.sub_items && subItem.sub_items.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {subItem.sub_items.map((nestedSubItem, nestedIndex) => (
                      <SubItemEditor
                        key={nestedIndex}
                        subItem={nestedSubItem}
                        index={nestedIndex}
                        products={products}
                        editingProduct={editingProduct}
                        onUpdate={(updated) => handleUpdateNestedSubItem(nestedIndex, updated)}
                        onDelete={() => handleDeleteNestedSubItem(nestedIndex)}
                        level={level + 1}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-700 flex-shrink-0"
          onClick={onDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


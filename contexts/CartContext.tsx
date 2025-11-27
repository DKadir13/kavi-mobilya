'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export type CartSubItem = {
  id: string; // Sub item'ın product_id'si
  name: string;
  image_url: string | null;
  price: number | null;
  quantity: number; // Sub item'ın adedi
  is_optional: boolean; // Opsiyonel mi? (çıkarılabilir mi?)
};

export type CartItem = {
  id: string;
  name: string;
  price: number | null;
  image_url: string | null;
  category: string;
  store_type: 'home' | 'premium';
  quantity: number;
  sub_items?: CartSubItem[]; // Ürünün parçaları (sub_items)
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  removeSubItem: (productId: string, subItemId: string) => void; // Ürünün parçasını çıkar
  addSubItem: (productId: string, subItem: CartSubItem) => void; // Ürünün parçasını ekle
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  generateWhatsAppMessage: () => string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kavi-cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error('Sepet verileri yüklenirken hata oluştu:', error);
      localStorage.removeItem('kavi-cart');
    }
  }, []);

  useEffect(() => {
    try {
      if (items.length > 0) {
        localStorage.setItem('kavi-cart', JSON.stringify(items));
      } else {
        // Sepet boşsa localStorage'dan da temizle
        localStorage.removeItem('kavi-cart');
      }
    } catch (error) {
      console.error('Sepet verileri kaydedilirken hata oluştu:', error);
    }
  }, [items]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    console.log('Adding to cart:', item);
    console.log('Sub items:', item.sub_items);
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        // Mevcut ürün varsa, quantity'yi artır ama sub_items'ı koru (yeni sub_items varsa onları kullan)
        const updated = prev.map((i) =>
          i.id === item.id 
            ? { 
                ...i, 
                quantity: i.quantity + 1,
                // Eğer yeni item'da sub_items varsa, yeni sub_items'ı kullan (mevcut olanı koruma)
                sub_items: item.sub_items && item.sub_items.length > 0 
                  ? item.sub_items 
                  : i.sub_items
              } 
            : i
        );
        console.log('Updated cart item:', updated.find(i => i.id === item.id));
        toast.success(`${item.name} sepete eklendi`);
        return updated;
      }
      console.log('New cart item with sub_items:', { ...item, quantity: 1 });
      toast.success(`${item.name} sepete eklendi`);
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        toast.success(`${item.name} sepetten kaldırıldı`);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const removeSubItem = useCallback((productId: string, subItemId: string) => {
    setItems((prev) => {
      const productItem = prev.find((i) => i.id === productId);
      if (!productItem) {
        toast.error('Ürün bulunamadı');
        return prev;
      }

      if (!productItem.sub_items || productItem.sub_items.length === 0) {
        toast.error('Bu ürünün parçası yok');
        return prev;
      }

      const subItem = productItem.sub_items.find((s) => s.id === subItemId);
      if (!subItem) {
        toast.error('Parça bulunamadı');
        return prev;
      }

      // Opsiyonel değilse çıkarılamaz
      if (!subItem.is_optional) {
        toast.error(`${subItem.name} zorunlu parça, çıkarılamaz`);
        return prev;
      }

      const updatedSubItems = productItem.sub_items.filter((s) => s.id !== subItemId);
      
      // Eğer tüm parçalar çıkarıldıysa, ana ürünü de sepetten kaldır
      if (updatedSubItems.length === 0) {
        toast.success(`${subItem.name} kaldırıldı. Tüm parçalar çıkarıldığı için ${productItem.name} de sepetten kaldırıldı.`);
        return prev.filter((i) => i.id !== productId);
      }
      
      toast.success(`${subItem.name} üründen kaldırıldı`);

      return prev.map((item) =>
        item.id === productId
          ? {
              ...item,
              sub_items: updatedSubItems,
            }
          : item
      );
    });
  }, []);

  const addSubItem = useCallback((productId: string, subItem: CartSubItem) => {
    setItems((prev) => {
      const productItem = prev.find((i) => i.id === productId);
      if (!productItem) return prev;

      const existingSubItems = productItem.sub_items || [];
      
      // Zaten ekli mi kontrol et
      if (existingSubItems.some((s) => s.id === subItem.id)) {
        toast.info(`${subItem.name} zaten ekli`);
        return prev;
      }

      const updatedSubItems = [...existingSubItems, subItem];
      
      toast.success(`${subItem.name} ürüne eklendi`);

      return prev.map((item) =>
        item.id === productId
          ? {
              ...item,
              sub_items: updatedSubItems,
            }
          : item
      );
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem('kavi-cart');
    } catch (error) {
      console.error('Sepet temizlenirken hata oluştu:', error);
    }
    toast.success('Sepet temizlendi');
  }, []);

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const generateWhatsAppMessage = () => {
    if (items.length === 0) return '';

    let message = 'Merhaba, aşağıdaki ürünler hakkında bilgi almak istiyorum:\n\n';

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   Mağaza: ${item.store_type === 'premium' ? 'Kavi Premium' : 'Kavi Home'}\n`;
      message += `   Kategori: ${item.category}\n`;
      message += `   Adet: ${item.quantity}\n`;
      if (item.price) {
        message += `   Fiyat: ${item.price.toLocaleString('tr-TR')} TL\n`;
      }
      if (item.sub_items && item.sub_items.length > 0) {
        message += `   Parçalar:\n`;
        item.sub_items.forEach((subItem, sIndex) => {
          message += `      ${sIndex + 1}. ${subItem.name} (${subItem.quantity} adet)`;
          if (subItem.price) {
            message += ` - ${subItem.price.toLocaleString('tr-TR')} TL`;
          }
          if (subItem.is_optional) {
            message += ' (Opsiyonel)';
          }
          message += '\n';
        });
      }
      message += '\n';
    });

    message += 'Detaylı bilgi ve fiyat teklifi alabilir miyim?';

    return encodeURIComponent(message);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        removeSubItem,
        addSubItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        generateWhatsAppMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

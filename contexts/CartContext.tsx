'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export type CartItem = {
  id: string;
  name: string;
  price: number | null;
  image_url: string | null;
  category: string;
  store_type: 'home' | 'premium';
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
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
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const updated = prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
        toast.success(`${item.name} sepete eklendi`);
        return updated;
      }
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

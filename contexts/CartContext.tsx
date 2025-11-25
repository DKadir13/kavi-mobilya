'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export type PackageItem = {
  id: string;
  name: string;
  price: number | null;
  image_url: string | null;
  category: string;
  store_type: 'home' | 'premium';
};

export type CartItem = {
  id: string;
  name: string;
  price: number | null;
  image_url: string | null;
  category: string;
  store_type: 'home' | 'premium';
  quantity: number;
  type: 'product' | 'package';
  packageItems?: PackageItem[]; // Sadece paketlerde olacak
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'type'>) => void;
  addPackageToCart: (packageName: string, packageItems: PackageItem[]) => void;
  removeFromCart: (id: string) => void;
  removeItemFromPackage: (packageId: string, itemId: string) => void;
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
          // Geriye dönük uyumluluk: type field'ı yoksa 'product' olarak ekle
          const normalized = parsed.map((item: any) => ({
            ...item,
            type: item.type || 'product',
            packageItems: item.packageItems || undefined,
          }));
          setItems(normalized);
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

  const addToCart = useCallback((item: Omit<CartItem, 'quantity' | 'type'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.type === 'product');
      if (existing) {
        const updated = prev.map((i) =>
          i.id === item.id && i.type === 'product' ? { ...i, quantity: i.quantity + 1 } : i
        );
        toast.success(`${item.name} sepete eklendi`);
        return updated;
      }
      toast.success(`${item.name} sepete eklendi`);
      return [...prev, { ...item, quantity: 1, type: 'product' }];
    });
  }, []);

  const addPackageToCart = useCallback((packageName: string, packageItems: PackageItem[]) => {
    if (packageItems.length === 0) {
      toast.error('Pakete en az bir ürün eklemelisiniz');
      return;
    }

    const packageId = `package-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Paket için ilk ürünün görselini kullan
    const firstItem = packageItems[0];
    const packagePrice = packageItems.reduce((sum, item) => sum + (item.price || 0), 0);
    
    // Mağaza tipi: tüm ürünler aynı mağazada olmalı (veya karışık)
    const storeType = packageItems[0]?.store_type || 'home';

    const packageItem: CartItem = {
      id: packageId,
      name: packageName,
      price: packagePrice,
      image_url: firstItem.image_url,
      category: 'Paket',
      store_type: storeType,
      quantity: 1,
      type: 'package',
      packageItems: packageItems,
    };

    setItems((prev) => {
      toast.success(`${packageName} paketi sepete eklendi (${packageItems.length} ürün)`);
      return [...prev, packageItem];
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

  const removeItemFromPackage = useCallback((packageId: string, itemId: string) => {
    setItems((prev) => {
      return prev.map((item) => {
        if (item.id === packageId && item.type === 'package' && item.packageItems) {
          const updatedPackageItems = item.packageItems.filter((pi) => pi.id !== itemId);
          
          if (updatedPackageItems.length === 0) {
            // Paket boşaldıysa paketi sil
            toast.success('Paket boşaldı, sepetten kaldırıldı');
            return null;
          }
          
          // Paket fiyatını güncelle
          const updatedPrice = updatedPackageItems.reduce((sum, pi) => sum + (pi.price || 0), 0);
          const removedItem = item.packageItems?.find((pi) => pi.id === itemId);
          
          toast.success(`${removedItem?.name || 'Ürün'} paketten kaldırıldı`);
          
          return {
            ...item,
            packageItems: updatedPackageItems,
            price: updatedPrice,
            image_url: updatedPackageItems[0]?.image_url || item.image_url,
          };
        }
        return item;
      }).filter((item) => item !== null) as CartItem[];
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
      if (item.type === 'package' && item.packageItems && item.packageItems.length > 0) {
        // Paket gösterimi
        message += `${index + 1}. 📦 ${item.name} (PAKET)\n`;
        message += `   Mağaza: ${item.store_type === 'premium' ? 'Kavi Premium' : 'Kavi Home'}\n`;
        message += `   Adet: ${item.quantity}\n`;
        if (item.price) {
          message += `   Toplam Fiyat: ${item.price.toLocaleString('tr-TR')} TL\n`;
        }
        message += `   Paket İçeriği (${item.packageItems.length} ürün):\n`;
        item.packageItems.forEach((pkgItem, pkgIndex) => {
          message += `      ${pkgIndex + 1}. ${pkgItem.name}\n`;
          message += `         Mağaza: ${pkgItem.store_type === 'premium' ? 'Kavi Premium' : 'Kavi Home'}\n`;
          message += `         Kategori: ${pkgItem.category}\n`;
          if (pkgItem.price) {
            message += `         Fiyat: ${pkgItem.price.toLocaleString('tr-TR')} TL\n`;
          }
        });
      } else {
        // Normal ürün gösterimi
        message += `${index + 1}. ${item.name}\n`;
        message += `   Mağaza: ${item.store_type === 'premium' ? 'Kavi Premium' : 'Kavi Home'}\n`;
        message += `   Kategori: ${item.category}\n`;
        message += `   Adet: ${item.quantity}\n`;
        if (item.price) {
          message += `   Fiyat: ${item.price.toLocaleString('tr-TR')} TL\n`;
        }
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
        addPackageToCart,
        removeFromCart,
        removeItemFromPackage,
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

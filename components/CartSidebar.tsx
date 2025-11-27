'use client';

import { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2, MessageCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { productsApi } from '@/lib/api';

type CartSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { items, removeFromCart, removeSubItem, addSubItem, updateSubItemQuantity, updateQuantity, clearCart, generateWhatsAppMessage } = useCart();
  const [productSubItems, setProductSubItems] = useState<Record<string, any[]>>({});
  const [loadingSubItems, setLoadingSubItems] = useState<Record<string, boolean>>({});

  const handleWhatsAppContact = () => {
    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/905539019490?text=${message}`, '_blank');
    // WhatsApp'a yönlendirme yapıldıktan sonra sepeti temizle
    clearCart();
  };

  // Ürünün tüm parçalarını yükle
  const loadProductSubItems = async (productId: string) => {
    if (loadingSubItems[productId] || productSubItems[productId]) return;
    
    setLoadingSubItems(prev => ({ ...prev, [productId]: true }));
    try {
      const product = await productsApi.getById(productId);
      if (product.sub_items && product.sub_items.length > 0) {
        const subItemProducts = await Promise.all(
          product.sub_items.map(async (subItem: any) => {
            if (subItem.product_id) {
              try {
                const subProduct = await productsApi.getById(subItem.product_id);
                return {
                  id: subProduct._id,
                  name: subProduct.name,
                  image_url: subProduct.image_url,
                  price: subProduct.price,
                  quantity: subItem.quantity || 1,
                  is_optional: subItem.is_optional || false,
                };
              } catch {
                return null;
              }
            } else if (subItem.name) {
              return {
                id: `sub-${Date.now()}-${Math.random()}`,
                name: subItem.name,
                image_url: subItem.image_url || null,
                price: subItem.price || null,
                quantity: subItem.quantity || 1,
                is_optional: subItem.is_optional || false,
              };
            }
            return null;
          })
        );
        const validSubItems = subItemProducts.filter(item => item !== null);
        setProductSubItems(prev => ({ ...prev, [productId]: validSubItems }));
      }
    } catch (error) {
      console.error('Parçalar yüklenirken hata:', error);
    } finally {
      setLoadingSubItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddSubItem = (productId: string, subItem: any) => {
    addSubItem(productId, subItem);
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b bg-[#0a0a0a] text-white">
            <h2 className="text-lg font-bold">Sepetim ({items.length})</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-center">Sepetiniz boş</p>
                <p className="text-sm text-center mt-2">
                  Ürün ekleyerek başlayın
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="space-y-2">
                    {/* Ana Item (Ürün veya Paket) */}
                    <div
                      className="flex gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        {item.image_url ? (
                          item.image_url.startsWith('data:') ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-xs">Resim yok</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm line-clamp-2">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.store_type === 'premium'
                                ? 'Kavi Premium'
                                : 'Kavi Home'}
                            </p>
                            {item.price && (
                              <p className="text-sm font-bold text-[#a42a2a] mt-1">
                                {item.price.toLocaleString('tr-TR')} TL
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                if (item.quantity <= 1) {
                                  removeFromCart(item.id);
                                } else {
                                  updateQuantity(item.id, item.quantity - 1);
                                }
                              }}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-3 text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Ürün Parçaları (Sub Items) - Her zaman göster */}
                    <div className="ml-4 pl-4 border-l-2 border-gray-300 space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-600">
                          Ürün Parçaları ({item.sub_items?.length || 0}):
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => loadProductSubItems(item.id)}
                          disabled={loadingSubItems[item.id]}
                        >
                          {loadingSubItems[item.id] ? 'Yükleniyor...' : 'Parçaları Yükle'}
                        </Button>
                      </div>
                      
                      {/* Mevcut Parçalar */}
                      {item.sub_items && item.sub_items.length > 0 ? (
                        item.sub_items.map((subItem, idx) => (
                        <div
                          key={subItem.id || `sub-${idx}`}
                          className={`flex items-center gap-2 p-2 rounded-lg ${
                            subItem.is_optional 
                              ? 'bg-yellow-50 border border-yellow-200' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="relative w-12 h-12 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                            {subItem.image_url ? (
                              subItem.image_url.startsWith('data:') ? (
                                <img
                                  src={subItem.image_url}
                                  alt={subItem.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Image
                                  src={subItem.image_url}
                                  alt={subItem.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-[8px] text-gray-400">Resim yok</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium truncate">{subItem.name}</p>
                              {subItem.is_optional ? (
                                <span className="text-[8px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">
                                  Opsiyonel
                                </span>
                              ) : (
                                <span className="text-[8px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                                  Zorunlu
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {subItem.price && (
                                <p className="text-[10px] font-semibold text-[#a42a2a]">
                                  {subItem.price.toLocaleString('tr-TR')} TL
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {/* Parça Sayısı Kontrolü */}
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateSubItemQuantity(item.id, subItem.id, subItem.quantity - 1)}
                                disabled={!subItem.is_optional && subItem.quantity <= 1}
                                title="Azalt"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="px-2 text-xs font-medium min-w-[2rem] text-center">
                                {subItem.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateSubItemQuantity(item.id, subItem.id, subItem.quantity + 1)}
                                title="Artır"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            {/* Silme Butonu (Sadece Opsiyonel) */}
                            {subItem.is_optional && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                onClick={() => removeSubItem(item.id, subItem.id)}
                                title="Parçayı tamamen kaldır"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-2">
                          Bu ürünün parçası yok. "Parçaları Yükle" butonuna tıklayarak ürünün tüm parçalarını görebilirsiniz.
                        </p>
                      )}

                      {/* Eklenebilecek Diğer Parçalar */}
                      {productSubItems[item.id] && productSubItems[item.id].length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-gray-600 mb-2">
                            Eklenebilecek Parçalar:
                          </p>
                          {productSubItems[item.id]
                            .filter(subItem => !item.sub_items?.some(si => si.id === subItem.id))
                            .map((availableSubItem) => (
                              <div
                                key={availableSubItem.id}
                                className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg mb-2"
                              >
                                <div className="relative w-10 h-10 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                                  {availableSubItem.image_url ? (
                                    availableSubItem.image_url.startsWith('data:') ? (
                                      <img
                                        src={availableSubItem.image_url}
                                        alt={availableSubItem.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Image
                                        src={availableSubItem.image_url}
                                        alt={availableSubItem.name}
                                        fill
                                        className="object-cover"
                                        sizes="40px"
                                      />
                                    )
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-[8px] text-gray-400">Resim yok</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{availableSubItem.name}</p>
                                  {availableSubItem.price && (
                                    <p className="text-[10px] text-[#a42a2a] font-semibold">
                                      {availableSubItem.price.toLocaleString('tr-TR')} TL
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-100 flex-shrink-0"
                                  onClick={() => handleAddSubItem(item.id, availableSubItem)}
                                  title="Parçayı ekle"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t p-4 space-y-3 bg-gray-50">
              <Button
                onClick={handleWhatsAppContact}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp ile İletişime Geç
              </Button>

              <Button
                onClick={clearCart}
                variant="outline"
                className="w-full"
              >
                Sepeti Temizle
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

'use client';

import { X, Minus, Plus, Trash2, MessageCircle, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';

type CartSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { items, removeFromCart, removeItemFromPackage, updateQuantity, clearCart, generateWhatsAppMessage } = useCart();
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set());

  const handleWhatsAppContact = () => {
    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/905539019490?text=${message}`, '_blank');
    // WhatsApp'a yönlendirme yapıldıktan sonra sepeti temizle
    clearCart();
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
                  <div
                    key={item.id}
                    className={`border rounded-lg hover:shadow-md transition-shadow ${
                      item.type === 'package' ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    {/* Ana ürün/paket kartı */}
                    <div className="flex gap-3 p-3">
                      <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        {item.type === 'package' && (
                          <div className="absolute top-1 left-1 z-10 bg-blue-600 text-white rounded-full p-1">
                            <Package className="h-3 w-3" />
                          </div>
                        )}
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-xs">Resim yok</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm line-clamp-2">
                              {item.type === 'package' && (
                                <span className="inline-block mr-1">📦</span>
                              )}
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.store_type === 'premium'
                                ? 'Kavi Premium'
                                : 'Kavi Home'}
                            </p>
                            {item.type === 'package' && item.packageItems && (
                              <p className="text-xs text-blue-600 mt-1 font-medium">
                                {item.packageItems.length} ürün
                              </p>
                            )}
                            {item.price && (
                              <p className="text-sm font-bold text-[#a42a2a] mt-1">
                                {item.price.toLocaleString('tr-TR')} TL
                              </p>
                            )}
                          </div>
                          {item.type === 'package' && item.packageItems && item.packageItems.length > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                const newExpanded = new Set(expandedPackages);
                                if (newExpanded.has(item.id)) {
                                  newExpanded.delete(item.id);
                                } else {
                                  newExpanded.add(item.id);
                                }
                                setExpandedPackages(newExpanded);
                              }}
                            >
                              {expandedPackages.has(item.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
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

                    {/* Paket içeriği (genişletilmiş durumda) */}
                    {item.type === 'package' && item.packageItems && item.packageItems.length > 0 && expandedPackages.has(item.id) && (
                      <div className="border-t bg-white rounded-b-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Paket İçeriği:</p>
                        {item.packageItems.map((pkgItem) => (
                          <div
                            key={pkgItem.id}
                            className="flex gap-2 p-2 bg-gray-50 rounded-lg items-center"
                          >
                            <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                              {pkgItem.image_url ? (
                                <Image
                                  src={pkgItem.image_url}
                                  alt={pkgItem.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <span className="text-xs">-</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium line-clamp-1">
                                {pkgItem.name}
                              </p>
                              {pkgItem.price && (
                                <p className="text-xs text-gray-600">
                                  {pkgItem.price.toLocaleString('tr-TR')} TL
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeItemFromPackage(item.id, pkgItem.id)}
                              title="Ürünü paketten kaldır"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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

'use client';

import { X, Minus, Plus, Trash2, MessageCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

type CartSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { items, removeFromCart, removeProductFromPackage, updateQuantity, clearCart, generateWhatsAppMessage } = useCart();

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
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-sm line-clamp-2">
                                {item.type === 'package' && '📦 '}
                                {item.name}
                              </h3>
                              {item.type === 'package' && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  Paket
                                </span>
                              )}
                            </div>
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

                    {/* Paket İçindeki Ürünler */}
                    {item.type === 'package' && item.packageProducts && item.packageProducts.length > 0 && (
                      <div className="ml-4 pl-4 border-l-2 border-blue-200 space-y-2">
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Paket İçeriği:
                        </p>
                        {item.packageProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="relative w-10 h-10 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                              {product.image_url ? (
                                product.image_url.startsWith('data:') ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Image
                                    src={product.image_url}
                                    alt={product.name}
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
                              <p className="text-xs font-medium truncate">{product.name}</p>
                              {product.price && (
                                <p className="text-[10px] text-gray-500">
                                  {product.price.toLocaleString('tr-TR')} TL
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeProductFromPackage(item.id, product.id)}
                              title="Paketten kaldır"
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

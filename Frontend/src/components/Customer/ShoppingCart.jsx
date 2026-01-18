import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

const ShoppingCart = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const [selectedItems, setSelectedItems] = useState(
    cartItems.map((item) => item.product._id)
  );

  // Update selectedItems when cartItems change
  useEffect(() => {
    setSelectedItems(cartItems.map((item) => item.product._id));
  }, [cartItems]);

  if (!isOpen) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100';
    if (imagePath.startsWith('http')) return imagePath;
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  };

  const toggleSelect = (productId) => {
    setSelectedItems((prev) => {
      const productIdStr = String(productId);
      return prev.map(String).includes(productIdStr)
        ? prev.filter((id) => String(id) !== productIdStr)
        : [...prev, productId];
    });
  };

  const selectedItemsData = cartItems.filter((item) => {
    const itemProductId = String(item.product._id || item.product.id);
    return selectedItems.map(String).includes(itemProductId);
  });

  const subtotal = selectedItemsData.reduce(
    (total, item) => total + (item.product.price || 0) * item.quantity,
    0
  );
  const discount = 50000; // Example discount
  const total = subtotal - discount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full md:w-96 h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Sản phẩm</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">Giỏ hàng trống</p>
              <Link
                to="/san-pham"
                onClick={onClose}
                className="inline-block bg-[#2d5016] text-white px-6 py-2 rounded-lg hover:bg-[#1f350d] transition"
              >
                Mua Ngay
              </Link>
            </div>
          ) : (
            cartItems.map((item) => {
              const itemProductId = item.product._id || item.product.id;
              const isSelected = selectedItems.map(String).includes(String(itemProductId));
              const originalPrice = item.product.originalPrice || item.product.listedPrice || item.product.price;
              const currentPrice = item.product.price || item.product.listedPrice || 0;

              return (
                <div key={itemProductId} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(itemProductId)}
                      className="mt-1 w-5 h-5 text-[#2d5016]"
                    />
                    <img
                      src={getImageUrl(item.product.images?.[0] || item.product.image)}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {item.product.name}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <button
                          onClick={() => updateQuantity(itemProductId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center border rounded"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(itemProductId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center border rounded"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-800">
                            {formatPrice(currentPrice * item.quantity)}
                          </span>
                          {originalPrice && originalPrice > currentPrice && (
                            <span className="block text-sm text-gray-500 line-through">
                              {formatPrice(originalPrice * item.quantity)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(itemProductId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t p-4 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Giảm giá</span>
                <span className="text-red-500">-{formatPrice(discount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Tổng</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Link
              to="/thanh-toan"
              onClick={onClose}
              className="block w-full bg-[#2d5016] text-white text-center py-3 rounded-lg hover:bg-[#1f350d] transition font-semibold"
            >
              Thanh Toán
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;


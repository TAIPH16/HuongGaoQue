import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const [selectedItems, setSelectedItems] = useState(
    cartItems.map((item) => item.product._id)
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const toggleSelect = (productId) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectedItemsData = cartItems.filter((item) =>
    selectedItems.includes(item.product._id)
  );

  const subtotal = selectedItemsData.reduce(
    (total, item) => total + (item.product.listedPrice || 0) * item.quantity,
    0
  );

  const totalDiscount = selectedItemsData.reduce(
    (total, item) => {
      const listedPrice = item.product.listedPrice || 0;
      const discountPercent = item.product.discountPercent || 0;
      const discountAmount = listedPrice * (discountPercent / 100);
      return total + discountAmount * item.quantity;
    },
    0
  );

  const total = subtotal - totalDiscount;

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Giỏ Hàng</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 mx-auto mb-6 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng của bạn đang trống</h2>
              <p className="text-gray-600 mb-8">
                Chưa có sản phẩm nào trong giỏ hàng. Hãy mua sắm để làm đầy giỏ hàng của bạn!
              </p>
              <Link
                to="/san-pham"
                className="inline-block bg-[#2d5016] text-white px-8 py-3 rounded-lg hover:bg-[#1f350d] transition font-semibold"
              >
                Mua Ngay
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const isSelected = selectedItems.includes(item.product._id);
                
                const listedPrice = item.product.listedPrice || 0;
                const discountPercent = item.product.discountPercent || 0;
                const finalPrice = listedPrice * (1 - discountPercent / 100);

                return (
                  <div key={item.product._id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.product._id)}
                        className="mt-1 w-5 h-5 text-[#2d5016]"
                      />
                      <img
                        src={item.product.images?.[0] || item.product.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {item.product.name}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center border rounded"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center border rounded"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-gray-800">
                              {formatPrice(finalPrice * item.quantity)}
                            </span>
                            {discountPercent > 0 && (
                              <div className='flex items-center gap-2'>
                                <span className="block text-sm text-gray-500 line-through">
                                  {formatPrice(listedPrice * item.quantity)}
                                </span>
                                <span className="block text-sm font-bold text-red-500">
                                  -{discountPercent}%
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Tóm tắt</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Giảm giá</span>
                    <span className="text-red-500">-{formatPrice(totalDiscount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Tổng</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                <Link
                  to="/dia-chi-giao-hang"
                  className="block w-full bg-[#2d5016] text-white text-center py-3 rounded-lg hover:bg-[#1f350d] transition font-semibold"
                >
                  Thanh Toán
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CartPage;


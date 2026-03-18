import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import CustomerLayout from "../../components/Customer/CustomerLayout";
import { useCart } from "../../context/CartContext";

const OrderReviewPage = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/gio-hang");
      return;
    }

    // Load selected address from localStorage
    const savedAddress = localStorage.getItem("checkout_address");
    if (savedAddress) {
      setSelectedAddress(JSON.parse(savedAddress));
    } else {
      navigate("/dia-chi-giao-hang");
      return;
    }

    // Load notes
    const savedNotes = localStorage.getItem("checkout_notes");
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [cartItems, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.listedPrice || item.product.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const discount = cartItems.reduce((sum, item) => {
    const price = item.product.listedPrice || item.product.price || 0;
    const percent = item.product.discountPercent || 0;
    const discountPerItem = (price * percent) / 100;
    return sum + discountPerItem * item.quantity;
  }, 0);

  const total = Math.max(0, subtotal - discount);

  const handleContinue = () => {
    navigate("/phuong-thuc-thanh-toan");
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100";
    if (imagePath.startsWith("http")) return imagePath;
    const API_BASE_URL =
      import.meta.env.VITE_API_URL || "http://localhost:3000";
    return `${API_BASE_URL.replace("/api", "")}${imagePath}`;
  };

  if (!selectedAddress) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          Đang tải...
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Duyệt Lại Đơn Hàng</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#2d5016] text-white rounded-full flex items-center justify-center">
                🏠
              </div>
              <span className="ml-2 font-semibold">Địa chỉ</span>
            </div>
            <div className="w-16 h-1 bg-[#2d5016]"></div>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#2d5016] text-white rounded-full flex items-center justify-center">
                📄
              </div>
              <span className="ml-2 font-semibold">Duyệt lại</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center">
                💳
              </div>
              <span className="ml-2 text-gray-600">Thanh toán</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Date */}
            <div>
              <p className="text-gray-600">
                Ngày đặt hàng: {new Date().toLocaleDateString("vi-VN")}
              </p>
            </div>

            {/* Products */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Sản phẩm</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-semibold">Sản phẩm</th>
                    <th className="text-center py-3 font-semibold">Số lượng</th>
                    <th className="text-right py-3 font-semibold">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    const price =
                      item.product.listedPrice || item.product.price || 0;
                    const discountPercent = item.product.discountPercent || 0;
                    const itemPrice =
                      discountPercent > 0
                        ? price * (1 - discountPercent / 100)
                        : price;
                    const totalPrice = itemPrice * item.quantity;
                    const originalTotal = price * item.quantity;

                    return (
                      <tr key={item.product._id} className="border-b">
                        <td className="py-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={getImageUrl(
                                item.product.images?.[0] || item.product.image,
                              )}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div>
                              <p className="font-semibold">
                                {item.product.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-4">
                          <span className="font-semibold">
                            {String(item.quantity).padStart(2, "0")}
                          </span>
                        </td>
                        <td className="text-right py-4">
                          <p className="font-bold">{formatPrice(totalPrice)}</p>
                          {discountPercent > 0 &&
                            originalTotal > totalPrice && (
                              <p className="text-sm text-gray-500 line-through">
                                {formatPrice(originalTotal)}
                              </p>
                            )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Delivery Address */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Địa chỉ giao hàng</h2>
                <Link
                  to="/dia-chi-giao-hang"
                  className="text-[#2d5016] hover:underline flex items-center"
                >
                  <FiEdit className="mr-1" /> Chỉnh sửa
                </Link>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-semibold">Họ tên:</span>{" "}
                  {selectedAddress.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Số điện thoại:</span>{" "}
                  {selectedAddress.phone}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Địa chỉ:</span>{" "}
                  {[
                    selectedAddress.street,
                    selectedAddress.ward,
                    selectedAddress.district,
                    selectedAddress.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  {selectedAddress.country && `, ${selectedAddress.country}`}
                </p>
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-2">Lời nhắn</h2>
                <p className="text-gray-600">{notes}</p>
              </div>
            )}
          </div>

          {/* Summary */}
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
                  <span className="text-red-500">-{formatPrice(discount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Tổng</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <button
                onClick={handleContinue}
                className="w-full bg-[#2d5016] text-white py-3 rounded-lg hover:bg-[#1f350d] transition font-semibold"
              >
                Tiếp Tục
              </button>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default OrderReviewPage;

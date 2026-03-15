import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import CustomerLayout from "../../components/Customer/CustomerLayout";
import { useCart } from "../../context/CartContext";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { customerOrdersAPI } from "../../utils/customerApi";
import ErrorModal from "../../components/Modal/ErrorModal";

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState(
    cartItems.map((item) => item.product._id),
  );

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    country: "Việt Nam",
  });
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    if (customer) {
      setDeliveryAddress({
        name: customer.fullName || "",
        phone: customer.phoneNumber || "",
        address: customer.address?.street || "",
        city: customer.address?.city || "",
        district: customer.address?.district || "",
        ward: customer.address?.ward || "",
        country: customer.address?.country || "Việt Nam",
      });
    }
  }, [customer]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };
  const selectedItemsData = cartItems.filter((item) => {
    const itemProductId = String(item.product._id || item.product.id);
    return selectedItems.map(String).includes(itemProductId);
  });

  // Calculate subtotal correctly
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.product.listedPrice || item.product.price || 0;
    const discountPercent = item.product.discountPercent || 0;
    const itemPrice =
      discountPercent > 0 ? price * (1 - discountPercent / 100) : price;
    return total + itemPrice * item.quantity;
  }, 0);

  const discount = selectedItemsData.reduce((total, item) => {
    const price = item.product.listedPrice || item.product.price || 0;
    const percent = item.product.discountPercent || 0;

    const discountPerItem = (price * percent) / 100;

    return total + discountPerItem * item.quantity;
  }, 0);
  const shippingFee = 30000;
  // Đảm bảo tổng tiền không âm - giảm giá không được vượt quá subtotal
  const maxDiscount = Math.min(discount, subtotal);
  const total = Math.max(0, subtotal + shippingFee);

  const handleCheckout = async () => {
    if (!customer) {
      setErrorModal({
        isOpen: true,
        message: "Vui lòng đăng nhập để đặt hàng",
      });
      return;
    }

    if (cartItems.length === 0) {
      setErrorModal({ isOpen: true, message: "Giỏ hàng trống" });
      return;
    }

    // Validate delivery address
    if (
      !deliveryAddress.name ||
      !deliveryAddress.phone ||
      !deliveryAddress.address
    ) {
      setErrorModal({
        isOpen: true,
        message: "Vui lòng điền đầy đủ thông tin địa chỉ giao hàng",
      });
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          product: item.product._id || item.product.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          name: deliveryAddress.name,
          phone: deliveryAddress.phone,
          address: deliveryAddress.address,
          city: deliveryAddress.city || "",
          district: deliveryAddress.district || "",
          ward: deliveryAddress.ward || "",
          country: deliveryAddress.country || "Việt Nam",
          fullAddress: `${deliveryAddress.address}${deliveryAddress.ward ? ", " + deliveryAddress.ward : ""}${deliveryAddress.district ? ", " + deliveryAddress.district : ""}${deliveryAddress.city ? ", " + deliveryAddress.city : ""}`,
        },
        paymentMethod: paymentMethod,
        discountAmount: maxDiscount,
        shippingFee: shippingFee,
        notes: notes,
      };

      const response = await customerOrdersAPI.create(orderData);
      clearCart();
      setShowSuccessModal(true);
    } catch (error) {
      setErrorModal({
        isOpen: true,
        message:
          error.response?.data?.message ||
          "Đặt hàng thất bại, vui lòng thử lại",
      });
    } finally {
      setLoading(false);
    }
  };

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
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center space-x-4"
                  >
                    <img
                      src={
                        item.product.images?.[0] ||
                        item.product.image ||
                        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100"
                      }
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      {(() => {
                        const price =
                          item.product.listedPrice || item.product.price || 0;
                        const discountPercent =
                          item.product.discountPercent || 0;
                        const itemPrice =
                          discountPercent > 0
                            ? price * (1 - discountPercent / 100)
                            : price;
                        const totalPrice = itemPrice * item.quantity;
                        return (
                          <>
                            <p className="font-bold">
                              {formatPrice(totalPrice)}
                            </p>
                            {discountPercent > 0 && (
                              <p className="text-sm text-gray-500 line-through">
                                {formatPrice(price * item.quantity)}
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
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
                <p>
                  <strong>Họ tên:</strong> {deliveryAddress.name}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {deliveryAddress.phone}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {deliveryAddress.address}
                </p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Phương thức thanh toán</h2>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-[#2d5016] focus:ring-[#2d5016]"
                  />
                  <div>
                    <span className="font-semibold block">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                    <span className="text-sm text-gray-500">
                      Bạn sẽ thanh toán khi nhận được hàng
                    </span>
                  </div>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online"
                    checked={paymentMethod === "Online"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-[#2d5016] focus:ring-[#2d5016]"
                  />
                  <div>
                    <span className="font-semibold block">
                      Chuyển khoản / VNPAY
                    </span>
                    <span className="text-sm text-gray-500">
                      Thanh toán qua chuyển khoản ngân hàng hoặc VNPAY
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white border rounded-lg p-6">
              <label className="block font-semibold mb-2">Lời nhắn</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú về thông tin xuất hoá đơn, thông tin bổ sung....."
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                rows={4}
              />
            </div>
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
                  <span className="text-red-500">
                    -{formatPrice(maxDiscount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Tổng</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading || !customer || cartItems.length === 0}
                className="block w-full bg-[#2d5016] text-white text-center py-3 rounded-lg hover:bg-[#1f350d] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xử lý..." : "Tiếp Tục"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Đơn hàng đã đặt thành công
            </h2>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã mua sắm! Đơn đặt hàng của bạn đang được vận chuyển.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/don-hang"
                className="flex-1 border-2 border-[#2d5016] text-[#2d5016] py-2 rounded-lg hover:bg-green-50 transition"
              >
                Xem Đơn Hàng
              </Link>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/");
                }}
                className="flex-1 bg-[#2d5016] text-white py-2 rounded-lg hover:bg-[#1f350d] transition"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: "" })}
        title="Lỗi"
        message={errorModal.message}
      />
    </CustomerLayout>
  );
};

export default CheckoutPage;

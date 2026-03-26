import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import CustomerLayout from "../../components/Customer/CustomerLayout";
import { useCart } from "../../context/CartContext";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { customerOrdersAPI, vnpayAPI } from "../../utils/customerApi";
import ErrorModal from "../../components/Modal/ErrorModal";

const PaymentMethodPage = () => {
  const { cartItems, clearCart } = useCart();
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer"); // 'bank_transfer' or 'vnpay'
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  useEffect(() => {
    if (!customer) {
      navigate("/");
      return;
    }

    if (cartItems.length === 0) {
      navigate("/gio-hang");
      return;
    }

    // Check if address is selected
    const savedAddress = localStorage.getItem("checkout_address");
    if (!savedAddress) {
      navigate("/dia-chi-giao-hang");
      return;
    }
  }, [customer, cartItems, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  // --- START FIX: Sửa lại logic tính toán đồng bộ với OrderReviewPage ---

  // 1. Tính Tạm tính (Tổng tiền gốc chưa giảm giá)
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.listedPrice || item.product.price || 0;
    return sum + price * item.quantity;
  }, 0);

  // 2. Tính Giảm giá (Tổng số tiền được giảm từ các sản phẩm)
  const discount = cartItems.reduce((sum, item) => {
    const price = item.product.listedPrice || item.product.price || 0;
    const percent = item.product.discountPercent || 0;
    const discountPerItem = (price * percent) / 100;
    return sum + discountPerItem * item.quantity;
  }, 0);

  const shippingFee = 30000;

  // 3. Tính Tổng (Tổng tiền phải thanh toán)
  const total = Math.max(0, subtotal - discount + shippingFee);

  // --- END FIX ---

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const selectedAddress = JSON.parse(
        localStorage.getItem("checkout_address"),
      );
      const notes = localStorage.getItem("checkout_notes") || "";

      const orderData = {
        items: cartItems.map((item) => ({
          product: item.product._id || item.product.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          street: selectedAddress.street || "",
          ward: selectedAddress.ward || "",
          district: selectedAddress.district || "",
          city: selectedAddress.city || "",
          country: selectedAddress.country || "Việt Nam",
          fullAddress:
            [
              selectedAddress.street,
              selectedAddress.ward,
              selectedAddress.district,
              selectedAddress.city,
            ]
              .filter(Boolean)
              .join(", ") +
            (selectedAddress.country ? `, ${selectedAddress.country}` : ""),
        },
        paymentMethod: paymentMethod === "vnpay" ? "vnpay" : "cash",
        discountAmount: discount, // Cập nhật biến ở đây
        shippingFee: shippingFee,
        notes: notes,
      };

      const response = await customerOrdersAPI.create(orderData);
      const orderId = response.data?.data?._id || response.data?.data?.id;

      // Nếu thanh toán bằng thẻ (VNPay)
      if (paymentMethod === "vnpay") {
        // Kiểm tra số tiền tối thiểu cho VNPAY (5,000 VND)
        const minAmount = 5000;
        if (total < minAmount) {
          setErrorModal({
            isOpen: true,
            message: `Số tiền đơn hàng quá nhỏ để thanh toán qua VNPAY. Tổng tiền tối thiểu là ${minAmount.toLocaleString("vi-VN")} VND. Tổng tiền hiện tại: ${total.toLocaleString("vi-VN")} VND`,
          });
          setLoading(false);
          return;
        }

        // Tạo URL thanh toán VNPay
        const vnpayResponse = await vnpayAPI.createPaymentUrl({
          orderId,
          amount: total,
          orderInfo: `Thanh toan don hang ${response.data?.data?.orderNumber || orderId}`,
        });

        // Lưu orderId vào localStorage để xử lý sau khi thanh toán
        localStorage.setItem("vnpay_orderId", orderId);

        // Redirect đến trang processing
        navigate(`/thanh-toan-vnpay/processing?orderId=${orderId}`);

        // Redirect đến VNPay
        window.location.href = vnpayResponse.data.paymentUrl;
        return;
      }

      // Nếu chuyển khoản: Tạo đơn hàng và chuyển đến trang thành công
      // Clear checkout data from localStorage
      localStorage.removeItem("checkout_address");
      localStorage.removeItem("checkout_notes");

      // Clear cart
      clearCart();

      // Store order ID for success page
      navigate(`/don-hang-thanh-cong?orderId=${orderId}`);
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
        <h1 className="text-3xl font-bold mb-8">Phương Thức Thanh Toán</h1>

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
            <div className="w-16 h-1 bg-[#2d5016]"></div>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#2d5016] text-white rounded-full flex items-center justify-center">
                💳
              </div>
              <span className="ml-2 font-semibold">Thanh toán</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">
                Chọn phương thức thanh toán
              </h2>
              <div className="space-y-4">
                <label className="flex items-center cursor-pointer p-4 border-2 rounded-lg hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-[#2d5016] mr-4"
                  />
                  <div className="flex-1">
                    <span className="text-lg font-semibold block">
                      Payment cash
                    </span>
                    <span className="text-sm text-gray-500">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </span>
                  </div>
                </label>
                <label className="flex items-center cursor-pointer p-4 border-2 rounded-lg hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === "vnpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-[#2d5016] mr-4"
                  />
                  <div className="flex-1">
                    <span className="text-lg font-semibold block">
                      Payment VNPay
                    </span>
                    <span className="text-sm text-gray-500">
                      Thanh toán trực tiếp bằng thẻ tín dụng/ghi nợ qua VNPay
                    </span>
                  </div>
                </label>
              </div>
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
                  <span className="text-red-500">-{formatPrice(discount)}</span>
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
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#2d5016] text-white py-3 rounded-lg hover:bg-[#1f350d] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xử lý..." : "Tiếp Tục"}
              </button>
            </div>
          </div>
        </div>
      </div>

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

export default PaymentMethodPage;

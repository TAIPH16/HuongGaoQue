import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiChevronDown } from "react-icons/fi";
import CustomerLayout from "../../components/Customer/CustomerLayout";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useCart } from "../../context/CartContext";

const DeliveryAddressPage = () => {
  const { customer } = useCustomerAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    ward: "",
    district: "",
    city: "",
    country: "Việt Nam",
  });

  useEffect(() => {
    if (!customer) {
      navigate("/");
      return;
    }

    if (cartItems.length === 0) {
      navigate("/gio-hang");
      return;
    }

    // Load addresses from customer profile
    if (customer) {
      const customerAddress = {
        _id: "default",
        name: customer.fullName || customer.name || "",
        phone: customer.phoneNumber || customer.phone || "",
        street: customer.address?.street || "",
        ward: customer.address?.ward || "",
        district: customer.address?.district || "",
        city: customer.address?.city || customer.region || "",
        country: customer.address?.country || "Việt Nam",
        isDefault: true,
      };

      if (
        customerAddress.name ||
        customerAddress.phone ||
        customerAddress.street
      ) {
        setAddresses([customerAddress]);
        setSelectedAddressId("default");
      }
    }
  }, [customer, cartItems, navigate]);

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddAddress = () => {
    if (!formData.name || !formData.phone || !formData.street) {
      alert(
        "Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Số điện thoại, Địa chỉ)",
      );
      return;
    }

    const newAddress = {
      _id: Date.now().toString(),
      ...formData,
      isDefault: false,
    };

    setAddresses([...addresses, newAddress]);
    setSelectedAddressId(newAddress._id);
    setFormData({
      name: "",
      phone: "",
      street: "",
      ward: "",
      district: "",
      city: "",
      country: "Việt Nam",
    });
    setShowAddForm(false);
  };

  const handleEditAddress = (addressId) => {
    const address = addresses.find((a) => a._id === addressId);
    if (address) {
      setFormData({
        name: address.name,
        phone: address.phone,
        street: address.street,
        ward: address.ward || "",
        district: address.district || "",
        city: address.city || "",
        country: address.country || "Việt Nam",
      });
      setShowAddForm(true);
      // Remove the old address to be replaced
      setAddresses(addresses.filter((a) => a._id !== addressId));
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
      }
    }
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      setAddresses(addresses.filter((a) => a._id !== addressId));
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
      }
    }
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      alert("Vui lòng chọn một địa chỉ giao hàng");
      return;
    }

    const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
    // Store selected address in localStorage for next step
    localStorage.setItem("checkout_address", JSON.stringify(selectedAddress));
    navigate("/duyet-lai-don-hang");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  // --- START FIX: Sửa lại logic tính toán ở đây ---

  // 1. Tính Tạm tính (Tổng tiền gốc chưa giảm giá)
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.product.listedPrice || item.product.price || 0;
    return total + price * item.quantity;
  }, 0);

  // 2. Tính Giảm giá (Tổng số tiền được giảm từ các sản phẩm)
  const discount = cartItems.reduce((sum, item) => {
    const price = item.product.listedPrice || item.product.price || 0;
    const percent = item.product.discountPercent || 0;
    const discountPerItem = (price * percent) / 100;
    return sum + discountPerItem * item.quantity;
  }, 0);

  // 3. Tính Tổng (Tổng tiền phải thanh toán)
  const total = subtotal - discount;

  // --- END FIX ---

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Địa Chỉ Giao Hàng</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#2d5016] text-white rounded-full flex items-center justify-center font-bold">
                🏠
              </div>
              <span className="ml-2 font-semibold text-[#2d5016]">Địa chỉ</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center">
                📄
              </div>
              <span className="ml-2 text-gray-600">Duyệt lại</span>
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
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700">
                Địa chỉ bạn muốn sử dụng có hiển thị bên dưới không? Nếu vậy,
                hãy nhấp vào nút "Gửi đến địa chỉ này" tương ứng. Hoặc bạn có
                thể nhập một địa chỉ giao hàng mới.
              </p>
            </div>

            {/* Address List */}
            <div>
              <h2 className="text-xl font-bold mb-4">Chọn địa chỉ giao hàng</h2>
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`border-2 rounded-lg p-4 ${
                      selectedAddressId === address._id
                        ? "border-[#2d5016] bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex items-center mr-4 mt-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedAddressId === address._id
                              ? "border-[#2d5016] bg-[#2d5016]"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAddressId === address._id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 mb-2">
                          {address.name}
                        </p>
                        <p className="text-gray-600 mb-1">
                          Số điện thoại: {address.phone}
                        </p>
                        <p className="text-gray-600">
                          {[
                            address.street,
                            address.ward,
                            address.district,
                            address.city,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                          {address.country && `, ${address.country}`}
                        </p>
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => handleEditAddress(address._id)}
                            className="text-[#2d5016] hover:underline text-sm"
                          >
                            Chỉnh sửa
                          </button>
                          {!address.isDefault && (
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Xóa bỏ
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedAddressId !== address._id && (
                      <button
                        onClick={() => handleSelectAddress(address._id)}
                        className="mt-4 w-full bg-[#2d5016] text-white py-2 rounded-lg hover:bg-[#1f350d] transition"
                      >
                        Gửi đến địa chỉ này
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Address */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <h2 className="text-xl font-bold">Thêm địa chỉ giao hàng</h2>
                <FiChevronDown
                  className={`w-5 h-5 transition-transform ${showAddForm ? "rotate-180" : ""}`}
                />
              </div>
              {showAddForm && (
                <div className="bg-white border rounded-lg p-6 space-y-4">
                  <p className="text-gray-600 text-sm mb-4">
                    Thêm vào một địa chỉ giao hàng mới, điền tất cả vào phiếu
                    thông tin để cập nhật địa chỉ giao hàng
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ tên *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ (Đường, số nhà) *
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phường/Xã
                      </label>
                      <input
                        type="text"
                        name="ward"
                        value={formData.ward}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quận/Huyện
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tỉnh/Thành phố
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quốc gia
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddAddress}
                    className="w-full bg-[#2d5016] text-white py-3 rounded-lg hover:bg-[#1f350d] transition font-semibold"
                  >
                    Thêm địa chỉ
                  </button>
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Thông tin bổ sung</h2>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lời nhắn
              </label>
              <textarea
                placeholder="Ghi chú về thông tin xuất hoá đơn, thông tin bổ sung..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                rows={4}
                onChange={(e) =>
                  localStorage.setItem("checkout_notes", e.target.value)
                }
              />
              <p className="text-xs text-gray-500 mt-2">
                Bằng cách cung cấp số điện thoại của mình, bạn đồng ý nhận các
                ưu đãi và lời nhắc bằng tin nhắn văn bản
              </p>
            </div>
          </div>

          {/* Summary Sidebar */}
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
                disabled={!selectedAddressId}
                className="w-full bg-[#2d5016] text-white py-3 rounded-lg hover:bg-[#1f350d] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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

export default DeliveryAddressPage;

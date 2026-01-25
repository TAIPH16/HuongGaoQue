import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEdit, FiEye, FiEyeOff, FiX, FiCheck } from "react-icons/fi";
import CustomerLayout from "../../components/Customer/CustomerLayout";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useAuth } from "../../context/AuthContext";
import { profileAPI } from "../../utils/profileApi";

const ProfilePage = () => {
  const { customer, logout: customerLogout, setCustomer } = useCustomerAuth();
  const { user: adminUser, logout: adminLogout, setUser } = useAuth();
  const navigate = useNavigate();

  // Determine if user is admin or customer
  const isAdmin =
    !!adminUser && (adminUser.role === "admin" || adminUser.role === "staff");
  const currentUser = isAdmin ? adminUser : customer;

  // Edit states for each section
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingBank, setEditingBank] = useState(false);
  const [editingNotifications, setEditingNotifications] = useState(false);
  const [editingSecurity, setEditingSecurity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Form data states
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || "",
    email: currentUser?.email || "",
    phoneNumber: currentUser?.phoneNumber || "",
    dateOfBirth: currentUser?.dateOfBirth
      ? new Date(currentUser.dateOfBirth).toISOString().split("T")[0]
      : "",
    address: {
      street: currentUser?.address?.street || "",
      ward: currentUser?.address?.ward || "",
      district: currentUser?.address?.district || "",
      city: currentUser?.address?.city || "",
      country: currentUser?.address?.country || "Việt Nam",
    },
    bankInfo: {
      accountHolder:
        currentUser?.settlementAccount?.accountHolder ||
        currentUser?.bankInfo?.accountHolder ||
        "",
      bankName:
        currentUser?.settlementAccount?.bankName ||
        currentUser?.bankInfo?.bankName ||
        "",
      accountNumber:
        currentUser?.settlementAccount?.accountNumber ||
        currentUser?.bankInfo?.accountNumber ||
        "",
      password:
        currentUser?.settlementAccount?.password ||
        currentUser?.bankInfo?.password ||
        "",
    },
    notifications: {
      general: currentUser?.accountSettings?.notifications?.general !== false,
      orders: currentUser?.accountSettings?.notifications?.orders !== false,
      promotions:
        currentUser?.accountSettings?.notifications?.promotions !== false,
      system: currentUser?.accountSettings?.notifications?.system !== false,
    },
    security: {
      sms: currentUser?.securitySettings?.sms !== false,
      email: currentUser?.securitySettings?.email !== false,
    },
  });

  // Update form data when user changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || "",
        email: currentUser.email || "",
        phoneNumber: currentUser.phoneNumber || "",
        dateOfBirth: currentUser.dateOfBirth
          ? new Date(currentUser.dateOfBirth).toISOString().split("T")[0]
          : "",
        address: {
          street: currentUser.address?.street || "",
          ward: currentUser.address?.ward || "",
          district: currentUser.address?.district || "",
          city: currentUser.address?.city || "",
          country: currentUser.address?.country || "Việt Nam",
        },
        bankInfo: {
          accountHolder:
            currentUser.settlementAccount?.accountHolder ||
            currentUser.bankInfo?.accountHolder ||
            "",
          bankName:
            currentUser.settlementAccount?.bankName ||
            currentUser.bankInfo?.bankName ||
            "",
          accountNumber:
            currentUser.settlementAccount?.accountNumber ||
            currentUser.bankInfo?.accountNumber ||
            "",
          password:
            currentUser.settlementAccount?.password ||
            currentUser.bankInfo?.password ||
            "",
        },
        notifications: {
          general:
            currentUser.accountSettings?.notifications?.general !== false,
          orders: currentUser.accountSettings?.notifications?.orders !== false,
          promotions:
            currentUser.accountSettings?.notifications?.promotions !== false,
          system: currentUser.accountSettings?.notifications?.system !== false,
        },
        security: {
          sms: currentUser.securitySettings?.sms !== false,
          email: currentUser.securitySettings?.email !== false,
        },
      });
    }
  }, [currentUser]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const parts = field.split(".");
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        }));
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: value,
            },
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };
  const validatePhoneNumber = (phone) => {
    if (!phone) return "Vui lòng nhập số điện thoại";

    const trimmed = phone.trim();
    const phoneRegex = /^0\d{9}$/;

    if (!phoneRegex.test(trimmed)) {
      return "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0";
    }

    return "";
  };

  const handleSave = async (section) => {
    // setLoading(true);
    setError("");
    setSuccess("");
    if (section === "personal") {
      const phoneErr = validatePhoneNumber(formData.phoneNumber);
      if (phoneErr) {
        setPhoneError(phoneErr);
        return; // ❌ dừng luôn, không call API
      } else {
        setPhoneError("");
      }
    }
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      if (section === "personal") {
        formDataToSend.append("fullName", formData.fullName);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("phoneNumber", formData.phoneNumber);
        if (formData.dateOfBirth) {
          formDataToSend.append("dateOfBirth", formData.dateOfBirth);
        }
        formDataToSend.append("address", JSON.stringify(formData.address));
      } else if (section === "bank") {
        formDataToSend.append(
          "settlementAccount",
          JSON.stringify(formData.bankInfo),
        );
      } else if (section === "notifications") {
        formDataToSend.append(
          "accountSettings",
          JSON.stringify({
            notifications: formData.notifications,
          }),
        );
      } else if (section === "security") {
        formDataToSend.append(
          "securitySettings",
          JSON.stringify(formData.security),
        );
      }

      let response;
      if (isAdmin) {
        response = await profileAPI.updateAdmin(formDataToSend);
      } else {
        response = await profileAPI.updateCustomer(formDataToSend);
      }

      // Update context
      if (isAdmin) {
        setUser(response.data.data);
        localStorage.setItem("user", JSON.stringify(response.data.data));
      } else {
        setCustomer(response.data.data);
        localStorage.setItem("customer", JSON.stringify(response.data.data));
      }

      setSuccess("Cập nhật thông tin thành công!");
      if (section === "personal") setEditingPersonal(false);
      if (section === "bank") setEditingBank(false);
      if (section === "notifications") setEditingNotifications(false);
      if (section === "security") setEditingSecurity(false);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin",
      );
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-12">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <span>📊</span>
                  <span>Dashboard</span>
                </Link>
              )}
              <Link
                to="/ho-so"
                className="flex items-center space-x-3 p-3 bg-green-100 text-[#2d5016] rounded-lg font-semibold"
              >
                <span>👤</span>
                <span>Hồ sơ cá nhân</span>
              </Link>
              {!isAdmin && (
                <>
                  <Link
                    to="/don-hang"
                    className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <span>📦</span>
                    <span>Thông tin đơn hàng</span>
                  </Link>
                  <Link
                    to="/da-thich"
                    className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <span>❤️</span>
                    <span>Đã thích</span>
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  if (isAdmin) {
                    adminLogout();
                  } else {
                    customerLogout();
                  }
                  navigate("/");
                }}
                className="flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg w-full text-left"
              >
                <span>🚪</span>
                <span>Thoát</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Banner */}
            <div className="relative h-48 bg-gradient-to-r from-green-400 to-green-600 rounded-t-lg mb-16">
              <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                <div className="w-32 h-32 bg-white rounded-full border-4 border-white flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
              </div>
              <button className="absolute top-4 right-4 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100">
                <FiEdit />
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="ml-40 mb-4">
                <h2 className="text-2xl font-bold">
                  {currentUser?.fullName || "Nguyen Hoang"}
                </h2>
                <p className="text-gray-600">
                  {currentUser?.email || "Example@gmail.com"}
                </p>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Thông tin cá nhân</h3>
                {!editingPersonal ? (
                  <button
                    onClick={() => setEditingPersonal(true)}
                    className="text-[#2d5016] hover:underline flex items-center"
                  >
                    <FiEdit className="mr-1" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSave("personal")}
                      disabled={loading}
                      className="text-green-600 hover:text-green-700 flex items-center"
                    >
                      <FiCheck className="mr-1" />
                      Lưu
                    </button>
                    <button
                      onClick={() => {
                        setEditingPersonal(false);
                        // Reset form data
                        if (currentUser) {
                          setFormData((prev) => ({
                            ...prev,
                            fullName: currentUser.fullName || "",
                            email: currentUser.email || "",
                            phoneNumber: currentUser.phoneNumber || "",
                            dateOfBirth: currentUser.dateOfBirth
                              ? new Date(currentUser.dateOfBirth)
                                  .toISOString()
                                  .split("T")[0]
                              : "",
                            address: {
                              street: currentUser.address?.street || "",
                              ward: currentUser.address?.ward || "",
                              district: currentUser.address?.district || "",
                              city: currentUser.address?.city || "",
                              country:
                                currentUser.address?.country || "Việt Nam",
                            },
                          }));
                        }
                      }}
                      className="text-red-600 hover:text-red-700 flex items-center"
                    >
                      <FiX className="mr-1" />
                      Hủy
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Họ tên</p>
                  {editingPersonal ? (
                    <input
                      type="text"
                      value={formData.fullName || ""}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nhập họ tên"
                    />
                  ) : (
                    <p className="font-semibold">{formData.fullName || ""}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ngày sinh</p>
                  {editingPersonal ? (
                    <input
                      type="date"
                      value={formData.dateOfBirth || ""}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="font-semibold">
                      {formData.dateOfBirth
                        ? new Date(formData.dateOfBirth).toLocaleDateString(
                            "vi-VN",
                          )
                        : ""}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  {editingPersonal ? (
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nhập email"
                    />
                  ) : (
                    <p className="font-semibold">{formData.email || ""}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                  {editingPersonal ? (
                    <>
                      <input
                        type="tel"
                        value={formData.phoneNumber || ""}
                        onChange={(e) => {
                          handleInputChange("phoneNumber", e.target.value);
                          setPhoneError(""); // xoá lỗi khi nhập lại
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent
          ${phoneError ? "border-red-500" : "border-gray-300"}`}
                        placeholder="Nhập số điện thoại"
                      />
                      {phoneError && (
                        <p className="text-red-500 text-sm mt-1">
                          {phoneError}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="font-semibold">
                      {formData.phoneNumber || ""}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Địa chỉ</p>
                  {editingPersonal ? (
                    <input
                      type="text"
                      value={formData.address?.street || ""}
                      onChange={(e) =>
                        handleInputChange("address.street", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Địa chỉ chi tiết"
                    />
                  ) : (
                    <p className="font-semibold">
                      {formData.address?.street || ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ProfilePage;

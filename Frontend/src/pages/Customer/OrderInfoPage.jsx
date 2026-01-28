import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useAuth } from '../../context/AuthContext';
import { customerOrdersAPI } from '../../utils/customerApi';
import Toast from '../../components/Customer/Toast';

const OrderInfoPage = () => {
  const { customer, logout: customerLogout } = useCustomerAuth();
  const { user: adminUser, logout: adminLogout } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [logoutToastMessage, setLogoutToastMessage] = useState('');

  const handleLogout = async () => {
    try {
      let result;
      if (customer) {
        result = await customerLogout();
      } else if (adminUser) {
        result = await adminLogout();
      }
      if (result?.message) {
        setLogoutToastMessage(result.message);
        setShowLogoutToast(true);
      }
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const filters = [
    'Tất cả',
    'Chờ xác nhận',
    'Chờ thanh toán',
    'Chờ xác nhận thanh toán',
    'Đã xác nhận',
    'Đang giao hàng',
    'Hoàn thành',
    'Đã huỷ'
  ];

  useEffect(() => {
    if (!customer && !adminUser) {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [customer, adminUser, navigate, activeFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeFilter !== 'Tất cả') {
        params.status = mapStatusToEnglish(activeFilter);
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await customerOrdersAPI.getAll(params);
      setOrders(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const mapStatusToEnglish = (status) => {
    const statusMap = {
      'Chờ xác nhận': 'Pending',
      'Chờ thanh toán': 'WaitingPayment',
      'Chờ xác nhận thanh toán': 'WaitingConfirm',
      'Đã xác nhận': 'Confirmed',
      'Đang giao hàng': 'Shipping',
      'Đã giao hàng': 'Delivered',
      'Hoàn thành': 'Completed',
      'Đã huỷ': 'Cancelled',
      'Thất bại': 'Failed',
      'Hoàn hàng': 'Returned'
    };
    return statusMap[status] || status;
  };

  const mapStatusToVietnamese = (status) => {
    // Normalize to handle case sensitivity if needed, but assuming exact match first
    const s = status;

    // Mapping for both old (lowercase) and new (TitleCase)
    const statusMap = {
      'pending': 'Chờ xác nhận',
      'Pending': 'Chờ xác nhận',

      'waitingpayment': 'Chờ thanh toán',
      'WaitingPayment': 'Chờ thanh toán',

      'waitingconfirm': 'Chờ xác nhận thanh toán',
      'WaitingConfirm': 'Chờ xác nhận thanh toán',

      'confirmed': 'Đã xác nhận',
      'Confirmed': 'Đã xác nhận',

      'paid': 'Đã thanh toán',
      'Paid': 'Đã thanh toán',

      'shipping': 'Đang giao hàng',
      'Shipping': 'Đang giao hàng',

      'delivered': 'Đã giao hàng',
      'Delivered': 'Đã giao hàng',

      'completed': 'Hoàn thành',
      'Completed': 'Hoàn thành',

      'cancelled': 'Đã huỷ',
      'Cancelled': 'Đã huỷ',

      'failed': 'Thất bại',
      'Failed': 'Thất bại',

      'returned': 'Hoàn hàng',
      'Returned': 'Hoàn hàng',

      // Legacy
      'Chờ xác nhận': 'Chờ xác nhận',
      'Đang giao': 'Đang giao hàng'
    };
    return statusMap[s] || s;
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Bạn có chắc muốn chuyển trạng thái đơn hàng?`)) return;

    try {
      await customerOrdersAPI.update(orderId, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      alert('Cập nhật thất bại: ' + (error.response?.data?.message || 'Có lỗi xảy ra'));
    }
  };

  const getStatusColor = (status) => {
    const viStatus = mapStatusToVietnamese(status);
    switch (viStatus) {
      case 'Đang giao hàng':
      case 'Đã giao hàng':
      case 'Đã thanh toán':
      case 'Đã xác nhận':
        return 'text-blue-600';
      case 'Hoàn thành':
        return 'text-green-600';
      case 'Đã huỷ':
      case 'Thất bại':
      case 'Hoàn hàng':
        return 'text-red-600';
      case 'Chờ xác nhận':
      case 'Chờ thanh toán':
      case 'Chờ xác nhận thanh toán':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100';
    if (imagePath.startsWith('http')) return imagePath;
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  };

  const filteredOrders = orders.filter((order) => {
    if (activeFilter !== 'Tất cả') {
      const orderStatus = mapStatusToVietnamese(order.status || order.status);
      return orderStatus === activeFilter;
    }
    if (searchTerm) {
      const orderNumber = order.orderNumber || order._id || '';
      return orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <Link
                to="/ho-so"
                className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <span>👤</span>
                <span>Hồ sơ cá nhân</span>
              </Link>
              <Link
                to="/don-hang"
                className="flex items-center space-x-3 p-3 bg-green-100 text-[#2d5016] rounded-lg font-semibold"
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
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg w-full text-left"
              >
                <span>🚪</span>
                <span>Thoát</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-bold mb-6">Thông Tin Đơn Hàng</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg transition ${activeFilter === filter
                    ? 'bg-[#2d5016] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      fetchOrders();
                    }
                  }}
                  placeholder="Tìm kiếm theo mã đơn hàng"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
                <button
                  onClick={fetchOrders}
                  className="bg-[#2d5016] text-white px-6 py-2 rounded-lg hover:bg-[#1f350d]"
                >
                  🔍
                </button>
              </div>
            </div>

            {/* Orders */}
            {loading ? (
              <div className="text-center py-12">Đang tải...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 mx-auto mb-6 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Chưa có đơn hàng nào</h2>
                <p className="text-gray-600 mb-8">
                  Bạn chưa có đơn hàng nào. Hãy mua sắm để tạo đơn hàng đầu tiên!
                </p>
                <Link
                  to="/san-pham"
                  className="inline-block bg-[#2d5016] text-white px-8 py-3 rounded-lg hover:bg-[#1f350d] transition font-semibold"
                >
                  Mua Ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => {
                  const viStatus = mapStatusToVietnamese(order.status || 'pending');
                  const orderDate = new Date(order.createdAt || order.created_at || Date.now()).toLocaleDateString('vi-VN');
                  const items = order.items || [];

                  return (
                    <div key={order._id || order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="bg-green-100 px-6 py-4 flex items-center justify-between">
                        <span className="font-semibold">Mã vận đơn: {order.orderNumber || order._id}</span>
                        <span className={getStatusColor(order.status)}>
                          {viStatus === 'Hoàn thành' || viStatus === 'Đã huỷ'
                            ? `${viStatus}: ${orderDate}`
                            : `Trạng thái: ${viStatus}`}
                        </span>
                      </div>
                      <div className="p-6">
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">Ngày đặt hàng: {orderDate}</p>
                        </div>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left py-3 font-semibold text-gray-700">Sản phẩm</th>
                              <th className="text-center py-3 font-semibold text-gray-700">Số lượng</th>
                              <th className="text-right py-3 font-semibold text-gray-700">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, pIndex) => {
                              const product = item.product || {};
                              const productName = item.product_name || product.name || 'Sản phẩm không xác định';
                              const quantity = item.quantity || 0;
                              const unitPrice = item.unitPrice || item.price || 0;
                              const discountAmount = item.discountAmount || 0;
                              const itemTotal = item.subtotal || (unitPrice * quantity - discountAmount);
                              const imageUrl = product.images?.[0] || product.image || null;

                              return (
                                <tr key={pIndex} className="border-b">
                                  <td className="py-4">
                                    <div className="flex items-center space-x-4">
                                      <img
                                        src={getImageUrl(imageUrl)}
                                        alt={productName}
                                        className="w-16 h-16 object-cover rounded"
                                      />
                                      <div>
                                        <p className="font-semibold">{productName}</p>
                                        {product._id && (
                                          <p className="text-sm text-gray-600">Mã sản phẩm: {product._id.slice(-8)}</p>
                                        )}
                                        {product.category?.name && (
                                          <p className="text-sm text-gray-600">Phân loại: {product.category.name}</p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="text-center">{quantity}</td>
                                  <td className="text-right">
                                    <p className="font-semibold">{formatPrice(itemTotal)}</p>
                                    {discountAmount > 0 && (
                                      <p className="text-sm text-gray-500 line-through">
                                        {formatPrice(unitPrice * quantity)}
                                      </p>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-gray-200">
                              <td colSpan={2} className="py-4 font-bold text-right text-lg">Thành tiền</td>
                              <td className="py-4 font-bold text-right text-lg text-[#2d5016]">{formatPrice(order.total || order.final_price || 0)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>


                      {/* Action Buttons */}
                      <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-end gap-3 border-t">
                        {(order.status === 'Pending' || order.status === 'WaitingPayment' || order.status === 'pending') && (
                          <button
                            onClick={() => handleUpdateStatus(order._id || order.id, 'Cancelled')}
                            className="px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-50 transition"
                          >
                            Hủy đơn
                          </button>
                        )}

                        {(order.status === 'WaitingPayment' || order.status === 'waitingpayment') && (
                          <button
                            onClick={() => handleUpdateStatus(order._id || order.id, 'WaitingConfirm')}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm"
                          >
                            Tôi đã thanh toán
                          </button>
                        )}

                        {(order.status === 'Shipping' || order.status === 'Delivered' || order.status === 'shipping' || order.status === 'delivered') && (
                          <button
                            onClick={() => handleUpdateStatus(order._id || order.id, 'Completed')}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition shadow-sm"
                          >
                            Đã nhận hàng
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Toast
        message={logoutToastMessage}
        isVisible={showLogoutToast}
        onClose={() => setShowLogoutToast(false)}
        type="success"
      />
    </CustomerLayout>
  );
};

export default OrderInfoPage;


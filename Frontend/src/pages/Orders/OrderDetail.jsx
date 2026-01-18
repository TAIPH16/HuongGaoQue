import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../utils/api';
import MainLayout from '../../components/Layout/MainLayout';
import { FiTrash2, FiPrinter, FiCheckCircle, FiCalendar, FiPackage, FiRotateCcw, FiMail, FiPhone, FiMapPin, FiCreditCard } from 'react-icons/fi';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import SuccessModal from '../../components/Modal/SuccessModal';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });
  const [printModal, setPrintModal] = useState({ isOpen: false });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getById(id);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      await ordersAPI.update(id, { status: 'paid', paymentStatus: 'paid' });
      setConfirmModal({ isOpen: false });
      setSuccessModal({ isOpen: true, message: 'Xác nhận đơn hàng thành công' });
      fetchOrder();
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Có lỗi xảy ra khi cập nhật đơn hàng');
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'paid') {
        updateData.paymentStatus = 'paid';
      }
      await ordersAPI.update(id, updateData);
      setSuccessModal({ isOpen: true, message: `Cập nhật trạng thái đơn hàng thành công: ${getStatusText(newStatus)}` });
      fetchOrder();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Chờ xác nhận',
      paid: 'Đã thanh toán',
      processing: 'Đang xử lý',
      shipping: 'Đang giao',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'paid',
      paid: 'processing',
      processing: 'shipping',
      shipping: 'completed',
    };
    return statusFlow[currentStatus];
  };

  const canUpdateStatus = (currentStatus) => {
    return ['pending', 'paid', 'processing', 'shipping'].includes(currentStatus);
  };

  const handleDelete = async () => {
    try {
      await ordersAPI.delete(id);
      setDeleteModal({ isOpen: false });
      navigate('/orders');
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handlePrint = () => {
    setPrintModal({ isOpen: true });
    setTimeout(() => {
      window.print();
      setPrintModal({ isOpen: false });
    }, 500);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <MainLayout title="Chi tiết đơn hàng">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout title="Chi tiết đơn hàng">
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy đơn hàng</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Chi tiết đơn hàng">
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-600">
          Đơn hàng / Chi tiết đơn hàng
        </div>

        {/* Order ID Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">
            ID: {order.orderNumber || id}
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setDeleteModal({ isOpen: true })}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Xóa đơn hàng"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPrintModal({ isOpen: true })}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
              title="In đơn hàng"
            >
              <FiPrinter className="w-5 h-5" />
            </button>
            {order && order.status === 'pending' && (
              <button
                onClick={() => setConfirmModal({ isOpen: true })}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <FiCheckCircle className="w-5 h-5" />
                <span>Xác nhận</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center space-x-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Chi tiết đơn hàng</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'paid' ? 'bg-green-100 text-green-800' :
                  order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                  order.status === 'shipping' ? 'bg-indigo-100 text-indigo-800' :
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Chi tiết đơn hàng</h3>
              <div className="space-y-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sản phẩm</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Số lượng (kg)</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-3">
                            {item.product?.images?.[0] && (
                              <img
                                src={`http://localhost:3000${item.product.images[0]}`}
                                alt={item.product_name || item.product?.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div>
                              <h4 className="font-medium text-gray-800">{item.product_name || item.product?.name}</h4>
                              <p className="text-sm text-gray-500">
                                Mã sản phẩm: #{item.product?.productId || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Phân loại: {item.product?.category?.name || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {String(item.quantity || 0).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                          {formatPrice(item.subtotal || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Tóm tắt</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="text-gray-800">{formatPrice(order.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="text-gray-800">{formatPrice(order.shippingFee || order.shipping_fee || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phụ thu thuế:</span>
                    <span className="text-gray-800">
                      {formatPrice((order.total || order.final_price || 0) - (order.subtotal || 0) - (order.shippingFee || order.shipping_fee || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                    <span className="text-gray-800">Số tiền phải trả:</span>
                    <span className="text-green-600">{formatPrice(order.total || order.final_price || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Customer Info */}
          <div className="space-y-6">
            {/* Customer */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Khách hàng</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">
                    {order.customer?.fullName?.charAt(0) || 'K'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{order.customer?.fullName || 'Khách hàng'}</p>
                  <p className="text-sm text-gray-500">{order.shippingAddress?.location || order.customer?.region || ''}</p>
                </div>
              </div>
            </div>

            {/* Purchase History */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lịch sử mua hàng</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Ngày đặt hàng:</span>
                  <span className="text-gray-800">{formatDate(order.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FiPackage className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Ngày nhận hàng:</span>
                  <span className="text-gray-800">{formatDate(order.purchaseHistory?.deliveryDate)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FiRotateCcw className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Ngày hoàn trả:</span>
                  <span className="text-gray-800">{formatDate(order.purchaseHistory?.returnDate)}</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin liên hệ</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-800">{order.shippingAddress?.email || order.customer?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FiPhone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-800">{order.shippingAddress?.phone || order.customer?.phoneNumber || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Địa chỉ giao hàng</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <FiMapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{order.shippingAddress?.location || order.customer?.region || ''}</span>
                </div>
                <p className="text-gray-600 pl-6">
                  {order.shippingAddress?.fullAddress || order.shippingAddress?.address || 'N/A'}
                </p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Phương thức thanh toán</h3>
              <div className="flex items-center space-x-2">
                {order.paymentMethod === 'cash' ? (
                  <span className="text-sm text-gray-600">Trả trực tiếp</span>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <FiCreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Số thẻ</p>
                      <p className="text-sm text-gray-600">
                        {order.paymentMethod === 'vnpay' ? '0123 456 789' : '0123 456 789'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Billing Address */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Địa chỉ thanh toán</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <FiMapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{order.shippingAddress?.location || order.customer?.region || ''}</span>
                </div>
                <p className="text-gray-600 pl-6">
                  {order.shippingAddress?.fullAddress || order.shippingAddress?.address || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleDelete}
        title="Xóa đơn hàng"
        message="Sau khi xóa, đơn hàng sẽ không được hoàn tác và thông báo đến người mua."
        type="delete"
        confirmText="Xóa"
      />
      <ConfirmModal
        isOpen={printModal.isOpen}
        onClose={() => setPrintModal({ isOpen: false })}
        onConfirm={handlePrint}
        title="In đơn hàng"
        message="Đơn hàng sẽ được in, vui lòng kiểm tra máy in của bạn"
        type="success"
        confirmText="In Đơn Hàng"
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={handleConfirm}
        title="Xác nhận đơn hàng"
        message="Bạn có chắc chắn muốn xác nhận đơn hàng này?"
        type="success"
        confirmText="Xác nhận"
      />
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        title="Thành công"
        message={successModal.message}
      />
    </MainLayout>
  );
};

export default OrderDetail;


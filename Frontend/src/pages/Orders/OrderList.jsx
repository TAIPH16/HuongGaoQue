import { useState, useEffect } from 'react';
import { ordersAPI } from '../../utils/api';
import MainLayout from '../../components/Layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiTrash2, FiMoreVertical, FiPrinter } from 'react-icons/fi';
import ConfirmModal from '../../components/Modal/ConfirmModal';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, order: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [pagination.currentPage, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 10,
        search: searchTerm,
      };
      if (statusFilter !== 'Tất cả') {
        // Map Vietnamese status to English
        const statusMap = {
          'Chờ xác nhận': 'pending',
          'Đã thanh toán': 'paid',
          'Đã hủy': 'cancelled',
          'Hoàn hàng': 'cancelled',
        };
        params.status = statusMap[statusFilter] || statusFilter;
      }

      const response = await ordersAPI.getAll(params);
      setOrders(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await ordersAPI.delete(deleteModal.order._id);
      setDeleteModal({ isOpen: false, order: null });
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'Đã trả tiền': 'bg-green-100 text-green-800',
      'Đang chờ': 'bg-yellow-100 text-yellow-800',
      'Đã hủy': 'bg-red-100 text-red-800',
      'Hoàn hàng': 'bg-gray-100 text-gray-800',
      'Chờ xác nhận': 'bg-yellow-100 text-yellow-800',
      'Đã thanh toán': 'bg-green-100 text-green-800',
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipping: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <MainLayout title="Quản Lí Đơn Hàng" onSearch={setSearchTerm}>
      <div className="space-y-6">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex space-x-1 p-1 border-b border-gray-200">
            {['Tất cả', 'Chờ xác nhận', 'Đã thanh toán', 'Đã hủy', 'Hoàn hàng'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 text-sm font-medium transition ${
                  statusFilter === tab
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Vận Đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Khách Hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phương Thức</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Không có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(pagination.currentPage - 1) * 10 + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ID: {order.orderNumber || order._id.toString().slice(-5)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xs font-semibold">
                              {order.customer?.fullName?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {order.customer?.fullName || 'Khách hàng'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          {order.paymentMethod === 'cash' ? (
                            <>
                              <span>Trả trực tiếp</span>
                            </>
                          ) : order.paymentMethod === 'vnpay' ? (
                            <>
                              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                <span className="text-white text-xs">●</span>
                              </div>
                              <span>*****819</span>
                            </>
                          ) : (
                            <>
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-white text-xs">●</span>
                              </div>
                              <span>*****819</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatPrice(order.total || order.final_price || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.print()}
                            className="text-gray-600 hover:text-gray-800"
                            title="In đơn hàng"
                          >
                            <FiPrinter className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, order })}
                            className="text-red-600 hover:text-red-800"
                            title="Xóa đơn hàng"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/orders/${order._id}`)}
                            className="text-gray-600 hover:text-gray-800"
                            title="Xem chi tiết"
                          >
                            <FiMoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị {orders.length} trên {pagination.totalOrders || pagination.total || 0} đơn hàng
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                &lt;
              </button>
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const page = pagination.currentPage <= 3 ? i + 1 : pagination.currentPage - 2 + i;
                if (page > pagination.totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setPagination({ ...pagination, currentPage: page })}
                    className={`px-3 py-1 rounded-lg ${
                      page === pagination.currentPage
                        ? 'bg-green-600 text-white'
                        : 'border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, order: null })}
        onConfirm={handleDelete}
        title="Xóa đơn hàng"
        message="Sau khi xóa, đơn hàng sẽ không được hoàn tác và thông báo đến người mua."
        type="delete"
        confirmText="Xóa"
      />
    </MainLayout>
  );
};

export default OrderList;


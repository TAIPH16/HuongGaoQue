import { useEffect, useState } from 'react';
import SellerLayout from '../../components/Seller/SellerLayout';
import { sellerOrdersAPI } from '../../utils/sellerApi';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await sellerOrdersAPI.getAll(filter ? { status: filter } : undefined);
        setOrders(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Không tải được danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filter]);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await sellerOrdersAPI.getAll(filter ? { status: filter } : undefined);
      setOrders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setStatusLoadingId(id);
      await sellerOrdersAPI.updateStatus(id, status);
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái');
      setTimeout(() => setError(''), 3000);
    } finally {
      setStatusLoadingId(null);
    }
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Đơn hàng của tôi</h2>
            <div className="flex items-center space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Pending">Pending</option>
                <option value="WaitingPayment">WaitingPayment</option>
                <option value="WaitingConfirm">WaitingConfirm</option>
                <option value="shipping">Shipping</option>
                <option value="completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Chưa có đơn hàng nào.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mã đơn
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-4 py-3 text-sm text-gray-800">{order.orderNumber || order._id}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString('vi-VN')
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {order.customer?.fullName || order.customer?.name || order.customerName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {new Intl.NumberFormat('vi-VN').format(order.total || 0)}₫
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {order.status || 'Đang xử lý'}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        {/* Action buttons based on status */}
                        {order.status === 'Pending' || order.status === 'WaitingPayment' ? (
                          <button
                            disabled={statusLoadingId === order._id}
                            onClick={() => updateStatus(order._id, 'WaitingConfirm')}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded disabled:opacity-50"
                          >
                            {statusLoadingId === order._id ? 'Đang xử lý...' : 'Xác nhận'}
                          </button>
                        ) : null}
                        {order.status === 'WaitingConfirm' || order.status === 'processing' ? (
                          <button
                            disabled={statusLoadingId === order._id}
                            onClick={() => updateStatus(order._id, 'shipping')}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded disabled:opacity-50"
                          >
                            {statusLoadingId === order._id ? 'Đang xử lý...' : 'Giao hàng'}
                          </button>
                        ) : null}
                        {order.status === 'shipping' ? (
                          <button
                            disabled={statusLoadingId === order._id}
                            onClick={() => updateStatus(order._id, 'completed')}
                            className="px-3 py-1 text-xs bg-indigo-600 text-white rounded disabled:opacity-50"
                          >
                            {statusLoadingId === order._id ? 'Đang xử lý...' : 'Hoàn tất'}
                          </button>
                        ) : null}
                        {(order.status === 'Pending' ||
                          order.status === 'WaitingPayment' ||
                          order.status === 'WaitingConfirm') && (
                          <button
                            disabled={statusLoadingId === order._id}
                            onClick={() => updateStatus(order._id, 'Cancelled')}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded disabled:opacity-50"
                          >
                            {statusLoadingId === order._id ? 'Đang xử lý...' : 'Hủy'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerOrders;



import { useEffect, useState } from 'react';
import SellerLayout from '../../components/Seller/SellerLayout';
import { sellerOrdersAPI } from '../../utils/sellerApi';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [filter, setFilter] = useState('');
  
  // Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Focus detail modal
  const handleViewDetail = async (id) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const res = await sellerOrdersAPI.getById(id);
      setSelectedOrder(res.data.data);
      setOrderItems(res.data.data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được chi tiết đơn hàng');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

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
                        {order.shippingAddress?.name || order.customer?.fullName || order.customer?.name || order.customerName || '-'}
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
                        <button
                          onClick={() => handleViewDetail(order._id)}
                          className="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded mb-1 mr-1"
                        >
                          Chi tiết
                        </button>
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

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder?.orderNumber || '...'}</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold rounded-full w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              {detailLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                </div>
              ) : selectedOrder ? (
                <div className="space-y-6">
                  {/* Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded shadow-sm border">
                      <h4 className="font-semibold text-gray-800 mb-2 border-b pb-2">Thông tin khách hàng</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium text-gray-800">Tên:</span> {selectedOrder.shippingAddress?.name || selectedOrder.customer?.fullName || selectedOrder.customer?.name}</p>
                        <p><span className="font-medium text-gray-800">SĐT:</span> {selectedOrder.shippingAddress?.phone || selectedOrder.customer?.phoneNumber}</p>
                        <p><span className="font-medium text-gray-800">Địa chỉ:</span> {selectedOrder.shippingAddress?.fullAddress}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded shadow-sm border">
                      <h4 className="font-semibold text-gray-800 mb-2 border-b pb-2">Thông tin thanh toán</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium text-gray-800">Trạng thái:</span> <span className="text-blue-600 font-semibold">{selectedOrder.status}</span></p>
                        <p><span className="font-medium text-gray-800">H.thức:</span> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
                        <p><span className="font-medium text-gray-800">Ghi chú:</span> {selectedOrder.notes || 'Không có'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Items Table */}
                  <div className="bg-white rounded shadow-sm border overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                      <h4 className="font-semibold text-gray-800">Sản phẩm</h4>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="py-2 px-4 text-left font-medium">Sản phẩm</th>
                          <th className="py-2 px-4 text-center font-medium">SL</th>
                          <th className="py-2 px-4 text-right font-medium">Đơn giá</th>
                          <th className="py-2 px-4 text-right font-medium">Tạm tính</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orderItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-800">
                                {item.product_name || item.product?.name}
                                {item.variation_name && <span className="block text-xs text-gray-500">Loại: {item.variation_name}</span>}
                            </td>
                            <td className="py-3 px-4 text-center font-medium">{item.quantity}</td>
                            <td className="py-3 px-4 text-right text-gray-600">{(item.price || item.unitPrice)?.toLocaleString('vi-VN')}₫</td>
                            <td className="py-3 px-4 text-right font-semibold text-gray-800">{(item.subtotal)?.toLocaleString('vi-VN')}₫</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Summary */}
                  <div className="flex justify-end">
                    <div className="w-full md:w-1/2 bg-white p-4 rounded shadow-sm border space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Tạm tính ({orderItems.length} sản phẩm):</span>
                        <span className="font-medium text-gray-800">{(selectedOrder.subtotal || 0).toLocaleString('vi-VN')}₫</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phí giao hàng:</span>
                        <span className="font-medium text-gray-800">{(selectedOrder.shippingFee || 0).toLocaleString('vi-VN')}₫</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá:</span>
                        <span className="font-medium">-{(selectedOrder.discountAmount || 0).toLocaleString('vi-VN')}₫</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t font-bold text-lg text-gray-800">
                        <span>Tổng thanh toán:</span>
                        <span className="text-[#2d5016]">{(selectedOrder.total || 0).toLocaleString('vi-VN')}₫</span>
                      </div>
                    </div>
                  </div>
                  
                </div>
              ) : (
                <p className="text-center text-gray-500">Kho dữ liệu trống</p>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-100 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-[#2d5016] text-white font-medium rounded-lg hover:bg-[#1a340c] transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </SellerLayout>
  );
};

export default SellerOrders;



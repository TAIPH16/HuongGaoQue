import { useEffect, useState } from 'react';
import SellerLayout from '../../components/Seller/SellerLayout';
import { sellerOrdersAPI } from '../../utils/sellerApi';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await sellerOrdersAPI.getAll();
        setOrders(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Không tải được danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <SellerLayout>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Đơn hàng của tôi</h2>

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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-4 py-3 text-sm text-gray-800">{order.code || order._id}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString('vi-VN')
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {order.customer?.name || order.customerName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {new Intl.NumberFormat('vi-VN').format(order.totalAmount || 0)}₫
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {order.status || 'Đang xử lý'}
                        </span>
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



import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerLayout from '../../components/Seller/SellerLayout';
import { sellerNotificationsAPI } from '../../utils/sellerApi';

const SellerNotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async (p = page) => {
    try {
      setLoading(true);
      const res = await sellerNotificationsAPI.getAll({ page: p, limit: 20 });
      const data = res.data?.data || res.data || {};
      const list = data.notifications || data.data || [];
      const pagination = data.pagination || {};
      setNotifications(Array.isArray(list) ? list : []);
      setTotalPages(pagination.total_pages || pagination.totalPages || 1);
    } catch (e) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleClick = async (id) => {
    try {
      await sellerNotificationsAPI.markAsRead(id);
    } catch {
      // ignore
    }
    navigate(`/seller/notifications/${id}`);
  };

  const markAll = async () => {
    try {
      await sellerNotificationsAPI.markAllAsRead();
      await fetchNotifications(page);
    } catch {
      // ignore
    }
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Thông báo</h2>
          <button onClick={markAll} className="text-sm text-green-700 hover:underline font-medium">
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Chưa có thông báo</div>
        ) : (
          <div className="bg-white border rounded-lg divide-y">
            {notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => handleClick(n._id)}
                className={`w-full text-left p-4 hover:bg-gray-50 ${
                  n.is_read ? '' : 'bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{n.title}</div>
                    <div className="text-sm text-gray-600 line-clamp-2 mt-1">{n.content}</div>
                  </div>
                  <div className="text-xs text-gray-500 shrink-0">
                    {n.created_at ? new Date(n.created_at).toLocaleString('vi-VN') : ''}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Trước
            </button>
            <div className="px-3 py-2 text-sm text-gray-700">
              Trang {page}/{totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </SellerLayout>
  );
};

export default SellerNotificationsPage;


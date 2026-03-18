import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SellerLayout from '../../components/Seller/SellerLayout';
import { sellerNotificationsAPI } from '../../utils/sellerApi';

const SellerNotificationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOne = async () => {
      try {
        setLoading(true);
        const res = await sellerNotificationsAPI.getById(id);
        const data = res.data?.data || res.data;
        setNotification(data);
        try {
          await sellerNotificationsAPI.markAsRead(id);
        } catch {
          // ignore
        }
      } catch {
        setNotification(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/seller/notifications" className="text-sm text-green-700 hover:underline">
            ← Quay lại
          </Link>
          {notification?.action_url && (
            <button
              onClick={() => navigate(notification.action_url)}
              className="text-sm text-green-700 hover:underline font-medium"
            >
              Mở liên kết
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải...</div>
        ) : !notification ? (
          <div className="text-center py-12 text-gray-500">Thông báo không tồn tại</div>
        ) : (
          <div className="bg-white border rounded-lg p-6">
            <div className="text-xs text-gray-500 mb-2">
              {notification.created_at ? new Date(notification.created_at).toLocaleString('vi-VN') : ''}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{notification.title}</h2>
            <div className="text-gray-800 whitespace-pre-wrap">{notification.content}</div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
};

export default SellerNotificationDetailPage;


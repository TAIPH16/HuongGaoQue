import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { customerNotificationsAPI } from '../../utils/customerApi';

const CustomerNotificationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOne = async () => {
      try {
        setLoading(true);
        const res = await customerNotificationsAPI.getById(id);
        const data = res.data?.data || res.data;
        setNotification(data);
        try {
          await customerNotificationsAPI.markAsRead(id);
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
    <CustomerLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <Link to="/notifications" className="text-sm text-[#2d5016] hover:underline">
            ← Quay lại
          </Link>
          {notification?.action_url && (
            <button
              onClick={() => navigate(notification.action_url)}
              className="text-sm font-medium text-[#2d5016] hover:underline"
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
              {notification.created_at
                ? new Date(notification.created_at).toLocaleString('vi-VN')
                : ''}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{notification.title}</h1>
            <div className="text-gray-800 whitespace-pre-wrap">
              {notification.content}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerNotificationDetailPage;


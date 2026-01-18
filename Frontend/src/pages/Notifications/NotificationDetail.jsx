import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/Layout/MainLayout';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import SuccessModal from '../../components/Modal/SuccessModal';
import ErrorModal from '../../components/Modal/ErrorModal';

const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    fetchNotification();
  }, [id]);

  const fetchNotification = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getById(id);
      setNotification(response.data.data);
      
      // Mark as read when viewing
      if (user) {
        await notificationsAPI.markAsRead(id);
      }
    } catch (error) {
      console.error('Error fetching notification:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Chi Tiết Thông Báo">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!notification) {
    return (
      <MainLayout title="Chi Tiết Thông Báo">
        <div className="text-center text-gray-500">Thông báo không tồn tại</div>
      </MainLayout>
    );
  }

  const handleSoftDelete = async () => {
    try {
      await notificationsAPI.delete(id);
      setDeleteModal({ isOpen: false });
      setSuccessModal({ isOpen: true, message: 'Xóa thông báo thành công' });
      setTimeout(() => {
        navigate('/admin/notifications');
      }, 1500);
    } catch (error) {
      setDeleteModal({ isOpen: false });
      setErrorModal({ 
        isOpen: true, 
        message: error.response?.data?.message || 'Xóa thông báo thất bại' 
      });
    }
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'order':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getTargetAudienceLabel = (audience) => {
    const labels = {
      'all': 'Tất cả người dùng',
      'admin': 'Quản trị viên',
      'staff': 'Nhân viên',
      'user': 'Người dùng',
      'specific': 'Người dùng cụ thể'
    };
    return labels[audience] || audience;
  };

  return (
    <MainLayout title="Chi Tiết Thông Báo">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">{notification.title}</h1>
            <span
              className={`text-sm px-3 py-1 rounded ${getNotificationTypeColor(
                notification.type
              )}`}
            >
              {notification.type}
            </span>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Nội dung</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{notification.content || notification.message || ''}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Đối tượng nhận</h3>
                  <p className="text-gray-900">
                    {getTargetAudienceLabel(notification.target_audience || notification.recipientType)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Trạng thái</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                    {notification.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Ngày tạo</h3>
                  <p className="text-gray-900">
                    {notification.created_at || notification.createdAt 
                      ? new Date(notification.created_at || notification.createdAt).toLocaleString('vi-VN')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Ngày cập nhật</h3>
                  <p className="text-gray-900">
                    {notification.updated_at || notification.updatedAt 
                      ? new Date(notification.updated_at || notification.updatedAt).toLocaleString('vi-VN')
                      : 'N/A'}
                  </p>
                </div>
                {notification.scheduled_at && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Lên lịch gửi</h3>
                    <p className="text-gray-900">
                      {new Date(notification.scheduled_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
                {notification.expires_at && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Hết hạn</h3>
                    <p className="text-gray-900">
                      {new Date(notification.expires_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>

              {notification.action_url && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Liên kết hành động</h3>
                  <a
                    href={notification.action_url}
                    className="text-green-600 hover:text-green-700 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {notification.action_text || notification.action_url}
                  </a>
                </div>
              )}

              {notification.read_count !== undefined && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Số lượt đọc</h3>
                  <p className="text-gray-900">{notification.read_count || 0}</p>
                </div>
              )}

              {notification.total_sent !== undefined && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Tổng số đã gửi</h3>
                  <p className="text-gray-900">{notification.total_sent || 0}</p>
                </div>
              )}

              {notification.delivery_status && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Trạng thái gửi</h3>
                  <p className="text-gray-900">
                    {notification.delivery_status === 'sent' ? 'Đã gửi' :
                     notification.delivery_status === 'pending' ? 'Đang chờ' :
                     notification.delivery_status === 'failed' ? 'Thất bại' :
                     notification.delivery_status === 'partial' ? 'Một phần' :
                     notification.delivery_status}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Quay lại
            </button>
            {(user?.role === 'admin' || user?.role === 'staff') && (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/admin/notifications/${id}/edit`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setDeleteModal({ isOpen: true })}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleSoftDelete}
        title="Xóa thông báo"
        message="Bạn có chắc chắn muốn xóa thông báo này? Thông báo sẽ được đánh dấu là không hoạt động."
        type="delete"
        confirmText="Xóa"
      />
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        title="Thành công"
        message={successModal.message}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="Thất bại"
        message={errorModal.message}
      />
    </MainLayout>
  );
};

export default NotificationDetail;


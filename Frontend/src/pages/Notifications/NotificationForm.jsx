import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/Layout/MainLayout';

const NotificationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_audience: 'all',
    status: 'active',
    scheduled_at: '',
    expires_at: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchNotification();
    }
  }, [id]);

  const fetchNotification = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getById(id);
      const notification = response.data.data;
      setFormData({
        title: notification.title || '',
        content: notification.content || '',
        target_audience: notification.target_audience || 'all',
        status: notification.status || 'active',
        scheduled_at: notification.scheduled_at ? new Date(notification.scheduled_at).toISOString().slice(0, 16) : '',
        expires_at: notification.expires_at ? new Date(notification.expires_at).toISOString().slice(0, 16) : '',
      });
    } catch (error) {
      console.error('Error fetching notification:', error);
      setError('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : undefined,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : undefined,
      };

      if (isEdit) {
        await notificationsAPI.update(id, submitData);
      } else {
        await notificationsAPI.create(submitData);
      }

      navigate('/admin/notifications');
    } catch (error) {
      console.error('Error saving notification:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading && isEdit) {
    return (
      <MainLayout title={isEdit ? 'Chỉnh Sửa Thông Báo' : 'Tạo Thông Báo'}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEdit ? 'Chỉnh Sửa Thông Báo' : 'Tạo Thông Báo'}>
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={200}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="Nhập tiêu đề thông báo"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              maxLength={1000}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="Nhập nội dung thông báo"
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đối tượng nhận <span className="text-red-500">*</span>
            </label>
            <select
              name="target_audience"
              value={formData.target_audience}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="admin">Quản trị viên</option>
              <option value="staff">Nhân viên</option>
              <option value="user">Người dùng</option>
            </select>
          </div>

          {/* Status */}
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          )}

          {/* Scheduled and Expires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lên lịch gửi (tùy chọn)
              </label>
              <input
                type="datetime-local"
                name="scheduled_at"
                value={formData.scheduled_at}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hết hạn (tùy chọn)
              </label>
              <input
                type="datetime-local"
                name="expires_at"
                value={formData.expires_at}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/notifications')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo thông báo'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default NotificationForm;


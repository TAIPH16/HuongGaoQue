import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/Layout/MainLayout';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, [pagination.currentPage, searchTerm, typeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 20,
        search: searchTerm,
      };
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      const response = await notificationsAPI.getAll(params);
      // Handle response structure: response.data.data contains { notifications, pagination }
      const responseData = response.data.data || response.data;
      const notificationsData = responseData.notifications || responseData.data || [];
      const paginationData = responseData.pagination || {};
      
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      setPagination({
        currentPage: paginationData.current_page || paginationData.currentPage || 1,
        totalPages: paginationData.total_pages || paginationData.totalPages || 1,
        totalItems: paginationData.total_items || paginationData.totalItems || 0
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      return;
    }

    try {
      await notificationsAPI.delete(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Lỗi khi xóa thông báo');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
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

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  return (
    <MainLayout title="Quản Lý Thông Báo" onSearch={setSearchTerm}>
      <div className="space-y-6">
        {/* Header with Create Button */}
        {isAdmin && (
          <div className="flex justify-end">
            <button
              onClick={() => navigate('/admin/notifications/add')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
            >
              <span>+</span>
              <span>Tạo Thông Báo</span>
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex space-x-1 p-1 border-b border-gray-200">
            {['all', 'info', 'success', 'warning', 'error', 'order'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2 text-sm font-medium transition ${
                  typeFilter === type
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {type === 'all' ? 'Tất cả' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Người nhận
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Không có thông báo nào
                    </td>
                  </tr>
                ) : (
                  notifications.map((notification) => (
                    <tr key={notification._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {notification.content || notification.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-xs px-2 py-1 rounded ${getNotificationTypeColor(
                            notification.type
                          )}`}
                        >
                          {notification.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {notification.target_audience === 'all'
                          ? 'Tất cả'
                          : notification.target_audience === 'admin'
                          ? 'Quản trị viên'
                          : notification.target_audience === 'user'
                          ? 'Người dùng'
                          : notification.target_audience || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(notification.created_at || notification.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              navigate(`/admin/notifications/${notification._id}`);
                            }}
                            className="text-gray-600 hover:text-gray-900"
                            title="Xem chi tiết"
                          >
                            <FiEye className="w-5 h-5" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => navigate(`/admin/notifications/${notification._id}/edit`)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Chỉnh sửa"
                              >
                                <FiEdit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(notification._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Xóa"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
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
              Hiển thị {notifications.length} trên {pagination.totalItems || 0} thông báo
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
    </MainLayout>
  );
};

export default NotificationList;


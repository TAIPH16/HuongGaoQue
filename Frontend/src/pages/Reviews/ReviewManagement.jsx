import { useEffect, useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../utils/api';
import { FiEdit, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [ratingFilter, setRatingFilter] = useState('Tất cả');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10,
  });
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({
    rating: 5,
    title: '',
    content: '',
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current_page, statusFilter, ratingFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.current_page,
        limit: pagination.items_per_page,
      };

      if (statusFilter !== 'Tất cả') {
        const statusMap = {
          'Hiển thị': 'visible',
          'Ẩn': 'hidden',
          'Đã xóa': 'deleted',
        };
        params.status = statusMap[statusFilter] || statusFilter;
      }

      if (ratingFilter !== 'Tất cả') {
        params.min_rating = ratingFilter;
        params.max_rating = ratingFilter;
      }

      let response;
      if (searchTerm.trim()) {
        response = await api.get('/reviews/search', {
          params: {
            q: searchTerm.trim(),
            ...params,
          },
        });
      } else {
        response = await api.get('/reviews', { params });
      }

      const result = response.data?.data || {};
      setReviews(result.reviews || []);
      setPagination((prev) => ({
        ...prev,
        ...(result.pagination || {}),
      }));
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (review) => {
    setEditingReview(review);
    setEditForm({
      rating: review.rating || 5,
      title: review.title || review.headline || '',
      content: review.content || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value,
    }));
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editingReview) return;

    try {
      await api.put(`/reviews/${editingReview._id}`, {
        rating: editForm.rating,
        title: editForm.title,
        content: editForm.content,
      });
      setActionMessage('Cập nhật đánh giá thành công.');
      setEditingReview(null);
      fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      setActionMessage('Có lỗi xảy ra khi cập nhật đánh giá.');
    }
  };

  const confirmDelete = (review) => {
    setDeleteTarget(review);
  };

  const handleToggleVisibility = async (review) => {
    try {
      await api.delete(`/reviews/${review._id}`);
      setActionMessage(`Đã ${review.status === 'hidden' ? 'hiển thị' : 'ẩn'} đánh giá.`);
      fetchReviews();
    } catch (error) {
      console.error('Error toggling review:', error);
      setActionMessage('Có lỗi xảy ra khi đổi trạng thái đánh giá.');
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/reviews/${deleteTarget._id}`);
      setActionMessage('Xóa/ẩn đánh giá thành công.');
      setDeleteTarget(null);
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      setActionMessage('Có lỗi xảy ra khi xóa đánh giá.');
    }
  };

  const clearMessages = () => {
    setActionMessage('');
  };

  const changePage = (page) => {
    if (page < 1 || page > pagination.total_pages) return;
    setPagination((prev) => ({
      ...prev,
      current_page: page,
    }));
  };

  return (
    <MainLayout title="Quản lý đánh giá sản phẩm" onSearch={setSearchTerm}>
      <div className="space-y-6" onClick={clearMessages}>
        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option>Tất cả</option>
              <option>Hiển thị</option>
              <option>Ẩn</option>
              <option>Đã xóa</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Số sao
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option>Tất cả</option>
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>
                  {star} sao
                </option>
              ))}
            </select>
          </div>
          {actionMessage && (
            <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-1">
              {actionMessage}
            </div>
          )}
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sản phẩm / Mục tiêu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Số sao
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tiêu đề &amp; Nội dung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto" />
                    </td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Không có đánh giá nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  reviews.map((review, index) => (
                    <tr key={review._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {(pagination.current_page - 1) * pagination.items_per_page +
                          index +
                          1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-semibold">
                          {review.productName || review.target_name || 'Sản phẩm'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {review.target_type || 'product'} •{' '}
                          {review.target_id?.toString().slice(-6)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{review.user_id?.fullName || review.user_id?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">
                          {review.user_id?.email || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-yellow-500">
                        {[...Array(review.rating || 0)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                        <div className="font-semibold truncate">
                          {review.title || review.headline || '(Không có tiêu đề)'}
                        </div>
                        <div className="text-xs text-gray-600 line-clamp-2 mt-1">
                          {review.content || '(Không có nội dung)'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                            review.status === 'visible'
                              ? 'bg-green-100 text-green-800'
                              : review.status === 'hidden'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {review.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(review)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Chỉnh sửa đánh giá"
                          >
                            <FiEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleToggleVisibility(review)}
                            className={`${review.status === 'visible' ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                            title={review.status === 'visible' ? "Ẩn đánh giá" : "Hiển thị đánh giá"}
                          >
                            {review.status === 'visible' ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => confirmDelete(review)}
                            className="text-red-600 hover:text-red-800"
                            title="Xóa đánh giá"
                          >
                            <FiTrash2 className="w-5 h-5" />
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
              Hiển thị {reviews.length} trên {pagination.total_items || 0} đánh giá
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => changePage(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                &lt;
              </button>
              {Array.from({ length: Math.min(5, pagination.total_pages || 1) }).map(
                (_, i) => {
                  const basePage = Math.max(
                    1,
                    Math.min(
                      pagination.current_page - 2,
                      (pagination.total_pages || 1) - 4
                    )
                  );
                  const page = basePage + i;
                  if (page > (pagination.total_pages || 1)) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => changePage(page)}
                      className={`px-3 py-1 rounded-lg ${
                        page === pagination.current_page
                          ? 'bg-green-600 text-white'
                          : 'border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
              )}
              <button
                onClick={() => changePage(pagination.current_page + 1)}
                disabled={
                  !pagination.total_pages ||
                  pagination.current_page >= pagination.total_pages
                }
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editingReview && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div
              className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Chỉnh sửa đánh giá</h3>
              <form onSubmit={handleUpdateReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số sao
                  </label>
                  <select
                    name="rating"
                    value={editForm.rating}
                    onChange={handleEditChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                  >
                    {[5, 4, 3, 2, 1].map((star) => (
                      <option key={star} value={star}>
                        {star} sao
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Tiêu đề ngắn gọn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nội dung
                  </label>
                  <textarea
                    name="content"
                    value={editForm.content}
                    onChange={handleEditChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Nội dung đánh giá chi tiết"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingReview(null)}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div
              className="bg-white rounded-lg shadow-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-3">Xóa / Ẩn đánh giá</h3>
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc chắn muốn xóa hoặc ẩn đánh giá này không? Hành động này có thể
                ảnh hưởng đến độ tin cậy của hệ thống đánh giá.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Xóa / Ẩn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ReviewManagement;


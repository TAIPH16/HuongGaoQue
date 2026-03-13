import { useState, useEffect } from 'react';
import { postCategoriesAPI } from '../../utils/api';
import MainLayout from '../../components/Layout/MainLayout';
import { FiPlus, FiFolder, FiEdit, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import SuccessModal from '../../components/Modal/SuccessModal';
import ErrorModal from '../../components/Modal/ErrorModal';
import ConfirmModal from '../../components/Modal/ConfirmModal';

const PostCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Modals
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, categoryId: null });
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, [pagination.currentPage, searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await postCategoriesAPI.getAll({
        page: pagination.currentPage,
        limit: 25,
        search: searchTerm,
      });
      setCategories(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching post categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setIsCreating(true);
      await postCategoriesAPI.create({ 
        name: newCategoryName.trim(), 
        description: newCategoryDescription.trim() 
      });
      setNewCategoryName('');
      setNewCategoryDescription('');
      setSuccessModal({ isOpen: true, message: 'Tạo danh mục bài viết thành công!' });
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      setErrorModal({ 
        isOpen: true, 
        message: error.response?.data?.message || 'Tạo danh mục thất bại, vui lòng thử lại.' 
      });
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setEditName(category.name);
    setEditDescription(category.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  const handleUpdateCategory = async (id) => {
    if (!editName.trim()) {
      setErrorModal({ isOpen: true, message: 'Tên danh mục không được để trống.' });
      return;
    }
    try {
      await postCategoriesAPI.update(id, { 
        name: editName.trim(),
        description: editDescription.trim()
      });
      setSuccessModal({ isOpen: true, message: 'Cập nhật danh mục thành công!' });
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      setErrorModal({ 
        isOpen: true, 
        message: error.response?.data?.message || 'Cập nhật danh mục thất bại.' 
      });
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteModal({ isOpen: true, categoryId: id });
  };

  const handleConfirmDelete = async () => {
    try {
      await postCategoriesAPI.delete(deleteModal.categoryId);
      setSuccessModal({ isOpen: true, message: 'Xoá danh mục thành công!' });
      setDeleteModal({ isOpen: false, categoryId: null });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setDeleteModal({ isOpen: false, categoryId: null });
      setErrorModal({ 
        isOpen: true, 
        message: error.response?.data?.message || 'Xoá danh mục thất bại, có thể danh mục đang chứa bài viết.' 
      });
    }
  };

  return (
    <MainLayout title="Danh Mục Bài Viết" onSearch={setSearchTerm}>
      <div className="space-y-6">
        {/* Breadcrumb / Nav */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 hover:text-green-600 cursor-pointer" onClick={() => navigate('/admin/posts')}>Quản Lý Bài Viết</span>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-800">Danh Mục Bài Viết</span>
          </div>
          
          <div className="flex items-center space-x-2 w-1/3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm danh mục..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Thẻ Thêm Danh Mục */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:border-green-500 transition">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
                <FiPlus className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Thêm Mới</h3>
              <form onSubmit={handleCreateCategory} className="mt-4">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nhập tên danh mục..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm mb-3"
                    disabled={isCreating}
                  />
                  <textarea
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Nhập mô tả (không bắt buộc)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm resize-none h-20"
                    disabled={isCreating}
                  />
                  <button
                    type="submit"
                  disabled={isCreating || !newCategoryName.trim()}
                  className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Đang tạo...' : 'Lưu Danh Mục'}
                </button>
              </form>
            </div>

            {/* Render Danh Mục */}
            {categories.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg">
                      <FiFolder className="w-6 h-6 text-blue-500" />
                    </div>
                    {/* Hành động (Sửa/Xoá) */}
                     {editingId !== category._id && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => startEdit(category)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Chỉnh sửa"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(category._id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Xoá danh mục"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                     )}
                  </div>

                  {editingId === category._id ? (
                    <div className="mt-2 space-y-3 flex-1 flex flex-col">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Tên danh mục</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          autoFocus
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 mb-1 block">Mô tả</label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none h-24"
                        />
                      </div>
                      
                      {/* Nút lưu được đẩy xuống dưới cùng trong chế độ edit */}
                      <div className="flex space-x-2 pt-3 border-t border-gray-100 mt-auto">
                        <button 
                          onClick={() => handleUpdateCategory(category._id)}
                          className="flex-1 flex items-center justify-center bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 transition"
                        >
                          <FiSave className="mr-2 w-4 h-4" /> Lưu Thay Đổi
                        </button>
                        <button 
                          onClick={cancelEdit}
                          className="flex-1 flex items-center justify-center bg-gray-200 text-gray-700 py-2 rounded text-sm hover:bg-gray-300 transition"
                        >
                          <FiX className="mr-2 w-4 h-4" /> Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-800 text-center mb-1">
                        {category.name}
                      </h3>
                      <p className="text-xs text-center text-gray-500 mb-3 px-2 line-clamp-2 min-h-[2rem]">
                        {category.description || 'Chưa có mô tả'}
                      </p>
                      <p className="text-xs text-gray-400 text-center uppercase tracking-wider">
                        {category.postCount || 0} Bài Viết
                      </p>
                    </>
                  )}
                </div>

                {/* Hành động dưới cùng (Nếu không đang edit) */}
                {!editingId && (
                  <div className="border-t border-gray-100 pt-3 mt-4 flex justify-center items-center">
                    <button
                      onClick={() => navigate(`/admin/posts?categoryId=${category._id}`)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded transition font-medium"
                    >
                      <span>Xem danh sách bài viết</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Phân trang */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">
            Hiển thị {categories.length} trên {pagination.totalCategories || 0} danh mục
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              &lt;
            </button>
            {[...Array(Math.min(5, pagination.totalPages || 1))].map((_, i) => {
              const page = pagination.currentPage <= 3 ? i + 1 : pagination.currentPage - 2 + i;
              if (page > pagination.totalPages) return null;
              return (
                <button
                  key={page}
                  onClick={() => setPagination({ ...pagination, currentPage: page })}
                  className={`px-3 py-1 rounded-lg ${
                    page === pagination.currentPage
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            {pagination.totalPages > 5 && <span className="px-2">...</span>}
            <button
              onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
              disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, categoryId: null })}
        onConfirm={handleConfirmDelete}
        title="Xóa Danh Mục Bài Viết"
        message="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác và chỉ thực hiện được nếu danh mục không có bài viết nào."
        type="delete"
        confirmText="Xoá Danh Mục"
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

export default PostCategories;

import { useState, useEffect } from 'react';
import { postsAPI, postCategoriesAPI } from '../../utils/api';
import MainLayout from '../../components/Layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import SuccessModal from '../../components/Modal/SuccessModal';
import ErrorModal from '../../components/Modal/ErrorModal';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, post: null });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [pagination.currentPage, searchTerm, categoryFilter, statusFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 12,
        search: searchTerm,
      };
      if (categoryFilter !== 'Tất cả') {
        params.categoryId = categoryFilter;
      }
      if (statusFilter !== 'Tất cả') {
        params.status = statusFilter;
      }

      const response = await postsAPI.getAll(params);
      setPosts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await postCategoriesAPI.getAll({ limit: 100 });
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await postsAPI.delete(deleteModal.post._id);
      setDeleteModal({ isOpen: false, post: null });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setIsCreatingCategory(true);
      await postCategoriesAPI.create({ name: newCategoryName.trim(), description: '' });
      setNewCategoryName('');
      setSuccessModal({ isOpen: true, message: 'Tạo danh mục thành công' });
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      setErrorModal({ 
        isOpen: true, 
        message: error.response?.data?.message || 'Tạo danh mục thất bại, vui lòng thử lại' 
      });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  return (
    <MainLayout title="Quản Lí Bài Viết" onSearch={setSearchTerm}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/admin/posts/add')}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <FiPlus className="w-5 h-5" />
            <span>Thêm Bài Viết</span>
          </button>
        </div>

        {/* Category Grid */}
        {categoryFilter === 'Tất cả' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Danh Mục Bài Viết</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Add New Category Card */}
              <div className="p-4 border border-gray-200 rounded-lg hover:border-green-500 transition">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3 mx-auto">
                  <FiPlus className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-800 text-center mb-3">Danh mục</h3>
                <form onSubmit={handleCreateCategory}>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nhập tên danh mục"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm mb-3"
                    disabled={isCreatingCategory}
                  />
                  <button
                    type="submit"
                    disabled={isCreatingCategory || !newCategoryName.trim()}
                    className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingCategory ? 'Đang tạo...' : 'Thêm'}
                  </button>
                </form>
              </div>

              {/* Category Cards */}
              {categories.map((category) => (
                <div
                  key={category._id}
                  onClick={() => setCategoryFilter(category._id)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-500 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.postCount || 0} bài viết</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex space-x-1 p-1 border-b border-gray-200">
            {['Tất cả', 'Đã lưu', 'Đã xoá'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 text-sm font-medium transition ${
                  statusFilter === tab
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                {post.coverImage && (
                  <img
                    src={`http://localhost:3000${post.coverImage}`}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{post.description}</p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/admin/posts/edit/${post._id}`)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Xem Chi Tiết →
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/admin/posts/edit/${post._id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, post })}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Hiển thị {posts.length} trên {pagination.totalPosts || 0} bài viết
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

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, post: null })}
        onConfirm={handleDelete}
        title="Xóa bài viết"
        message="Sau khi xóa, bài viết sẽ không được hoàn tác và không hiển thị trên Website."
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

export default PostList;


import { useState, useEffect } from 'react';
import { categoriesAPI } from '../../utils/api';
import MainLayout from '../../components/Layout/MainLayout';
import { FiPlus, FiPackage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import SuccessModal from '../../components/Modal/SuccessModal';
import ErrorModal from '../../components/Modal/ErrorModal';

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, [pagination.currentPage, searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll({
        page: pagination.currentPage,
        limit: 25,
        search: searchTerm,
      });
      setCategories(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setIsCreating(true);
      await categoriesAPI.create({ name: newCategoryName.trim(), description: '' });
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
      setIsCreating(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/admin/products?categoryId=${categoryId}`);
  };

  return (
    <MainLayout title="Danh Mục Sản Phẩm" onSearch={setSearchTerm}>
      <div className="space-y-6">
        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Loại gạo:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập tên loại gạo"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
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
            {/* Add New Category Card */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:border-green-500 transition">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
                <FiPackage className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Loại gạo</h3>
              <form onSubmit={handleCreateCategory} className="mt-4">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nhập tên loại gạo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                  disabled={isCreating}
                />
                <button
                  type="submit"
                  disabled={isCreating || !newCategoryName.trim()}
                  className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Đang tạo...' : 'Thêm'}
                </button>
              </form>
            </div>

            {/* Category Cards */}
            {categories.map((category) => (
              <div
                key={category._id}
                onClick={() => handleCategoryClick(category._id)}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
                  <FiPackage className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  {category.productCount || 0} Sản phẩm | {category.variantCount || 0} Biến thể
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">
            Hiển thị {categories.length} trên {pagination.totalCategories || 0} sản phẩm
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            {pagination.totalPages > 5 && <span className="px-2">...</span>}
            {pagination.totalPages > 5 && (
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.totalPages })}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {pagination.totalPages}
              </button>
            )}
            <button
              onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
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

export default ProductCategories;


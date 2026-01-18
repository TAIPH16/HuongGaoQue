import { useState, useEffect } from 'react';
import { productsAPI } from '../../utils/api';
import MainLayout from '../../components/Layout/MainLayout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiMoreVertical, FiCheck, FiX } from 'react-icons/fi';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import SuccessModal from '../../components/Modal/SuccessModal';
import ErrorModal from '../../components/Modal/ErrorModal';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const categoryId = searchParams.get('categoryId');

  useEffect(() => {
    fetchProducts();
  }, [pagination.currentPage, searchTerm, categoryId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 10,
        search: searchTerm,
      };
      if (categoryId) params.categoryId = categoryId;

      const response = await productsAPI.getAll(params);
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await productsAPI.delete(deleteModal.product._id);
      setDeleteModal({ isOpen: false, product: null });
      setSuccessModal({ isOpen: true, message: 'Xóa sản phẩm thành công' });
      fetchProducts();
    } catch (error) {
      setDeleteModal({ isOpen: false, product: null });
      setErrorModal({ isOpen: true, message: 'Xóa sản phẩm thất bại' });
    }
  };

  const handleApprove = async (id) => {
    try {
      await productsAPI.approve(id);
      setSuccessModal({ isOpen: true, message: 'Duyệt sản phẩm thành công' });
      fetchProducts();
    } catch (error) {
      setErrorModal({ isOpen: true, message: 'Duyệt sản phẩm thất bại' });
    }
  };

  const handleReject = async (id) => {
    try {
      await productsAPI.reject(id);
      setSuccessModal({ isOpen: true, message: 'Từ chối sản phẩm thành công' });
      fetchProducts();
    } catch (error) {
      setErrorModal({ isOpen: true, message: 'Từ chối sản phẩm thất bại' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Còn hàng':
        return 'bg-green-100 text-green-800';
      case 'Hết hàng':
        return 'bg-red-100 text-red-800';
      case 'Đang tính':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  return (
    <MainLayout title="Quản Lí Sản Phẩm" onSearch={setSearchTerm}>
      <div className="space-y-6">
        {/* Add Product Button */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => navigate('/admin/products/categories')}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus className="w-5 h-5" />
            <span>Tạo Danh Mục</span>
          </button>
          <button
            onClick={() => navigate('/admin/products/add')}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <FiPlus className="w-5 h-5" />
            <span>Thêm Sản Phẩm</span>
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã Sản Phẩm
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản Phẩm
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái duyệt
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trữ Lượng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tăng Trưởng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá (/1kg)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giảm (/1kg)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đã Bán (Kg)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh Thu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-4 text-center text-gray-500">
                      Không có sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const discountAmount = product.discountPercent > 0
                      ? Math.round(product.listedPrice * product.discountPercent / 100)
                      : 0;
                    const growthValue = product.growth || 0;
                    const growthColor = growthValue >= 0 ? 'text-green-600' : 'text-red-600';
                    const growthIcon = growthValue >= 0 ? '↑' : '↓';

                    return (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          ID: {product.productId}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={`http://localhost:3000${product.images[0]}`}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                                title={product.name}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${product.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {product.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              product.status
                            )}`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`flex items-center ${growthColor}`}>
                            <span className="mr-1">{growthIcon}</span>
                            <span>{Math.abs(growthValue).toFixed(1)}%</span>
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatPrice(product.listedPrice)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {discountAmount > 0 ? formatPrice(discountAmount) : '0₫'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.soldQuantity || 0}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(product.revenue || 0)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="relative">
                            <button
                              onClick={() => setSelectedProduct(selectedProduct === product._id ? null : product._id)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <FiMoreVertical className="w-5 h-5" />
                            </button>
                            {selectedProduct === product._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                                <button
                                  onClick={() => {
                                    navigate(`/admin/products/edit/${product._id}`);
                                    setSelectedProduct(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <FiEdit className="w-4 h-4" />
                                  <span>Chỉnh sửa</span>
                                </button>
                                {!product.is_approved ? (
                                  <button
                                    onClick={() => {
                                      handleApprove(product._id);
                                      setSelectedProduct(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center space-x-2"
                                  >
                                    <FiCheck className="w-4 h-4" />
                                    <span>Duyệt</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      handleReject(product._id);
                                      setSelectedProduct(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 flex items-center space-x-2"
                                  >
                                    <FiX className="w-4 h-4" />
                                    <span>Từ chối</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setDeleteModal({ isOpen: true, product });
                                    setSelectedProduct(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                  <span>Xóa</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị {products.length} trên {pagination.totalProducts || 0} sản phẩm
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
                    className={`px-3 py-1 rounded-lg ${page === pagination.currentPage
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
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={handleDelete}
        title="Xóa sản phẩm"
        message="Sau khi xóa, sản phẩm sẽ không được hoàn tác và thực hiện việc mua bán."
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

export default ProductList;


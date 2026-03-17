import { useEffect, useState } from 'react';
import SellerLayout from '../../components/Seller/SellerLayout';
import { sellerProductsAPI } from '../../utils/sellerApi';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiEdit, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'approved', 'pending'
  const navigate = useNavigate();
  const location = useLocation();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await sellerProductsAPI.getAll();
      const productsData = res.data.data || [];
      setProducts(productsData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Refresh when navigating back from add/edit page
  useEffect(() => {
    // Check if we need to refresh (when coming back from add/edit)
    if (location.state?.refresh) {
      fetchProducts();
    }
  }, [location.state]);

  // Filter and search products
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.productId?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter === 'approved') {
      filtered = filtered.filter(product => product.is_approved === true);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(product => product.is_approved === false);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, statusFilter, products]);

  return (
    <SellerLayout>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sản phẩm của tôi</h2>
            <button
              onClick={() => navigate('/seller/products/add')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FiPlus className="w-5 h-5" />
              <span>Thêm sản phẩm</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="approved">Đã duyệt</option>
                <option value="pending">Chờ duyệt</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4 text-sm text-gray-600">
            Hiển thị {filteredProducts.length} / {products.length} sản phẩm
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              {products.length === 0 ? (
                <>
                  <p className="text-gray-500 mb-4">Bạn chưa có sản phẩm nào.</p>
                  <button
                    onClick={() => navigate('/seller/products/add')}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <FiPlus className="w-5 h-5" />
                    <span>Thêm sản phẩm đầu tiên</span>
                  </button>
                </>
              ) : (
                <p className="text-gray-500">
                  Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tên sản phẩm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Giá niêm yết
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tồn kho
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="px-4 py-3 text-sm text-gray-800">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {new Intl.NumberFormat('vi-VN').format(product.listedPrice || 0)}₫
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {product.remainingQuantity ?? product.stock ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${product.is_approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                          {product.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/seller/products/edit/${product._id}`)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Sửa"
                          >
                            <FiEdit className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerProducts;



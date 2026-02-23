import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { useCart } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { customerWishlistAPI } from '../../utils/customerApi';
import Toast from '../../components/Customer/Toast';

const FavoritesPage = () => {
  const { addToCart } = useCart();
  const { customer, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [logoutToastMessage, setLogoutToastMessage] = useState('');

  useEffect(() => {
    if (!customer) {
      navigate('/');
      return;
    }
    fetchWishlist();
  }, [customer, currentPage]);

  const fetchWishlist = async () => {
    if (!customer) return;
    try {
      setLoading(true);
      const response = await customerWishlistAPI.getAll({ page: currentPage, limit: 12 });
      const items = response.data?.data || [];
      setWishlistItems(items);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (wishlistItemId, productId) => {
    setWishlistLoading({ ...wishlistLoading, [productId]: true });
    try {
      await customerWishlistAPI.remove(wishlistItemId);
      // Remove from local state immediately for better UX
      setWishlistItems(prevItems => prevItems.filter(item => item._id !== wishlistItemId));
      setToastMessage('Đã xóa sản phẩm khỏi danh sách yêu thích');
      setShowToast(true);
      
      // If current page becomes empty and not on first page, go to previous page
      const remainingItems = wishlistItems.filter(item => item._id !== wishlistItemId);
      if (remainingItems.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setToastMessage('Có lỗi xảy ra khi xóa khỏi wishlist');
      setShowToast(true);
    } finally {
      setWishlistLoading({ ...wishlistLoading, [productId]: false });
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result?.message) {
        setLogoutToastMessage(result.message);
        setShowLogoutToast(true);
      }
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400';
    if (imagePath.startsWith('http')) return imagePath;
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  };

  const filteredProducts = wishlistItems.filter(item => {
    const product = item.product || item.product_variation_id;
    if (!product) return false;
    if (!searchTerm) return true;
    return product.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <Link
                to="/ho-so"
                className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <span>👤</span>
                <span>Hồ sơ cá nhân</span>
              </Link>
              <Link
                to="/don-hang"
                className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <span>📦</span>
                <span>Thông tin đơn hàng</span>
              </Link>
              <Link
                to="/da-thich"
                className="flex items-center space-x-3 p-3 bg-green-100 text-[#2d5016] rounded-lg font-semibold"
              >
                <span>❤️</span>
                <span>Đã thích</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg w-full text-left"
              >
                <span>🚪</span>
                <span>Thoát</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Đã Thích</h1>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tìm Kiếm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
                <button className="bg-[#2d5016] text-white px-6 py-2 rounded-lg hover:bg-[#1f350d]">
                  🔍
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016]"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">Bạn chưa có sản phẩm nào trong danh sách yêu thích</p>
                <Link
                  to="/san-pham"
                  className="inline-block bg-[#2d5016] text-white px-6 py-2 rounded-lg hover:bg-[#1f350d] transition"
                >
                  Xem sản phẩm
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {filteredProducts.map((item) => {
                    const product = item.product || item.product_variation_id;
                    if (!product) return null;
                    
                    const price = product.listedPrice || product.price || 0;
                    const discountPercent = product.discountPercent || 0;
                    const finalPrice = discountPercent > 0 ? price * (1 - discountPercent / 100) : price;
                    const originalPrice = discountPercent > 0 ? price : null;
                    const images = product.images || (product.image ? [product.image] : []);

                    return (
                      <div key={item._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden relative">
                        <div className="absolute top-2 right-2 z-10">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveFromWishlist(item._id, product._id || product.id);
                            }}
                            disabled={wishlistLoading[product._id || product.id]}
                            className="bg-white rounded-full p-2 shadow-md text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all"
                            title="Xóa khỏi danh sách yêu thích"
                          >
                            <FiHeart className="w-5 h-5 fill-current" />
                          </button>
                        </div>
                        <Link to={`/san-pham/${product._id}`}>
                          <img
                            src={getImageUrl(images[0])}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                        </Link>
                        <div className="p-4">
                          <Link to={`/san-pham/${product._id}`}>
                            <h3 className="font-semibold text-gray-800 mb-2 hover:text-[#2d5016]">{product.name}</h3>
                          </Link>
                          <div className="mb-3">
                            <span className="text-lg font-bold text-gray-800">
                              Giá: {formatPrice(finalPrice)}/kg
                            </span>
                            {originalPrice && (
                              <span className="block text-sm text-gray-500 line-through">
                                {formatPrice(originalPrice)}/kg
                              </span>
                            )}
                          </div>
                          <Link
                            to={`/san-pham/${product._id}`}
                            className="block w-full bg-[#2d5016] text-white text-center py-2 rounded-lg hover:bg-[#1f350d] transition"
                          >
                            Mua Ngay
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center text-gray-600 mb-6">
                  Hiển thị {filteredProducts.length} trên {wishlistItems.length} sản phẩm
                </div>
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  <FiChevronLeft />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 border rounded-lg ${
                        currentPage === pageNum ? 'bg-[#2d5016] text-white' : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastMessage.includes('lỗi') ? 'error' : 'success'}
      />
      <Toast
        message={logoutToastMessage}
        isVisible={showLogoutToast}
        onClose={() => setShowLogoutToast(false)}
        type="success"
      />
    </CustomerLayout>
  );
};

export default FavoritesPage;


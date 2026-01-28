import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { useCart } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { publicProductsAPI, publicCategoriesAPI } from '../../utils/publicApi';
import { customerWishlistAPI } from '../../utils/customerApi';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const { addToCart } = useCart();
  const { customer } = useCustomerAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    if (customer) {
      fetchWishlist();
    }
  }, [selectedCategoryId, currentPage, searchTerm, sortBy, customer]);

  const fetchCategories = async () => {
    try {
      const response = await publicCategoriesAPI.getAll({ limit: 100 });
      const categoriesData = response.data?.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
      };
      if (selectedCategoryId) {
        params.categoryId = selectedCategoryId;
      }
      
      // Add sorting
      if (sortBy === 'price-asc') {
        params.sortBy = 'price';
        params.sortOrder = 'asc';
      } else if (sortBy === 'price-desc') {
        params.sortBy = 'price';
        params.sortOrder = 'desc';
      } else if (sortBy === 'newest') {
        params.sortBy = 'createdAt';
        params.sortOrder = 'desc';
      }
      
      const response = await publicProductsAPI.getAll(params);
      const productsData = response.data?.data || response.data || [];
      
      // Apply client-side sorting if needed
      let sortedProducts = Array.isArray(productsData) ? productsData : [];
      if (sortBy === 'popular') {
        // Sort by popularity (you can adjust this logic)
        sortedProducts = sortedProducts.sort((a, b) => {
          const aPrice = (a.listedPrice || a.price || 0) * (1 - (a.discountPercent || 0) / 100);
          const bPrice = (b.listedPrice || b.price || 0) * (1 - (b.discountPercent || 0) / 100);
          return bPrice - aPrice; // Higher price = more popular (adjust as needed)
        });
      }
      
      setProducts(sortedProducts);
      
      // Set pagination info if available
      if (response.data?.pagination) {
        setTotalPages(response.data.pagination.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400';
    if (imagePath.startsWith('http')) return imagePath;
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const fetchWishlist = async () => {
    if (!customer) return;
    try {
      const response = await customerWishlistAPI.getAll();
      setWishlistItems(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product?._id === productId || item.product_id === productId);
  };

  const handleWishlistToggle = async (productId) => {
    if (!customer) {
      alert('Vui lòng đăng nhập để thêm vào wishlist');
      return;
    }

    setWishlistLoading({ ...wishlistLoading, [productId]: true });
    try {
      const inWishlist = isInWishlist(productId);
      if (inWishlist) {
        const wishlistItem = wishlistItems.find(item => item.product?._id === productId || item.product_id === productId);
        if (wishlistItem) {
          await customerWishlistAPI.remove(wishlistItem._id);
          setWishlistItems(wishlistItems.filter(item => item._id !== wishlistItem._id));
        }
      } else {
        await customerWishlistAPI.add(productId);
        await fetchWishlist(); // Refresh wishlist
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Có lỗi xảy ra khi thêm/xóa khỏi wishlist');
    } finally {
      setWishlistLoading({ ...wishlistLoading, [productId]: false });
    }
  };

  return (
    <CustomerLayout>
      {/* Hero Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1920"
          alt="Rice"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              {/* Search */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Tìm kiếm</h3>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Điền yêu cầu của bạn"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#2d5016] text-white px-4 py-2 rounded-lg hover:bg-[#1f350d] transition"
                  >
                    🔍
                  </button>
                </form>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Loại sản phẩm</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer hover:text-[#2d5016]">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={selectedCategory === 'Tất cả'}
                      onChange={() => {
                        setSelectedCategory('Tất cả');
                        setSelectedCategoryId(null);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 text-[#2d5016]"
                    />
                    <span>Tất cả</span>
                  </label>
                  {categories.map((category) => (
                    <label
                      key={category._id}
                      className="flex items-center space-x-2 cursor-pointer hover:text-[#2d5016]"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category._id}
                        checked={selectedCategoryId === category._id}
                        onChange={() => {
                          setSelectedCategory(category.name);
                          setSelectedCategoryId(category._id);
                          setCurrentPage(1);
                        }}
                        className="w-4 h-4 text-[#2d5016]"
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {selectedCategory === 'Tất cả' ? 'Tất cả sản phẩm' : selectedCategory}
              </h1>
              <select 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="popular">Sản phẩm phổ biến</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">Đang tải...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const price = product.listedPrice || product.price || 0;
                    const discountPercent = product.discountPercent || 0;
                    const finalPrice = discountPercent > 0 ? price * (1 - discountPercent / 100) : price;
                    const originalPrice = discountPercent > 0 ? price : null;

                    return (
                      <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden">
                        <div className="relative">
                          <img
                            src={getImageUrl(product.images?.[0] || product.image)}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                          {discountPercent > 0 && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                              -{discountPercent}%
                            </div>
                          )}
                          <button
                            onClick={() => handleWishlistToggle(product._id)}
                            disabled={wishlistLoading[product._id]}
                            className={`absolute top-2 left-2 transition ${
                              isInWishlist(product._id)
                                ? 'text-pink-600'
                                : 'text-pink-500 hover:text-pink-600'
                            } ${wishlistLoading[product._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <FiHeart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
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
                            currentPage === pageNum
                              ? 'bg-[#2d5016] text-white'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ProductsPage;


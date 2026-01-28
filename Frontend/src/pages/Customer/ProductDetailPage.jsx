import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiMinus, FiPlus, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { useCart } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { publicProductsAPI, publicReviewsAPI } from '../../utils/publicApi';
import { customerWishlistAPI } from '../../utils/customerApi';
import Toast from '../../components/Customer/Toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { addToCart } = useCart();
  const { customer } = useCustomerAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchReviews();
      if (customer) {
        checkWishlistStatus();
      }
    }
  }, [product, customer]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await publicProductsAPI.getById(id);
      setProduct(response.data?.data || response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await publicReviewsAPI.getAll({ productId: id, limit: 10 });
      setReviews(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkWishlistStatus = async () => {
    if (!customer || !product) return;
    try {
      const response = await customerWishlistAPI.getAll();
      const wishlistItems = response.data?.data || [];
      setIsInWishlist(wishlistItems.some(item => 
        item.product?._id === product._id || 
        item.product_id === product._id ||
        item.product_variation_id?._id === product._id ||
        String(item.product_variation_id) === String(product._id)
      ));
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!customer) {
      alert('Vui lòng đăng nhập để thêm vào wishlist');
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist - need to get wishlist item ID first
        const response = await customerWishlistAPI.getAll();
        const wishlistItems = response.data?.data || [];
        const wishlistItem = wishlistItems.find(item => 
          item.product?._id === product._id || 
          item.product_id === product._id ||
          item.product_variation_id?._id === product._id ||
          String(item.product_variation_id) === String(product._id)
        );
        if (wishlistItem) {
          await customerWishlistAPI.remove(wishlistItem._id);
          setIsInWishlist(false);
        }
      } else {
        const response = await customerWishlistAPI.add(product._id);
        // Check if response indicates success
        if (response.data?.success === false) {
          // Product already in wishlist, just update state
          setIsInWishlist(true);
        } else {
          setIsInWishlist(true);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // If error is "already in wishlist", just update state
      if (error.response?.data?.message?.includes('already in wishlist')) {
        setIsInWishlist(true);
      } else {
        alert('Có lỗi xảy ra khi thêm/xóa khỏi wishlist');
      }
    } finally {
      setWishlistLoading(false);
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

  if (loading) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-4 py-12 text-center">Đang tải...</div>
      </CustomerLayout>
    );
  }

  if (!product) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-4 py-12 text-center">Không tìm thấy sản phẩm</div>
      </CustomerLayout>
    );
  }

  const price = product.listedPrice || product.price || 0;
  const discountPercent = product.discountPercent || 0;
  const finalPrice = discountPercent > 0 ? price * (1 - discountPercent / 100) : price;
  const originalPrice = discountPercent > 0 ? price : null;
  const rawImages = product.images || (product.image ? [product.image] : []);
  const images = rawImages.map(img => getImageUrl(img));

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-[#2d5016]">Trang chủ</Link>
          {' > '}
          <Link to="/san-pham" className="hover:text-[#2d5016]">Sản phẩm</Link>
          {' > '}
          <span className="text-gray-800">{product.category?.name || 'Gạo dẻo'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="relative mb-4">
              <img
                src={images[currentImageIndex] || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100"
                  >
                    <FiArrowLeft />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i + 1) % images.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100"
                  >
                    <FiArrowRight />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                      currentImageIndex === index ? 'border-[#2d5016]' : 'border-transparent'
                    }`}
                  />
                ))}
                {images.length > 6 && (
                  <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded">
                    +{images.length - 6}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-2">
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                {product.category?.name || 'Combo'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
            <div className="mb-6">
              <span className="text-2xl font-bold text-[#2d5016]">
                {formatPrice(finalPrice)}
              </span>
              {originalPrice && (
                <span className="ml-4 text-lg text-gray-500 line-through">
                  {formatPrice(originalPrice)}/kg
                </span>
              )}
            </div>
            <div 
              className="text-gray-600 mb-6 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: product.shortDescription || 
                (product.description ? product.description.substring(0, 200) + '...' : 'Combo gạo của chúng tôi là sự kết hợp hoàn hảo giữa các loại gạo đặc sắc: gạo ST25 với hương vị độc đáo, gạo nếp than thơm lừng, gạo dẻo Tam Thơm mềm mịn và gạo dẻo Tứ Quý đầy dinh dưỡng.')
              }}
            />

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 border rounded flex items-center justify-center hover:bg-gray-100"
                >
                  <FiMinus />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border rounded"
                />
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 border rounded flex items-center justify-center hover:bg-gray-100"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => {
                  addToCart({ ...product, price: finalPrice, originalPrice }, quantity);
                  setShowToast(true);
                }}
                className="flex-1 bg-[#2d5016] text-white py-3 rounded-lg font-semibold hover:bg-[#1f350d] transition"
              >
                Thêm Vào Giỏ Hàng
              </button>
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center transition ${
                  isInWishlist
                    ? 'border-pink-500 bg-pink-500 text-white'
                    : 'border-pink-500 text-pink-500 hover:bg-pink-50'
                } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FiHeart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Share */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Chia sẻ qua</p>
              <div className="flex space-x-3">
                <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700">
                  f
                </button>
                <button className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700">
                  📷
                </button>
                <button className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500">
                  📺
                </button>
                <button className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700">
                  📤
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-4 px-2 font-semibold ${
                activeTab === 'description'
                  ? 'text-[#2d5016] border-b-2 border-[#2d5016]'
                  : 'text-gray-600'
              }`}
            >
              Mô tả sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-4 px-2 font-semibold ${
                activeTab === 'details'
                  ? 'text-[#2d5016] border-b-2 border-[#2d5016]'
                  : 'text-gray-600'
              }`}
            >
              Thông tin chi tiết
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 px-2 font-semibold ${
                activeTab === 'reviews'
                  ? 'text-[#2d5016] border-b-2 border-[#2d5016]'
                  : 'text-gray-600'
              }`}
            >
              Đánh giá
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-12">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              {product.description ? (
                <div 
                  className="text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  Sản phẩm này chưa có mô tả chi tiết.
                </p>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Thông tin sản phẩm</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="font-semibold">Tên sản phẩm:</span> {product.name}
                </div>
                <div>
                  <span className="font-semibold">Danh mục:</span> {product.category?.name || 'Combo'}
                </div>
                <div>
                  <span className="font-semibold">Giá:</span> {formatPrice(finalPrice)}
                </div>
                <div>
                  <span className="font-semibold">Đơn vị:</span> {product.unit || 'kg'}
                </div>
              </div>
              
              {/* Product Details from details array */}
              {product.details && product.details.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4">Thông tin chi tiết</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {product.details.map((detail, index) => (
                      <div key={index} className="border-b pb-2">
                        <span className="font-semibold text-gray-700">{detail.indexName}:</span>
                        <span className="ml-2 text-gray-600">{detail.value || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-xl font-bold mb-6">Đánh giá từ người dùng</h3>
              {reviews.length > 0 ? (
                <div className="space-y-6 mb-8">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            {review.customerName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold">{review.customerName || 'Khách hàng'}</p>
                            <div className="flex text-yellow-400">
                              {[...Array(review.rating || 5)].map((_, i) => (
                                <span key={i}>★</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          Được đánh giá vào {new Date(review.createdAt || review.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800 mb-2">{review.title || review.headline || ''}</p>
                      <p className="text-gray-600 mt-2">{review.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 mb-8">
                  <p>Chưa có đánh giá nào</p>
                </div>
              )}

              {/* Review Form */}
              {customer && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-bold mb-4">Đánh giá sản phẩm</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chất lượng sản phẩm
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="text-2xl text-gray-300 hover:text-yellow-400 focus:outline-none"
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đánh giá
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      rows={4}
                      placeholder="Viết đánh giá..."
                    />
                  </div>
                  <button className="bg-[#2d5016] text-white px-6 py-2 rounded-lg hover:bg-[#1f350d] transition font-semibold">
                    Đánh Giá Ngay
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Toast
        message="Đã thêm sản phẩm vào giỏ hàng!"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type="success"
      />
    </CustomerLayout>
  );
};

export default ProductDetailPage;


import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiHeart, FiEye, FiShoppingBag, FiTrendingUp } from 'react-icons/fi';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { useCart } from '../../context/CartContext';
import { publicProductsAPI, publicPostsAPI, publicReviewsAPI } from '../../utils/publicApi';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      try {
        const productsRes = await publicProductsAPI.getAll({ limit: 4, sortBy: 'popular', sortOrder: 'desc' });
        setFeaturedProducts(productsRes.data?.data || productsRes.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setFeaturedProducts([]);
      }

      try {
        const topRes = await publicProductsAPI.getTopSelling({ limit: 4 });
        setTopSellingProducts(topRes.data?.data || topRes.data || []);
      } catch (error) {
        console.error('Error fetching top selling:', error);
        setTopSellingProducts([]);
      }

      try {
        const featuredRes = await publicPostsAPI.getFeatured({ limit: 3 });
        setFeaturedArticles(featuredRes.data?.data || featuredRes.data || []);
      } catch (error) {
        console.error('Error fetching featured articles:', error);
        setFeaturedArticles([]);
      }

      try {
        const reviewsRes = await publicReviewsAPI.getAll({ limit: 3, page: 1 });
        setReviews(reviewsRes.data?.data || reviewsRes.data || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      }

      try {
        const newsRes = await publicPostsAPI.getAll({ limit: 4, page: 1 });
        setNews(newsRes.data?.data || newsRes.data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + '₫';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400';
    if (imagePath.startsWith('http')) return imagePath;
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  };

  const certifications = [
    { name: 'HACCP', icon: '🛡️' },
    { name: 'ORGANIC', icon: '🌿' },
    { name: 'ISO 22000', icon: '✅' },
    { name: 'UTZ Certified', icon: '🌱' },
    { name: 'FAIR TRADE', icon: '🤝' },
  ];

  return (
    <CustomerLayout>
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920)' }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Vùng Đất Lúa Gạo Tươi Tốt</h1>
            <h2 className="text-4xl md:text-5xl font-bold text-green-300 mb-6">Sông Cửu Long</h2>
            <p className="text-lg md:text-xl mb-8 leading-relaxed">
              Vùng đồng bằng Sông Cửu Long – Nơi bao la của những cánh đồng lúa xanh mướt, là nguồn cung cấp gạo ngon cho cả nước và quốc tế.
            </p>
            <div className="flex space-x-4">
              <Link to="/san-pham" className="bg-[#2d5016] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1f350d] transition">Mua Ngay</Link>
              <Link to="/lien-he" className="border-2 border-[#2d5016] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2d5016] transition">Liên Hệ</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Special Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600" alt="Rice" className="rounded-lg shadow-lg" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Sự Đặc Biệt Của <span className="text-[#2d5016]">Lúa Gạo Vùng Đồng Bằng Sông Cửu Long</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Đồng bằng Sông Cửu Long, nơi được mẹ thiên nhiên ưu đãi với hệ thống sông ngòi dày đặc, mang trong mình vẻ đẹp hùng vĩ của những dòng sông mẹ, là "lá phổi xanh" của cả nước.
              </p>
              <Link to="/ve-chung-toi" className="inline-flex items-center text-[#2d5016] font-semibold hover:underline">
                Tìm Hiểu Thêm <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Chứng Nhận Sản Phẩm</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Vùng Đồng Bằng Sông Cửu Long đã có nhiều cố gắng trong việc nâng cao chất lượng và uy tín của sản phẩm gạo trên thị trường quốc tế.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {certifications.map((cert, index) => (
              <div key={index} className="flex flex-col items-center justify-center w-32 h-32 rounded-full bg-white shadow-md hover:shadow-lg transition">
                <span className="text-4xl mb-2">{cert.icon}</span>
                <span className="text-sm font-semibold text-gray-700">{cert.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Sản phẩm nổi bật (existing) ===== */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Sản Phẩm Nổi Bật</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Đồng Bằng Sông Cửu Long, với đất đai màu mỡ và nguồn nước từ hệ thống sông ngòi chảy qua, đã tạo ra những giống gạo nổi tiếng không chỉ trong nước mà còn trên thị trường quốc tế.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.length > 0 ? featuredProducts.map((product) => {
              const price = product.listedPrice || product.price || 0;
              const discountPercent = product.discountPercent || 0;
              const finalPrice = discountPercent > 0 ? price * (1 - discountPercent / 100) : price;
              const originalPrice = discountPercent > 0 ? price : null;
              return (
                <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden">
                  <div className="relative">
                    <img src={getImageUrl(product.images?.[0] || product.image)} alt={product.name} className="w-full h-48 object-cover" />
                    {discountPercent > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">-{discountPercent}%</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold text-gray-800">Giá: {formatPrice(finalPrice)}/kg</span>
                        {originalPrice && <span className="block text-sm text-gray-500 line-through">{formatPrice(originalPrice)}/kg</span>}
                      </div>
                      <button className="text-pink-500 hover:text-pink-600"><FiHeart className="w-5 h-5" /></button>
                    </div>
                    <Link to={`/san-pham/${product._id}`} className="block w-full bg-[#2d5016] text-white text-center py-2 rounded-lg hover:bg-[#1f350d] transition">
                      Mua Ngay
                    </Link>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full text-center py-12 text-gray-500">Đang tải sản phẩm...</div>
            )}
          </div>
          <div className="text-center">
            <Link to="/san-pham" className="inline-flex items-center text-gray-700 font-semibold hover:text-[#2d5016] transition">
              Xem Tất Cả <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SẢN PHẨM BÁN CHẠY (NEW - riêng biệt với Sản phẩm nổi bật) ===== */}
      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-1 h-10 bg-amber-500 rounded-full"></div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FiShoppingBag className="text-amber-500 w-5 h-5" />
                  <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Được mua nhiều nhất</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Sản Phẩm Bán Chạy</h2>
              </div>
            </div>
            <Link to="/san-pham" className="hidden md:inline-flex items-center text-amber-600 font-semibold hover:underline">
              Xem tất cả <FiArrowRight className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topSellingProducts.length > 0 ? topSellingProducts.map((product, index) => {
              const price = product.listedPrice || 0;
              const discountPercent = product.discountPercent || 0;
              const finalPrice = discountPercent > 0 ? price * (1 - discountPercent / 100) : price;
              return (
                <Link key={product._id} to={`/san-pham/${product._id}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="relative">
                    <img src={getImageUrl(product.images?.[0])} alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-amber-500'
                    }`}>
                      {index === 0 ? '#1' : `#${index + 1}`}
                    </div>
                    {discountPercent > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">-{discountPercent}%</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors">{product.name}</h3>
                    <p className="text-xs text-amber-600 font-medium mb-2">
                      Đã bán: {product.soldQuantity?.toLocaleString('vi-VN') || 0} kg
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-gray-800">{formatPrice(finalPrice)}/kg</span>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Bán chạy</span>
                    </div>
                  </div>
                </Link>
              );
            }) : (
              <div className="col-span-full text-center py-12 text-gray-400">Đang tải dữ liệu...</div>
            )}
          </div>
          <div className="text-center mt-6 md:hidden">
            <Link to="/san-pham" className="inline-flex items-center text-amber-600 font-semibold hover:underline">
              Xem tất cả <FiArrowRight className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Hơn 1.000+ Đánh Giá Từ Khách Hàng Hài Lòng.</h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#2d5016] rounded-lg p-8 md:p-12 text-white relative">
              <div className="absolute top-4 left-4 text-6xl text-green-200 opacity-50">"</div>
              <div className="relative z-10">
                <p className="text-lg md:text-xl leading-relaxed mb-6">
                  {reviews[0]?.content || 'Với tôi, việc chọn gạo không chỉ dừng lại ở chất lượng, mà còn ở sự an toàn thực phẩm. Với gạo Đồng bằng Sông Cửu Long, tôi hoàn toàn yên tâm. Mỗi bữa cơm trở nên an tâm và ngon miệng hơn.'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-xl">★</span>)}
                  </div>
                  {reviews[0] && <div className="text-sm opacity-75">{reviews[0].customerName || 'Khách hàng'}</div>}
                </div>
              </div>
              <div className="absolute bottom-4 right-4 text-6xl text-green-200 opacity-50">"</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BÀI VIẾT NỔI BẬT (NEW - Khối thiết kế nổi bật riêng biệt) ===== */}
      {featuredArticles.length > 0 && (
        <section className="py-16 bg-[#f4f8f4] relative overflow-hidden ring-1 ring-black/5">
          {/* Decorative accent lines */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2d5016] to-transparent opacity-20"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FiTrendingUp className="text-[#2d5016] w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-[#2d5016] uppercase tracking-widest">Tiêu Điểm</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight border-l-4 border-[#2d5016] pl-4">
                  Bài Viết Nổi Bật
                </h2>
              </div>
              <Link to="/tin-tuc" className="hidden md:inline-flex items-center justify-center px-6 py-2.5 bg-white text-[#2d5016] font-bold rounded-full shadow-sm hover:shadow-md hover:bg-green-50 border border-green-100 transition-all">
                Xem tất cả <FiArrowRight className="ml-2" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredArticles.map((article, index) => (
                <Link key={article._id} to={`/tin-tuc/${article._id}`}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(45,80,22,0.15)] hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                  <div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
                    <img src={getImageUrl(article.image || article.coverImage)} alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    
                    <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                      <span className="inline-block bg-[#2d5016]/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm w-max">
                        {article.category?.name || 'Tin tức'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#2d5016] transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {(article.description || article.excerpt || article.content || "Đang cập nhật nội dung cho bài viết này...").replace(/<[^>]+>/g, '')}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-gray-500 text-sm font-medium">
                      <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                        <FiEye className="w-4 h-4" /> {article.viewCount?.toLocaleString('vi-VN') || 0} lượt xem
                      </span>
                      <span className="flex items-center text-[#2d5016] font-semibold group-hover:translate-x-1 transition-transform">
                        Đọc tiếp <FiArrowRight className="ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-10 md:hidden">
              <Link to="/tin-tuc" className="inline-flex items-center justify-center px-8 py-3 w-full bg-white text-[#2d5016] font-bold rounded-xl shadow-sm hover:shadow-md border border-green-100 transition-all">
                Xem tất cả <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== Tin Tức Mới Nhất (existing - riêng biệt với Bài Viết Nổi Bật) ===== */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Tin Tức Mới Nhất</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {news.slice(0, 4).map((post) => (
              <Link key={post._id} to={`/tin-tuc/${post._id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden">
                <div className="relative">
                  <img src={getImageUrl(post.image || post.coverImage)} alt={post.title} className="w-full h-48 object-cover" />
                  {post.category && (
                    <div className="absolute top-2 right-2 bg-[#2d5016] text-white px-3 py-1 rounded text-sm">
                      {post.category.name || 'Tin Tức'}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {(post.excerpt || post.content || '').replace(/<[^>]+>/g, '')}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-[#2d5016] font-semibold">XEM CHI TIẾT <FiArrowRight className="ml-2" /></div>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><FiEye className="w-3 h-3" /> {post.viewCount || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1920)' }}>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Liên Hệ Ngay</h2>
            <p className="text-lg mb-8 text-gray-300">Chúng tôi sẽ cố gắng giải đáp mọi câu hỏi và giúp bạn giải quyết các vấn đề một cách nhanh chóng và hiệu quả.</p>
            <Link to="/lien-he" className="inline-block bg-[#2d5016] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1f350d] transition">Liên Hệ</Link>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
};

export default HomePage;

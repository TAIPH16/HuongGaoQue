import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTrendingUp, FiEye } from 'react-icons/fi';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { publicPostsAPI } from '../../utils/publicApi';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400';
    if (imagePath.startsWith('http')) return imagePath;
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  };

  const filters = ['Tất cả', 'Xu hướng', 'Sức khoẻ', 'Hướng dẫn & Mẹo vặt'];

  useEffect(() => {
    fetchNews();
  }, [activeFilter]);

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const response = await publicPostsAPI.getFeatured({ limit: 3 });
      setFeaturedArticles(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching featured articles:', error);
      setFeaturedArticles([]);
    }
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = { limit: 12, page: 1 };
      if (activeFilter !== 'Tất cả') {
        params.category = activeFilter;
      }
      const response = await publicPostsAPI.getAll(params);
      setNews(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout>
      {/* ===== BÀI VIẾT NỔI BẬT ===== */}
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
                  <span className="text-sm font-bold text-[#2d5016] uppercase tracking-widest">Được xem nhiều nhất</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight border-l-4 border-[#2d5016] pl-4">
                  Bài Viết Nổi Bật
                </h2>
              </div>
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
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">Tất cả tin tức</h1>

        {/* Filters */}
        <div className="flex justify-center space-x-4 mb-12">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-lg transition ${
                activeFilter === filter
                  ? 'bg-green-100 border-2 border-[#2d5016] text-[#2d5016] font-semibold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : (
          <>
            {/* Featured Article */}
            {news.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div>
                  <img
                    src={getImageUrl(news[0]?.image || news[0]?.coverImage)}
                    alt={news[0]?.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <span className="inline-block bg-[#2d5016] text-white px-3 py-1 rounded text-sm mb-4">
                    {news[0]?.category?.name || 'Xu hướng'}
                  </span>
                  <h2 className="text-3xl font-bold mb-4">{news[0]?.title || 'Cập Nhật Xu Hướng Hương Vị Cà Phê Nổi Bật 2024'}</h2>
                  <p className="text-gray-600 mb-6 line-clamp-4">
                    {(news[0]?.excerpt || news[0]?.content || 'Bạn đang tìm kiếm một cách để cải thiện tâm trạng và tăng cường sức khoẻ tổng thể của mình? Cây trồng nội thất là giải pháp hoàn hảo!...').replace(/<[^>]+>/g, '')}
                  </p>
                  <Link
                    to={`/tin-tuc/${news[0]?._id}`}
                    className="inline-flex items-center text-[#2d5016] font-semibold hover:underline"
                  >
                    XEM CHI TIẾT <FiArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>
            )}

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.slice(1).map((article) => (
                <Link
                  key={article._id}
                  to={`/tin-tuc/${article._id}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
                >
                  <img
                    src={getImageUrl(article.image || article.coverImage)}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <span className="inline-block bg-[#2d5016] text-white px-3 py-1 rounded text-sm mb-2">
                      {article.category?.name || 'Xu hướng'}
                    </span>
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {(article.excerpt || article.content || 'Short text describing a feature of your product/service.').replace(/<[^>]+>/g, '')}
                    </p>
                    <div className="flex items-center text-[#2d5016] font-semibold">
                      XEM CHI TIẾT <FiArrowRight className="ml-2" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </CustomerLayout>
  );
};

export default NewsPage;


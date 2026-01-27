import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { publicPostsAPI } from '../../utils/publicApi';

const NewsPage = () => {
  const [news, setNews] = useState([]);
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
                    {news[0]?.excerpt || news[0]?.content?.substring(0, 200) || 'Bạn đang tìm kiếm một cách để cải thiện tâm trạng và tăng cường sức khoẻ tổng thể của mình? Cây trồng nội thất là giải pháp hoàn hảo!...'}
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
                      {article.excerpt || article.content?.substring(0, 100) || 'Short text describing a feature of your product/service.'}
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


import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiHeart } from 'react-icons/fi';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { useCart } from '../../context/CartContext';
import { publicProductsAPI, publicPostsAPI, publicReviewsAPI } from '../../utils/publicApi';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch featured products
      try {
        const productsRes = await publicProductsAPI.getAll({ limit: 4, page: 1 });
        setFeaturedProducts(productsRes.data?.data || productsRes.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Use mock data if API fails
        setFeaturedProducts([]);
      }

      // Fetch reviews
      try {
        const reviewsRes = await publicReviewsAPI.getAll({ limit: 3, page: 1 });
        setReviews(reviewsRes.data?.data || reviewsRes.data || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      }

      // Fetch news
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
  const sendChat = async () => {

    if (!chatInput) return;

    const userMsg = { role: "user", text: chatInput };

    setChatMessages(prev => [...prev, userMsg]);

    try {

      const res = await fetch(
        "http://localhost:3000/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: chatInput
          }),
        }
      );

      const data = await res.json();

      setChatMessages(prev => [
        ...prev,
        { role: "bot", text: data.reply }
      ]);

    } catch (err) {

      setChatMessages(prev => [
        ...prev,
        { role: "bot", text: "Chat error" }
      ]);

    }

    setChatInput("");

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
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Vùng Đất Lúa Gạo Tươi Tốt
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold text-green-300 mb-6">
              Sông Cửu Long
            </h2>
            <p className="text-lg md:text-xl mb-8 leading-relaxed">
              Vùng đồng bằng Sông Cửu Long – Nơi bao la của những cánh đồng lúa xanh mướt, là nguồn cung cấp gạo ngon cho cả nước và quốc tế.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/san-pham"
                className="bg-[#2d5016] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1f350d] transition"
              >
                Mua Ngay
              </Link>
              <Link
                to="/lien-he"
                className="border-2 border-[#2d5016] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2d5016] transition"
              >
                Liên Hệ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Special Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600"
                alt="Rice"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Sự Đặc Biệt Của{' '}
                <span className="text-[#2d5016]">Lúa Gạo Vùng Đồng Bằng Sông Cửu Long</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Đồng bằng Sông Cửu Long, nơi được mẹ thiên nhiên ưu đãi với hệ thống sông ngòi dày đặc, mang trong mình vẻ đẹp hùng vĩ của những dòng sông mẹ, là "lá phổi xanh" của cả nước. Khi nhắc đến Cửu Long, người ta không thể không nghĩ ngay đến biểu tượng của nền nông nghiệp: những cánh đồng lúa xanh bát ngát.
              </p>
              <Link
                to="/ve-chung-toi"
                className="inline-flex items-center text-[#2d5016] font-semibold hover:underline"
              >
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Chứng Nhận Sản Phẩm
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Vùng Đồng Bằng Sông Cửu Long đã có nhiều cố gắng trong việc nâng cao chất lượng và uy tín của sản phẩm gạo trên thị trường quốc tế.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center w-32 h-32 rounded-full bg-white shadow-md hover:shadow-lg transition"
              >
                <span className="text-4xl mb-2">{cert.icon}</span>
                <span className="text-sm font-semibold text-gray-700">{cert.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Sản Phẩm Nổi Bật
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Đồng Bằng Sông Cửu Long, với đất đai màu mỡ và nguồn nước từ hệ thống sông ngòi chảy qua, đã tạo ra những giống gạo nổi tiếng không chỉ trong nước mà còn trên thị trường quốc tế.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => {
                const price = product.listedPrice || product.price || 0;
                const discountPercent = product.discountPercent || 0;
                const finalPrice = discountPercent > 0
                  ? price * (1 - discountPercent / 100)
                  : price;
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
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-lg font-bold text-gray-800">
                            Giá: {formatPrice(finalPrice)}/kg
                          </span>
                          {originalPrice && (
                            <span className="block text-sm text-gray-500 line-through">
                              {formatPrice(originalPrice)}/kg
                            </span>
                          )}
                        </div>
                        <button className="text-pink-500 hover:text-pink-600">
                          <FiHeart className="w-5 h-5" />
                        </button>
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
              })
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                Đang tải sản phẩm...
              </div>
            )}
          </div>
          <div className="text-center">
            <Link
              to="/san-pham"
              className="inline-flex items-center text-gray-700 font-semibold hover:text-[#2d5016] transition"
            >
              Xem Tất Cả <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Hơn 1.000+ Đánh Giá Từ Khách Hàng Hài Lòng.
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#2d5016] rounded-lg p-8 md:p-12 text-white relative">
              <div className="absolute top-4 left-4 text-6xl text-green-200 opacity-50">"</div>
              <div className="relative z-10">
                {reviews.length > 0 ? (
                  <>
                    <p className="text-lg md:text-xl leading-relaxed mb-6">
                      {reviews[0].content || "Với tôi, việc chọn gạo không chỉ dừng lại ở chất lượng, mà còn ở sự an toàn thực phẩm. Đã có nhiều lần tôi lo lắng khi mua gạo trên thị trường với nhiều thông tin về gạo kém chất lượng. Nhưng với gạo Đồng bằng Sông Cửu Long, tôi hoàn toàn yên tâm. Không chỉ vì chất lượng tốt mà còn ở sự minh bạch trong quy trình sản xuất. Mỗi bữa cơm trở nên an tâm và ngon miệng hơn."}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-xl">★</span>
                        ))}
                      </div>
                      <div className="text-sm opacity-75">
                        {reviews[0].customerName || 'Khách hàng'}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-lg md:text-xl leading-relaxed mb-6">
                      Với tôi, việc chọn gạo không chỉ dừng lại ở chất lượng, mà còn ở sự an toàn thực phẩm. Đã có nhiều lần tôi lo lắng khi mua gạo trên thị trường với nhiều thông tin về gạo kém chất lượng. Nhưng với gạo Đồng bằng Sông Cửu Long, tôi hoàn toàn yên tâm. Không chỉ vì chất lượng tốt mà còn ở sự minh bạch trong quy trình sản xuất. Mỗi bữa cơm trở nên an tâm và ngon miệng hơn.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-xl">★</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="absolute bottom-4 right-4 text-6xl text-green-200 opacity-50">"</div>
            </div>
            <div className="flex justify-center mt-6 space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-[#2d5016]' : 'bg-gray-300'
                    }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Tin Tức</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {news.slice(0, 4).map((post) => (
              <Link
                key={post._id}
                to={`/tin-tuc/${post._id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={getImageUrl(post.image || post.coverImage)}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  {post.category && (
                    <div className="absolute top-2 right-2 bg-[#2d5016] text-white px-3 py-1 rounded text-sm">
                      {post.category.name || 'Tin Tức'}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt || post.content?.substring(0, 100)}
                  </p>
                  <div className="flex items-center text-[#2d5016] font-semibold">
                    XEM CHI TIẾT <FiArrowRight className="ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-800 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1920)',
          }}
        ></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Liên Hệ Ngay</h2>
            <p className="text-lg mb-8 text-gray-300">
              Chúng tôi sẽ cố gắng giải đáp mọi câu hỏi và giúp bạn giải quyết các vấn đề một cách nhanh chóng và hiệu quả.
            </p>
            <Link
              to="/lien-he"
              className="inline-block bg-[#2d5016] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1f350d] transition"
            >
              Liên Hệ
            </Link>
          </div>
        </div>
      </section>
      {/* CHAT FLOAT */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-full z-50"
      >
        Chat
      </button>


      {showChat && (

        <div className="fixed bottom-20 right-6 w-80 h-96 bg-white border shadow z-50 flex flex-col">

          <div className="bg-green-600 text-white p-2">
            ChatGPT
          </div>

          <div className="flex-1 overflow-y-auto p-2">

            {chatMessages.map((m, i) => (

              <div key={i}>
                <b>{m.role}:</b> {m.text}
              </div>

            ))}

          </div>

          <div className="p-2 flex gap-2">

            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="border flex-1"
            />

            <button
              onClick={sendChat}
              className="bg-green-600 text-white px-3"
            >
              Gửi
            </button>

          </div>

        </div>

      )}

    </CustomerLayout>
  );
};

export default HomePage;


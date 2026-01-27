import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { publicPostsAPI } from '../../utils/publicApi';
import { FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';

const NewsDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await publicPostsAPI.getById(id);
      setPost(response.data?.data || response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400';
    if (imagePath.startsWith('http')) return imagePath;
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-4 py-12 text-center">Đang tải...</div>
      </CustomerLayout>
    );
  }

  if (!post) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-4 py-12 text-center">Không tìm thấy bài viết</div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-[#2d5016]">Trang chủ</Link>
          {' > '}
          <Link to="/tin-tuc" className="hover:text-[#2d5016]">Tin tức</Link>
          {' > '}
          <span className="text-gray-800">{post.category?.name || 'Báo Chí'}</span>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="mb-4">
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
              {post.category?.name || 'Báo Chí'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            {post.title}
          </h1>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                {post.author?.name?.[0] || post.createdBy?.name?.[0] || 'A'}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {post.author?.name || post.createdBy?.name || 'Admin'}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(post.createdAt || post.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 ml-auto">
              <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                <FiFacebook className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition">
                <FiTwitter className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition">
                <FiInstagram className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.image || post.coverImage ? (
          <div className="mb-8">
            <img
              src={getImageUrl(post.image || post.coverImage)}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        ) : null}

        {/* Article Content */}
        <div className="prose max-w-none mb-12">
          {post.content ? (
            <div
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {post.excerpt || post.description || 'Nội dung bài viết đang được cập nhật...'}
            </div>
          )}
        </div>

        {/* Related Posts Section */}
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Bài viết liên quan</h2>
          <div className="text-center text-gray-500">
            <p>Đang tải các bài viết liên quan...</p>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default NewsDetailPage;


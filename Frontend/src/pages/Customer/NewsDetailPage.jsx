import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { publicPostsAPI, publicReviewsAPI } from '../../utils/publicApi';
import { FiFacebook, FiTwitter, FiInstagram, FiArrowRight, FiClock, FiUser, FiShare2, FiEye } from 'react-icons/fi';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import axios from 'axios';

const NewsDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  
  // FC4: Comment state
  const { customer } = useCustomerAuth();
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentMessage, setCommentMessage] = useState('');
  
  // Edit/Delete state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);
  
  // Custom Confirm Modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPost();
    fetchComments();

    // Chỉ tăng lượt xem nếu bài viết này chưa được xem trong phiên hiện tại
    if (id) {
      const sessionKey = `viewed_post_${id}`;
      if (!sessionStorage.getItem(sessionKey)) {
        publicPostsAPI.incrementView(id).catch(() => {});
        sessionStorage.setItem(sessionKey, '1');
      }
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await publicPostsAPI.getById(id);
      const postData = response.data?.data || response.data;
      setPost(postData);
      
      // Fetch related posts based on category
      if (postData) {
        fetchRelatedNews(postData.category?.name || postData.category, postData._id);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await publicReviewsAPI.getAll({
        target_type: 'post',
        target_id: id,
        limit: 20
      });
      const resultData = response.data?.data || response.data || {};
      setComments(resultData.reviews || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!customer) {
      alert("Vui lòng đăng nhập để bình luận.");
      return;
    }
    if (!commentContent.trim()) {
      setCommentMessage("Vui lòng nhập nội dung bình luận.");
      return;
    }

    try {
      setSubmittingComment(true);
      setCommentMessage("");
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('customer_token');
      
      await axios.post(
        `${API_BASE_URL}/reviews`,
        {
          target_type: 'post',
          target_id: post._id,
          rating: 5,
          title: "Bình luận bài viết",
          content: commentContent.trim()
        },
        { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
      );
      
      setCommentContent("");
      setCommentMessage("Gửi bình luận thành công.");
      fetchComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      setCommentMessage(error.response?.data?.message || "Lỗi khi gửi bình luận.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditClick = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editCommentContent.trim()) {
      alert("Vui lòng nhập nội dung bình luận.");
      return;
    }

    try {
      setSubmittingEdit(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('customer_token');
      
      await axios.put(
        `${API_BASE_URL}/reviews/${commentId}`,
        { content: editCommentContent.trim() },
        { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
      );
      
      setEditingCommentId(null);
      setEditCommentContent('');
      fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      alert(error.response?.data?.message || "Lỗi khi cập nhật bình luận.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const requestDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      setDeleteConfirmOpen(false);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('customer_token');
      
      await axios.delete(
        `${API_BASE_URL}/reviews/${commentToDelete}`,
        { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
      );
      
      setCommentToDelete(null);
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(error.response?.data?.message || "Lỗi khi xóa bình luận.");
    }
  };

  const fetchRelatedNews = async (category, currentPostId) => {
    try {
      setLoadingRelated(true);
      const params = { limit: 4 }; // Fetch 4, we will filter out the current one and keep 3
      if (category && typeof category === 'string') {
        params.category = category;
      }
      const response = await publicPostsAPI.getAll(params);
      let news = response.data?.data || response.data || [];
      // Filter out the current post and take top 3
      news = news.filter(item => item._id !== currentPostId).slice(0, 3);
      setRelatedNews(news);
    } catch (error) {
      console.error('Error fetching related news:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800';
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
        <div className="container mx-auto px-4 py-20 flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2d5016]"></div>
        </div>
      </CustomerLayout>
    );
  }

  if (!post) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy bài viết</h2>
          <p className="text-gray-600 mb-8">Bài viết bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
          <Link to="/tin-tuc" className="bg-[#2d5016] text-white px-6 py-3 rounded-lg hover:bg-[#1a330b] transition-colors">
            Quay lại trang tin tức
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  const authorName = post.author?.name || post.createdBy?.name || 'Admin';
  const categoryName = post.category?.name || post.category || 'Tin tức';

  return (
    <CustomerLayout>
      <div className="bg-gray-50 pb-16">
        {/* Header Section with Background Image */}
        <div className="relative w-full h-[50vh] min-h-[400px] mb-12">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${getImageUrl(post.image || post.coverImage)})`,
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          </div>
          
          <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-12">
            {/* Breadcrumbs */}
            <div className="mb-6 text-sm text-gray-300 flex items-center space-x-2">
              <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
              <span>/</span>
              <Link to="/tin-tuc" className="hover:text-white transition-colors">Tin tức</Link>
              <span>/</span>
              <span className="text-white font-medium truncate max-w-[200px] sm:max-w-none">{categoryName}</span>
            </div>

            <div className="mb-4">
              <span className="inline-block bg-[#2d5016] text-white px-3 py-1 rounded-full text-sm font-medium">
                {categoryName}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-gray-200 space-x-6">
              <div className="flex items-center space-x-2">
                <FiUser className="w-4 h-4" />
                <span>{authorName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiClock className="w-4 h-4" />
                <span>{formatDate(post.createdAt || post.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiEye className="w-4 h-4" />
                <span>{post.viewCount || 0} lượt xem</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
            
            {/* Main Content Area */}
            <div className="lg:w-8/12 bg-white rounded-2xl shadow-sm p-8 lg:p-12 -mt-24 relative z-10">
              
              {/* Image inside content area */}
              {post.image || post.coverImage ? (
                <div className="mb-8 rounded-xl overflow-hidden shadow-sm">
                  <img
                    src={getImageUrl(post.image || post.coverImage)}
                    alt={post.title}
                    className="w-full h-auto max-h-[500px] object-cover"
                  />
                </div>
              ) : null}

              {/* Introduction/Excerpt */}
              {(post.excerpt || post.description) && (
                <div 
                  className="text-xl text-gray-600 font-medium italic border-l-4 border-[#2d5016] pl-6 mb-10 leading-relaxed max-w-none prose prose-p:my-0 prose-p:inline"
                  dangerouslySetInnerHTML={{ __html: post.excerpt || post.description }}
                />
              )}

              {/* Article Content */}
              <div className="prose prose-lg max-w-none prose-headings:text-[#2d5016] prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-xl prose-img:shadow-md mb-12">
                {post.content ? (
                  <div
                    className="text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                ) : (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    Nội dung bài viết đang được cập nhật...
                  </div>
                )}
              </div>

              {/* Tags & Sharing */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-8 mt-8">
                <div className="mb-4 sm:mb-0 flex items-center space-x-2">
                  <span className="font-semibold text-gray-700">Tags:</span>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{categoryName}</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-gray-700 flex items-center">
                    <FiShare2 className="mr-2" /> Chia sẻ:
                  </span>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#3b5998] text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition shadow-sm">
                    <FiFacebook className="w-5 h-5" />
                  </a>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#1da1f2] text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition shadow-sm">
                    <FiTwitter className="w-5 h-5" />
                  </a>
                  <button onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Đã sao chép đường dẫn bài viết!');
                    }} className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center hover:opacity-90 transition shadow-sm" title="Sao chép liên kết">
                    <FiShare2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar (Optional empty space for layout balance, or recent posts) */}
            <div className="lg:w-4/12 flex-shrink-0 mt-8 lg:mt-0">
              <div className="sticky top-24 bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2 border-[#2d5016]">
                  Thông tin tác giả
                </h3>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-[#2d5016] text-white text-2xl font-bold rounded-full flex items-center justify-center shadow-md">
                    {authorName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{authorName}</h4>
                    <p className="text-sm text-gray-500">Thành viên Ban Biện Tập</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Cảm ơn bạn đã đọc bài viết này! Chúng tôi luôn nỗ lực chia sẻ những thông tin hữu ích và góc nhìn đa chiều về các chủ đề xoay quanh sản phẩm và cuộc sống.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FC4: Comments Section */}
        <div className="container mx-auto px-4 mt-16 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">Bình luận bài viết ({comments.length})</h3>
            
            {/* Comment Form */}
            {customer ? (
              <div className="mb-10">
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-[#2d5016] text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {customer.fullName?.[0] || customer.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
                      className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-[#2d5016] focus:border-transparent outline-none min-h-[100px]"
                    />
                    {commentMessage && (
                      <p className={`mt-2 text-sm ${commentMessage.includes("thành công") ? "text-green-600" : "text-red-600"}`}>
                        {commentMessage}
                      </p>
                    )}
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={handleSubmitComment}
                        disabled={submittingComment}
                        className="bg-[#2d5016] text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
                      >
                        {submittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-10 p-6 bg-gray-50 rounded-xl text-center">
                <p className="text-gray-600 mb-3">Vui lòng đăng nhập để tham gia bình luận.</p>
                <Link to="/dang-nhap" className="inline-block bg-[#2d5016] text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90">
                  Đăng nhập ngay
                </Link>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length > 0 ? (
                comments.map((comment) => {
                  const customerId = customer?._id || customer?.id;
                  const commentUserId = comment.user_id?._id || comment.user_id?.id || comment.user_id;
                  const isOwner = customerId && commentUserId && String(customerId) === String(commentUserId);
                  const isEditing = editingCommentId === comment._id;

                  return (
                    <div key={comment._id} className="flex space-x-4 border-b border-gray-100 pb-6 last:border-0">
                      <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {(comment.user_id?.fullName?.[0] || comment.user_id?.name?.[0] || comment.customerName?.[0] || 'U').toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between mb-1">
                          <div className="flex items-baseline space-x-2">
                            <span className="font-bold text-gray-800">{comment.user_id?.fullName || comment.user_id?.name || comment.customerName || "Khách"}</span>
                            <span className="text-xs text-gray-400">{formatDate(comment.createdAt || comment.created_at)}</span>
                          </div>
                          {isOwner && !isEditing && (
                            <div className="text-xs space-x-3 text-gray-500">
                              <button onClick={() => handleEditClick(comment)} className="hover:text-blue-600 transition-colors">Sửa</button>
                              <button onClick={() => requestDeleteComment(comment._id)} className="hover:text-red-600 transition-colors">Xóa</button>
                            </div>
                          )}
                        </div>
                        
                        {isEditing ? (
                          <div className="mt-2">
                            <textarea
                              value={editCommentContent}
                              onChange={(e) => setEditCommentContent(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#2d5016] focus:border-transparent outline-none min-h-[80px] text-sm"
                            />
                            <div className="mt-3 flex justify-end space-x-2">
                              <button
                                onClick={handleCancelEdit}
                                className="px-4 py-1.5 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => handleSaveEdit(comment._id)}
                                disabled={submittingEdit}
                                className="px-4 py-1.5 text-sm rounded bg-[#2d5016] text-white hover:bg-opacity-90 transition disabled:opacity-50"
                              >
                                {submittingEdit ? 'Đang lưu...' : 'Lưu lại'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 leading-relaxed mt-1">{comment.content}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có bình luận nào. Hãy trở thành người đầu tiên chia sẻ ý kiến!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Posts Section */}
        <div className="container mx-auto px-4 mt-20 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Bài viết liên quan</h2>
            <Link to="/tin-tuc" className="text-[#2d5016] font-semibold hover:underline flex items-center">
              Xem tất cả <FiArrowRight className="ml-1" />
            </Link>
          </div>

          {loadingRelated ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2d5016]"></div>
            </div>
          ) : relatedNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedNews.map((article) => (
                <Link
                  key={article._id}
                  to={`/tin-tuc/${article._id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getImageUrl(article.image || article.coverImage)}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#2d5016] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                        {article.category?.name || 'Tin tức'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="text-xs text-gray-500 mb-3 flex items-center">
                      <FiClock className="mr-1" />
                      {formatDate(article.createdAt || article.created_at)}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-3 line-clamp-2 group-hover:text-[#2d5016] transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                      {article.excerpt || article.content?.replace(/<[^>]+>/g, '').substring(0, 100) || 'Đang cập nhật nội dung...'}
                    </p>
                    <div className="flex items-center text-[#2d5016] font-semibold text-sm mt-auto group-hover:translate-x-1 transition-transform">
                      ĐỌC TIẾP <FiArrowRight className="ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500">Chưa có bài viết liên quan nào.</p>
            </div>
          )}
        </div>
      </div>
      
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setCommentToDelete(null);
        }}
        onConfirm={confirmDeleteComment}
        title="Xóa bình luận"
        message="Bạn có chắc chắn muốn xóa bình luận này không?"
        type="delete"
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </CustomerLayout>
  );
};

export default NewsDetailPage;


import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postsAPI, postCategoriesAPI } from '../../utils/api';
import MainLayout from '../../components/Layout/MainLayout';
import { FiSave, FiTrash2, FiX } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import SuccessModal from '../../components/Modal/SuccessModal';
import ErrorModal from '../../components/Modal/ErrorModal';
import ConfirmModal from '../../components/Modal/ConfirmModal';

const PostForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    coverImage: null,
    publishNow: false,
    publishDate: '',
    audience: 'Mọi người',
  });

  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchPost();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await postCategoriesAPI.getAll({ limit: 100 });
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getById(id);
      const post = response.data.data;
      setFormData({
        title: post.title || '',
        category: post.category?._id || post.category || '',
        description: post.description || '',
        publishNow: !post.publishDate,
        publishDate: post.publishDate || '',
        audience: post.audience || 'Mọi người',
      });
      if (post.coverImage) {
        setImagePreview(`http://localhost:3000${post.coverImage}`);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, coverImage: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('audience', formData.audience);
      formDataToSend.append('publishType', formData.publishNow ? 'now' : 'scheduled');
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage);
      }
      if (!formData.publishNow && formData.publishDate) {
        formDataToSend.append('scheduledDate', formData.publishDate);
      }

      if (isEdit) {
        await postsAPI.update(id, formDataToSend);
        setSuccessModal({ isOpen: true, message: 'Cập nhật bài viết thành công' });
      } else {
        await postsAPI.create(formDataToSend);
        setSuccessModal({ isOpen: true, message: 'Thêm bài viết thành công' });
      }

      setTimeout(() => {
        navigate('/admin/posts');
      }, 2000);
    } catch (error) {
      setErrorModal({
        isOpen: true,
        message: error.response?.data?.message || 'Thao tác thất bại, vui lòng thử lại sau',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await postsAPI.delete(id);
      setDeleteModal({ isOpen: false });
      navigate('/admin/posts');
    } catch (error) {
      setErrorModal({
        isOpen: true,
        message: 'Xóa bài viết thất bại, vui lòng thử lại sau',
      });
    }
  };

  return (
    <MainLayout title={isEdit ? 'Chỉnh sửa bài viết' : 'Thêm bài viết'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin bài viết</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục bài viết *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  >
                    <option value="">Chọn danh mục bài viết</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề bài viết *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập tiêu đề bài viết"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh bìa bài viết
                  </label>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Cover"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData({ ...formData, coverImage: null });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition">
                      <span className="text-gray-500 mb-2">Tải ảnh lên...</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả bài viết
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="Nhập mô tả bài viết"
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Chế độ hiển thị</h3>
              <p className="text-sm text-gray-600 mb-4">
                Chọn thời điểm xuất bản và những ai có thể thấy bài viết của bạn
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian xuất bản
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="publishNow"
                        checked={formData.publishNow}
                        onChange={() => setFormData({ ...formData, publishNow: true })}
                        className="mr-2"
                      />
                      <span className="text-sm">Đăng bài ngay</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="publishNow"
                        checked={!formData.publishNow}
                        onChange={() => setFormData({ ...formData, publishNow: false })}
                        className="mr-2"
                      />
                      <span className="text-sm">Lên lịch đăng bài</span>
                    </label>
                  </div>
                  {!formData.publishNow && (
                    <input
                      type="date"
                      name="publishDate"
                      value={formData.publishDate}
                      onChange={handleInputChange}
                      className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đối tượng xem bài
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="audience"
                        value="Mọi người"
                        checked={formData.audience === 'Mọi người'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-sm">Mọi người</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="audience"
                        value="Mọi người trên 18 tuổi"
                        checked={formData.audience === 'Mọi người trên 18 tuổi'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-sm">Mọi người trên 18 tuổi</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Đã lưu trên hệ thống 5 giây trước</span>
            {isEdit && (
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: true })}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <FiSave className="w-5 h-5" />
            <span>{isEdit ? 'Lưu Thay Đổi' : 'Lưu bài viết'}</span>
          </button>
        </div>
      </form>

      {/* Modals */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        title="Thành công"
        message={successModal.message}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="Thất bại"
        message={errorModal.message}
      />
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleDelete}
        title="Xóa bài viết"
        message="Sau khi xóa, bài viết sẽ không được hoàn tác và không hiển thị trên Website."
        type="delete"
        confirmText="Xóa"
      />
    </MainLayout>
  );
};

export default PostForm;


import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sellerProductsAPI } from '../../utils/sellerApi';
import { categoriesAPI } from '../../utils/api';
import SellerLayout from '../../components/Seller/SellerLayout';
import { FiX, FiSave, FiTrash2, FiPlus } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import SuccessModal from '../../components/Modal/SuccessModal';
import ErrorModal from '../../components/Modal/ErrorModal';
import ConfirmModal from '../../components/Modal/ConfirmModal';

const SellerProductForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        listedPrice: '',
        discountPercent: '0',
        description: '',
        initialQuantity: '',
        unit: 'kg',
        status: 'Còn hàng',
        allowComments: true,
        details: [],
    });

    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [newDetail, setNewDetail] = useState({ indexName: '', value: '', type: 'input' });
    const [loading, setLoading] = useState(false);
    const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false });

    useEffect(() => {
        fetchCategories();
        if (isEdit) {
            fetchProduct();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getAll({ limit: 100 });
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await sellerProductsAPI.getById(id);
            const product = response.data.data;
            setFormData({
                name: product.name || '',
                category: product.category?._id || product.category || '',
                listedPrice: product.listedPrice || '',
                discountPercent: product.discountPercent || '0',
                description: product.description || '',
                initialQuantity: product.initialQuantity || '',
                unit: product.unit || 'kg',
                status: product.status || 'Còn hàng',
                allowComments: product.allowComments !== undefined ? product.allowComments : true,
                details: product.details || [],
            });
            if (product.images && product.images.length > 0) {
                setImagePreviews(product.images.map(img => `http://localhost:3000${img}`));
            }
        } catch (error) {
            console.error('Error fetching product:', error);
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
        const files = Array.from(e.target.files);
        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index - imagePreviews.length + images.length);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const addDetail = () => {
        if (!newDetail.indexName.trim()) {
            alert('Vui lòng nhập tên chỉ số');
            return;
        }
        if (!newDetail.value.trim()) {
            alert('Vui lòng nhập giá trị cho chỉ số');
            return;
        }
        setFormData({
            ...formData,
            details: [...formData.details, { ...newDetail }],
        });
        setNewDetail({ indexName: '', value: '', type: 'input' });
    };

    const removeDetail = (index) => {
        setFormData({
            ...formData,
            details: formData.details.filter((_, i) => i !== index),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('listedPrice', formData.listedPrice);
            formDataToSend.append('discountPercent', formData.discountPercent);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('initialQuantity', formData.initialQuantity);
            formDataToSend.append('unit', formData.unit);
            formDataToSend.append('status', formData.status);
            formDataToSend.append('allowComments', formData.allowComments);
            const detailsToSend = Array.isArray(formData.details) ? formData.details : [];
            formDataToSend.append('details', JSON.stringify(detailsToSend));

            images.forEach((image) => {
                formDataToSend.append('images', image);
            });

            if (isEdit) {
                await sellerProductsAPI.update(id, formDataToSend);
                setSuccessModal({ isOpen: true, message: 'Cập nhật sản phẩm thành công, vui lòng chờ duyệt lại' });
            } else {
                await sellerProductsAPI.create(formDataToSend);
                setSuccessModal({ isOpen: true, message: 'Thêm sản phẩm thành công, vui lòng chờ duyệt' });
            }

            setTimeout(() => {
                navigate('/seller/products');
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
            await sellerProductsAPI.delete(id);
            setDeleteModal({ isOpen: false });
            setSuccessModal({ isOpen: true, message: 'Xóa sản phẩm thành công' });
            setTimeout(() => {
                navigate('/seller/products');
            }, 2000);
        } catch (error) {
            setErrorModal({
                isOpen: true,
                message: 'Xóa sản phẩm thất bại, vui lòng thử lại sau',
            });
        }
    };

    return (
        <SellerLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Product Name */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                    {formData.name || 'Tên sản phẩm'}
                                </h2>
                            </div>

                            {/* Product Information */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin sản phẩm</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tên sản phẩm *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Nhập tên sản phẩm"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phân loại *
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Giá niêm yết *
                                            </label>
                                            <input
                                                type="number"
                                                name="listedPrice"
                                                value={formData.listedPrice}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Nhập giá niêm yết"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Giá giảm (tính theo %)
                                            </label>
                                            <input
                                                type="number"
                                                name="discountPercent"
                                                value={formData.discountPercent}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="100"
                                                placeholder="Nhập giá giảm"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mô tả sản phẩm
                                        </label>
                                        <ReactQuill
                                            theme="snow"
                                            value={formData.description}
                                            onChange={(value) => setFormData({ ...formData, description: value })}
                                            placeholder="Nhập mô tả sản phẩm"
                                            className="bg-white"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="allowComments"
                                            id="allowComments"
                                            checked={formData.allowComments}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                        />
                                        <label htmlFor="allowComments" className="ml-2 text-sm text-gray-700">
                                            Cho phép mọi người bình luận sản phẩm này
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Product Images */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ảnh sản phẩm</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <FiX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {imagePreviews.length < 4 && (
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition">
                                            <FiPlus className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500">Tải ảnh lên...</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Product Control */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Kiểm soát sản phẩm</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số lượng sản phẩm đầu vào *
                                        </label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="number"
                                                name="initialQuantity"
                                                value={formData.initialQuantity}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Nhập số lượng"
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                            />
                                            <select
                                                name="unit"
                                                value={formData.unit}
                                                onChange={handleInputChange}
                                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                            >
                                                <option value="kg">Kg</option>
                                                <option value="tấn">Tấn</option>
                                                <option value="tạ">Tạ</option>
                                                <option value="yến">Yến</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số lượng còn lại
                                        </label>
                                        <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                                            {formData.initialQuantity || 0} {formData.unit}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Product Details */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Chi tiết sản phẩm</h3>
                                <div className="space-y-4">
                                    {['Loại hạt', 'Độ ẩm', 'Chỉ số dẻo', 'Protein', 'Tỉ lệ hạt gãy', 'Chỉ số đường', 'Chất xơ'].map((fieldName) => {
                                        const existingDetail = formData.details?.find(d => d.indexName === fieldName);
                                        const isSelect = fieldName === 'Chỉ số dẻo';
                                        return (
                                            <div key={fieldName}>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{fieldName}</label>
                                                {isSelect ? (
                                                    <select
                                                        value={existingDetail?.value || ''}
                                                        onChange={(e) => {
                                                            const updatedDetails = formData.details ? [...formData.details] : [];
                                                            const index = updatedDetails.findIndex(d => d.indexName === fieldName);
                                                            if (index >= 0) {
                                                                updatedDetails[index].value = e.target.value;
                                                            } else {
                                                                updatedDetails.push({ indexName: fieldName, value: e.target.value, type: 'select', options: ['Cao', 'Vừa', 'Thấp'] });
                                                            }
                                                            setFormData({ ...formData, details: updatedDetails });
                                                        }}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                                    >
                                                        <option value="">Chọn thông số</option>
                                                        <option value="Cao">Cao</option>
                                                        <option value="Vừa">Vừa</option>
                                                        <option value="Thấp">Thấp</option>
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={existingDetail?.value || ''}
                                                        onChange={(e) => {
                                                            const updatedDetails = formData.details ? [...formData.details] : [];
                                                            const index = updatedDetails.findIndex(d => d.indexName === fieldName);
                                                            if (index >= 0) {
                                                                updatedDetails[index].value = e.target.value;
                                                            } else {
                                                                updatedDetails.push({ indexName: fieldName, value: e.target.value, type: 'input' });
                                                            }
                                                            setFormData({ ...formData, details: updatedDetails });
                                                        }}
                                                        placeholder="Nhập thông số"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                        <div className="flex items-center space-x-4">
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
                            <span>{isEdit ? 'Lưu Thay Đổi' : 'Tạo Sản Phẩm'}</span>
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
                    title="Xóa sản phẩm"
                    message="Sau khi xóa, sản phẩm sẽ không được hoàn tác và thực hiện việc mua bán."
                    type="delete"
                    confirmText="Xóa"
                />
            </div>
        </SellerLayout>
    );
};

export default SellerProductForm;

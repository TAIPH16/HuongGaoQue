import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiCheck, FiX, FiUpload } from 'react-icons/fi';
import SellerLayout from '../../components/Seller/SellerLayout';
import { useSellerAuth } from '../../context/SellerAuthContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const SellerProfile = () => {
    const { seller, updateProfile, logout } = useSellerAuth();
    const navigate = useNavigate();

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    const [formData, setFormData] = useState(() => {
        // Normalize address if backend returned string
        let addr = seller?.address || {};
        if (addr && typeof addr === 'string') {
            try {
                addr = JSON.parse(addr);
            } catch {
                addr = { street: addr };
            }
        }
        return {
            fullName: seller?.fullName || seller?.name || '',
            email: seller?.email || '',
            phoneNumber: seller?.phoneNumber || '',
            address: {
                street: addr?.street || '',
                ward: addr?.ward || '',
                district: addr?.district || '',
                city: addr?.city || '',
                country: addr?.country || 'Việt Nam',
            },
            farmName: seller?.farmName || '',
            farmAddress: seller?.farmAddress || (typeof seller?.address === 'string' ? (addr?.street || '') : (seller?.address?.street || '')),
        };
    });

    useEffect(() => {
        if (seller) {
            // Normalize address if string
            let addr = seller.address || {};
            if (addr && typeof addr === 'string') {
                try {
                    addr = JSON.parse(addr);
                } catch {
                    addr = { street: addr };
                }
            }
            setFormData({
                fullName: seller.fullName || seller.name || '',
                email: seller.email || '',
                phoneNumber: seller.phoneNumber || '',
                address: {
                    street: addr?.street || '',
                    ward: addr?.ward || '',
                    district: addr?.district || '',
                    city: addr?.city || '',
                    country: addr?.country || 'Việt Nam',
                },
                farmName: seller.farmName || '',
                farmAddress: seller.farmAddress || addr?.street || '',
            });
            if (seller.profile_image) {
                const img = seller.profile_image.startsWith('http') || seller.profile_image.startsWith('data:')
                    ? seller.profile_image
                    : `${API_BASE_URL.replace('/api','')}${seller.profile_image}`;
                setAvatarPreview(img);
            }
        }
    }, [seller]);

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('fullName', formData.fullName);
            formDataToSend.append('phoneNumber', formData.phoneNumber);
            formDataToSend.append('address', JSON.stringify(formData.address));
            formDataToSend.append('farmName', formData.farmName);
            formDataToSend.append('farmAddress', formData.farmAddress);

            if (avatar) {
                formDataToSend.append('avatar', avatar);
            }

            const token = localStorage.getItem('sellerToken');
            const response = await axios.put(
                `${API_BASE_URL}/seller/auth/profile`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            updateProfile(response.data.data);
            setSuccess('Cập nhật thông tin thành công!');
            setEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
            setTimeout(() => setError(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditing(false);
        if (seller) {
            setFormData({
                fullName: seller.fullName || seller.name || '',
                email: seller.email || '',
                phoneNumber: seller.phoneNumber || '',
                address: {
                    street: seller.address?.street || '',
                    ward: seller.address?.ward || '',
                    district: seller.address?.district || '',
                    city: seller.address?.city || '',
                    country: seller.address?.country || 'Việt Nam',
                },
                farmName: seller.farmName || '',
                farmAddress: seller.farmAddress || seller.address?.street || '',
            });
            setAvatarPreview(seller.profile_image || '');
            setAvatar(null);
        }
    };

    return (
        <SellerLayout>
            <div className="space-y-6">
                {/* Messages */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
                        {!editing ? (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                <FiEdit />
                                <span>Chỉnh sửa</span>
                            </button>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    <FiCheck />
                                    <span>{loading ? 'Đang lưu...' : 'Lưu'}</span>
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                >
                                    <FiX />
                                    <span>Hủy</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Avatar Section */}
                    <div className="flex items-center space-x-6 mb-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl text-green-600">
                                        {seller?.name?.charAt(0).toUpperCase() || 'S'}
                                    </span>
                                )}
                            </div>
                            {editing && (
                                <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition">
                                    <FiUpload />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{seller?.name || seller?.fullName}</h3>
                            <p className="text-gray-600">{seller?.email}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Seller ID: {seller?.id || seller?._id}
                            </p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Họ và tên
                            </label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Nhập họ và tên"
                                />
                            ) : (
                                <p className="text-gray-800 font-semibold">{formData.fullName || '-'}</p>
                            )}
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <p className="text-gray-800 font-semibold">{formData.email}</p>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số điện thoại
                            </label>
                            {editing ? (
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Nhập số điện thoại"
                                />
                            ) : (
                                <p className="text-gray-800 font-semibold">{formData.phoneNumber || '-'}</p>
                            )}
                        </div>

                        {/* Farm Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên trang trại
                            </label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={formData.farmName}
                                    onChange={(e) => handleInputChange('farmName', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Nhập tên trang trại"
                                />
                            ) : (
                                <p className="text-gray-800 font-semibold">{formData.farmName || '-'}</p>
                            )}
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Địa chỉ
                            </label>
                            {editing ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={formData.address.street}
                                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Số nhà, đường"
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <input
                                            type="text"
                                            value={formData.address.ward}
                                            onChange={(e) => handleInputChange('address.ward', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Phường/Xã"
                                        />
                                        <input
                                            type="text"
                                            value={formData.address.district}
                                            onChange={(e) => handleInputChange('address.district', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Quận/Huyện"
                                        />
                                        <input
                                            type="text"
                                            value={formData.address.city}
                                            onChange={(e) => handleInputChange('address.city', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Tỉnh/Thành phố"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.address.country}
                                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Quốc gia"
                                    />
                                </div>
                            ) : (
                                <p className="text-gray-800 font-semibold">
                                    {[formData.address.street, formData.address.ward, formData.address.district, formData.address.city, formData.address.country]
                                        .filter(Boolean)
                                        .join(', ') || '-'}
                                </p>
                            )}
                        </div>

                        {/* Farm Address */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Địa chỉ trang trại
                            </label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={formData.farmAddress}
                                    onChange={(e) => handleInputChange('farmAddress', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Nhập địa chỉ trang trại"
                                />
                            ) : (
                                <p className="text-gray-800 font-semibold">{formData.farmAddress || '-'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Account Status */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Trạng thái tài khoản</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Role</p>
                            <p className="font-semibold text-blue-600 capitalize">{seller?.role}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Trạng thái duyệt</p>
                            <p className={`font-semibold ${seller?.is_approved ? 'text-green-600' : 'text-yellow-600'}`}>
                                {seller?.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Trạng thái tài khoản</p>
                            <p className={`font-semibold ${seller?.is_banned ? 'text-red-600' : 'text-green-600'}`}>
                                {seller?.is_banned ? 'Đã khóa' : 'Hoạt động'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerProfile;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellersAPI } from '../../utils/api';
import MainLayout from '../../components/Layout/MainLayout';
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import SuccessModal from '../../components/Modal/SuccessModal';
import ErrorModal from '../../components/Modal/ErrorModal';

const SellerEditForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        ward: '',
        district: '',
        city: '',
        country: 'Việt Nam',
    });

    useEffect(() => {
        fetchSeller();
    }, [id]);

    const fetchSeller = async () => {
        try {
            const response = await sellersAPI.getById(id);
            const seller = response.data.data;

            setFormData({
                fullName: seller.fullName || seller.name || '',
                email: seller.email || '',
                phoneNumber: seller.phoneNumber || seller.phone || '',
                address:
                    typeof seller.address === 'string'
                        ? seller.address
                        : seller.address?.street || '',
                ward: seller.address?.ward || '',
                district: seller.address?.district || '',
                city: seller.address?.city || seller.region || '',
                country: seller.address?.country || 'Việt Nam',
            });
        } catch (error) {
            console.error('Error fetching seller:', error);
            setErrorModal({
                isOpen: true,
                message: 'Không tìm thấy người bán',
            });
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const formDataToSend = new FormData();
            formDataToSend.append('fullName', formData.fullName);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phoneNumber', formData.phoneNumber);
            formDataToSend.append('address', JSON.stringify({
                street: formData.address,
                ward: formData.ward,
                district: formData.district,
                city: formData.city,
                country: formData.country,
            }));

            // Set region from city if available
            if (formData.city) {
                formDataToSend.append('region', formData.city);
            }

            await sellersAPI.update(id, formDataToSend);
            setSuccessModal({ isOpen: true, message: 'Cập nhật thông tin người bán thành công' });

            setTimeout(() => {
                navigate(`/admin/sellers/${id}`);
            }, 2000);
        } catch (error) {
            console.error('Error updating seller:', error);
            setErrorModal({
                isOpen: true,
                message: error.response?.data?.message || 'Cập nhật thông tin thất bại, vui lòng thử lại'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout title="Chỉnh sửa hồ sơ người bán">
            <div className="space-y-6">
                {/* Back button */}
                <button
                    onClick={() => navigate(`/admin/sellers/${id}`)}
                    className="flex items-center text-gray-600 hover:text-green-600 mb-4"
                >
                    <FiArrowLeft className="mr-2" /> Quay lại
                </button>

                {/* Form */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Chỉnh sửa thông tin người bán</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên *</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phường</label>
                                <input
                                    type="text"
                                    name="ward"
                                    value={formData.ward}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quận</label>
                                <input
                                    type="text"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t">
                        <button
                            onClick={() => navigate(`/admin/sellers/${id}`)}
                            className="flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            <FiX className="w-4 h-4" />
                            <span>Hủy</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiSave className="w-4 h-4" />
                            <span>{loading ? 'Đang lưu...' : 'Lưu'}</span>
                        </button>
                    </div>
                </div>
            </div>

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
        </MainLayout>
    );
};

export default SellerEditForm;

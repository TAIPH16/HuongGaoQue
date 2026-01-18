import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellersAPI } from '../../utils/api';
import MainLayout from '../../components/Layout/MainLayout';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiEdit } from 'react-icons/fi';

const SellerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSellerDetail();
    }, [id]);

    const fetchSellerDetail = async () => {
        try {
            const response = await sellersAPI.getById(id);
            setSeller(response.data.data);
        } catch (error) {
            console.error('Lỗi tải thông tin:', error);
            alert('Không tìm thấy người bán');
            navigate('/admin/sellers');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <MainLayout><div className="p-10 text-center">Đang tải...</div></MainLayout>;
    if (!seller) return null;

    return (
        <MainLayout title="Chi Tiết Người Bán">
            <div className="space-y-6">
                {/* Nút quay lại */}
                <button
                    onClick={() => navigate('/admin/sellers')}
                    className="flex items-center text-gray-600 hover:text-green-600 mb-4"
                >
                    <FiArrowLeft className="mr-2" /> Quay lại danh sách
                </button>

                {/* Thông tin chính */}
                <div className="bg-white rounded-lg shadow p-6 relative overflow-hidden">
                    {/* Banner trạng thái */}
                    {(seller.isBanned || seller.is_banned) && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-8 py-1 transform rotate-45 translate-x-8 translate-y-4 z-10">
                            ĐÃ BỊ CẤM
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${(seller.isBanned || seller.is_banned) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {(seller.name || seller.fullName || seller.email || 'S')?.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl font-bold text-gray-800">{seller.name || seller.fullName || seller.email || 'Chưa đặt tên'}</h2>
                                <button
                                    onClick={() => navigate(`/admin/sellers/${id}/edit`)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    <FiEdit className="w-4 h-4" />
                                    <span>Chỉnh sửa hồ sơ người bán</span>
                                </button>
                            </div>
                            <div className="space-y-3 text-gray-600">
                                <div className="flex items-center">
                                    <FiMapPin className="mr-2 w-5 h-5" />
                                    <span className="font-semibold mr-2">Khu vực:</span>
                                    <span>{seller.region || seller.address?.city || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="flex items-center">
                                    <FiMail className="mr-2 w-5 h-5" />
                                    <span className="font-semibold mr-2">Email:</span>
                                    <span>{seller.email || 'Chưa có email'}</span>
                                </div>
                                <div className="flex items-center">
                                    <FiPhone className="mr-2 w-5 h-5" />
                                    <span className="font-semibold mr-2">Số điện thoại:</span>
                                    <span>{seller.phoneNumber || seller.phone || 'Chưa có SĐT'}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-semibold mr-2">Ngày tham gia:</span>
                                    <span>
                                        {seller.created_at ? new Date(seller.created_at).toLocaleDateString('vi-VN') :
                                            seller.createdAt ? new Date(seller.createdAt).toLocaleDateString('vi-VN') :
                                                'Chưa có thông tin'}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Khu vực mở rộng: Lịch sử hoạt động */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold mb-4">Lịch sử hoạt động</h3>
                    <p className="text-gray-500 italic">Tính năng hiển thị lịch sử sản phẩm và doanh thu đang được cập nhật...</p>
                </div>
            </div>
        </MainLayout>
    );
};

export default SellerDetail;

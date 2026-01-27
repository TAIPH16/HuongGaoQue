import { useState, useEffect } from 'react';
import { sellersAPI } from '../../utils/api';
import MainLayout from '../../components/Layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiMoreVertical, FiMinus, FiEdit, FiCheckCircle } from 'react-icons/fi';

const SellerManagement = () => {
    const [sellers, setSellers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tất cả');
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [selectedSeller, setSelectedSeller] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSellers();
        fetchStats();
    }, [pagination.currentPage, searchTerm, statusFilter]);

    const fetchSellers = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.currentPage,
                limit: 25,
                search: searchTerm,
            };
            if (statusFilter !== 'Tất cả') {
                params.status = statusFilter;
            }

            const response = await sellersAPI.getAll(params);
            setSellers(response.data.data || []);
            setPagination(response.data.pagination || { currentPage: 1, totalPages: 1 });
        } catch (error) {
            console.error('Error fetching sellers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await sellersAPI.getStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Ban seller
    const handleBan = async (seller) => {
        if (window.confirm(`Bạn có chắc chắn muốn chặn người bán ${seller.name || seller.fullName || seller.email || 'này'}? Người bán sẽ không thể đăng nhập.`)) {
            try {
                await sellersAPI.ban(seller._id);
                alert('Đã chặn người bán thành công!');
                fetchSellers();
                setSelectedSeller(null);
            } catch (error) {
                console.error('Lỗi khi chặn người bán:', error);
                alert('Có lỗi xảy ra, vui lòng thử lại.');
            }
        }
    };

    // Unban seller
    const handleUnban = async (seller) => {
        if (window.confirm(`Bạn có chắc chắn muốn mở khóa người bán ${seller.name || seller.fullName || seller.email || 'này'}?`)) {
            try {
                await sellersAPI.unban(seller._id);
                alert('Đã mở khóa người bán thành công!');
                fetchSellers();
                setSelectedSeller(null);
            } catch (error) {
                console.error('Lỗi khi mở khóa người bán:', error);
                alert('Có lỗi xảy ra, vui lòng thử lại.');
            }
        }
    };

    // Hide seller
    const handleHide = async (seller) => {
        if (window.confirm(`Bạn có chắc chắn muốn ẩn người bán ${seller.name || seller.fullName || seller.email || 'này'}?`)) {
            try {
                await sellersAPI.hide(seller._id);
                alert('Đã ẩn người bán thành công!');
                fetchSellers();
                setSelectedSeller(null);
            } catch (error) {
                console.error('Lỗi khi ẩn người bán:', error);
                alert('Có lỗi xảy ra, vui lòng thử lại.');
            }
        }
    };

    // Unhide seller
    const handleUnhide = async (seller) => {
        if (window.confirm(`Bạn có chắc chắn muốn hiện lại người bán ${seller.name || seller.fullName || seller.email || 'này'}?`)) {
            try {
                await sellersAPI.unhide(seller._id);
                alert('Đã hiện lại người bán thành công!');
                fetchSellers();
                setSelectedSeller(null);
            } catch (error) {
                console.error('Lỗi khi hiện lại người bán:', error);
                alert('Có lỗi xảy ra, vui lòng thử lại.');
            }
        }
    };

    // Approve seller
    const handleApprove = async (seller) => {
        if (window.confirm(`Bạn có chắc chắn muốn duyệt người bán ${seller.name || seller.fullName || seller.email || 'này'}? Người bán sẽ có thể đăng nhập.`)) {
            try {
                await sellersAPI.approve(seller._id);
                alert('Đã duyệt người bán thành công! Người bán có thể đăng nhập.');
                fetchSellers();
                fetchStats();
                setSelectedSeller(null);
            } catch (error) {
                console.error('Lỗi khi duyệt người bán:', error);
                alert('Có lỗi xảy ra, vui lòng thử lại.');
            }
        }
    };

    return (
        <MainLayout title="Quản Lí Người Bán" onSearch={setSearchTerm}>
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Tổng số người bán</h3>
                        <p className="text-2xl font-bold text-gray-800">{stats?.totalSellers || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">Tất cả người bán trong hệ thống</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Người bán hoạt động</h3>
                        <p className="text-2xl font-bold text-gray-800">{stats?.activeSellers || 0}</p>
                        <p className="text-sm text-green-600 mt-1">✓ Đang hoạt động bình thường</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Người bán bị cấm</h3>
                        <p className="text-2xl font-bold text-gray-800">{stats?.bannedSellers || 0}</p>
                        <p className="text-sm text-red-600 mt-1">✗ Đã bị chặn</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-lg shadow">
                    <div className="flex space-x-1 p-1 border-b border-gray-200">
                        {['Tất cả', 'Hoạt động', 'Đã cấm', 'Đã ẩn'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setStatusFilter(tab)}
                                className={`px-4 py-2 text-sm font-medium transition ${statusFilter === tab
                                    ? 'text-green-600 border-b-2 border-green-600'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sellers Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        <input type="checkbox" className="rounded" />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Người Bán</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khu Vực</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số Điện Thoại</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : sellers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                            Không có người bán nào
                                        </td>
                                    </tr>
                                ) : (
                                    sellers.map((seller) => (
                                        <tr key={seller._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input type="checkbox" className="rounded" />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(seller.isBanned || seller.is_banned) ? 'bg-red-100' : 'bg-green-100'}`}>
                                                        <span className={`${(seller.isBanned || seller.is_banned) ? 'text-red-600' : 'text-green-600'} text-xs font-semibold`}>
                                                            {seller.name?.charAt(0) || seller.fullName?.charAt(0) || seller.email?.charAt(0).toUpperCase() || 'S'}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{seller.name || seller.fullName || seller.email || "Chưa đặt tên"}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {seller.region || seller.address?.city ?
                                                    (seller.region || seller.address.city) :
                                                    <span className="text-gray-400 italic text-xs">Chưa cập nhật</span>}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {seller.phoneNumber ? seller.phoneNumber : <span className="text-gray-400 italic text-xs">--</span>}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seller.email}</td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {seller.isBanned || seller.is_banned ? (
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        ● Đã cấm
                                                    </span>
                                                ) : seller.isHidden || seller.is_hidden ? (
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        ● Đã ẩn
                                                    </span>
                                                ) : !seller.is_approved ? (
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        ● Chờ duyệt
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        ● Hoạt động
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center space-x-2">
                                                    {/* Approve button - chỉ hiện khi chưa approve */}
                                                    {!seller.is_approved && !(seller.isBanned || seller.is_banned) && (
                                                        <button
                                                            onClick={() => handleApprove(seller)}
                                                            className="px-3 py-1.5 flex items-center space-x-1 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors text-xs font-medium shadow-sm"
                                                            title="Chấp nhận người bán"
                                                        >
                                                            <FiCheckCircle className="w-3.5 h-3.5" />
                                                            <span>Chấp nhận</span>
                                                        </button>
                                                    )}

                                                    {/* Ban button - chỉ hiện khi đã approve */}
                                                    {seller.is_approved && !(seller.isBanned || seller.is_banned) && !(seller.isHidden || seller.is_hidden) && (
                                                        <button
                                                            onClick={() => handleBan(seller)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 border border-red-300 text-red-600 hover:bg-red-100 transition-colors"
                                                            title="Chặn người bán (không cho đăng nhập)"
                                                        >
                                                            <FiMinus className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {(seller.isBanned || seller.is_banned) && (
                                                        <button
                                                            onClick={() => handleUnban(seller)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 border border-green-300 text-green-600 hover:bg-green-100 transition-colors"
                                                            title="Bỏ chặn người bán"
                                                        >
                                                            <FiCheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    <div className="relative">
                                                        <button
                                                            onClick={() =>
                                                                setSelectedSeller(
                                                                    selectedSeller === seller._id ? null : seller._id
                                                                )
                                                            }
                                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                                                        >
                                                            <FiMoreVertical className="w-5 h-5" />
                                                        </button>

                                                        {selectedSeller === seller._id && (
                                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                                                                <button
                                                                    onClick={() => {
                                                                        navigate(`/admin/sellers/${seller._id}`);
                                                                        setSelectedSeller(null);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                                                                >
                                                                    <FiEdit className="w-4 h-4" />
                                                                    <span>Chỉnh sửa</span>
                                                                </button>

                                                                {!(seller.isHidden || seller.is_hidden) && (
                                                                    <button
                                                                        onClick={() => {
                                                                            handleHide(seller);
                                                                            setSelectedSeller(null);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                                                                    >
                                                                        <FiMinus className="w-4 h-4" />
                                                                        <span>Ẩn người bán</span>
                                                                    </button>
                                                                )}

                                                                {(seller.isHidden || seller.is_hidden) && (
                                                                    <button
                                                                        onClick={() => {
                                                                            handleUnhide(seller);
                                                                            setSelectedSeller(null);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center space-x-2 transition-colors"
                                                                    >
                                                                        <FiCheckCircle className="w-4 h-4" />
                                                                        <span>Hiện lại người bán</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Hiển thị {sellers.length} trên {pagination.totalSellers || 0} người bán
                        </p>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                                disabled={pagination.currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                            >
                                &lt;
                            </button>
                            {[...Array(Math.min(5, pagination.totalPages || 1))].map((_, i) => {
                                const page = pagination.currentPage <= 3 ? i + 1 : pagination.currentPage - 2 + i;
                                if (page > pagination.totalPages) return null;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setPagination({ ...pagination, currentPage: page })}
                                        className={`px-3 py-1 rounded-lg ${page === pagination.currentPage
                                            ? 'bg-green-600 text-white'
                                            : 'border border-gray-300'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default SellerManagement;

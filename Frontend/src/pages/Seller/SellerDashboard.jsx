import { useState, useEffect } from 'react';
import SellerLayout from '../../components/Seller/SellerLayout';
import { sellerOrdersAPI } from '../../utils/sellerApi';
import { FiDollarSign, FiPackage, FiShoppingCart, FiTrendingUp } from 'react-icons/fi';

const SellerDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await sellerOrdersAPI.getDashboard();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SellerLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            <div className="space-y-6">
                {/* Welcome */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Chào mừng trở lại!</h2>
                    <p className="text-gray-600">Đây là tổng quan về tình hình kinh doanh của bạn.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {new Intl.NumberFormat('vi-VN').format(stats?.totalRevenue || 0)}₫
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FiDollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-sm text-green-600">↑ Tổng thu nhập</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Đơn hàng</p>
                                <p className="text-2xl font-bold text-gray-800">{stats?.totalOrders || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiShoppingCart className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-sm text-yellow-600">{stats?.pendingOrders || 0} đơn chờ xử lý</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Sản phẩm</p>
                                <p className="text-2xl font-bold text-gray-800">{stats?.totalProducts || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FiPackage className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">{stats?.totalProducts || 0} sản phẩm</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Sản phẩm bán</p>
                                <p className="text-2xl font-bold text-gray-800">{stats?.totalProductsSold || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <FiTrendingUp className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">Tổng số lượng đã bán</p>
                    </div>
                </div>

                {/* Products List */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold mb-4">Sản phẩm của bạn</h3>
                    {stats?.products && stats.products.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kho</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {stats.products.slice(0, 5).map((product) => (
                                        <tr key={product._id}>
                                            <td className="px-4 py-3 text-sm text-gray-800">{product.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-800">
                                                {new Intl.NumberFormat('vi-VN').format(product.listedPrice)}₫
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-800">{product.remainingQuantity}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs rounded-full ${product.is_approved
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {product.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">Chưa có sản phẩm nào</p>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold mb-4">Thao tác nhanh</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="/seller/products/add"
                            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition"
                        >
                            <FiPackage />
                            <span>Thêm sản phẩm mới</span>
                        </a>
                        <a
                            href="/seller/products"
                            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            <FiPackage />
                            <span>Quản lý sản phẩm</span>
                        </a>
                        <a
                            href="/seller/orders"
                            className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition"
                        >
                            <FiShoppingCart />
                            <span>Xem đơn hàng</span>
                        </a>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerDashboard;

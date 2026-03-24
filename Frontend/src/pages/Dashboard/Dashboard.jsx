import { useEffect, useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { FiPackage, FiShoppingCart, FiUsers, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { productsAPI, ordersAPI, postsAPI } from '../../utils/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [revenueStats, setRevenueStats] = useState(null);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [revenueError, setRevenueError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [shoppingBehaviorData, setShoppingBehaviorData] = useState([]);
  const [articleBehaviorData, setArticleBehaviorData] = useState([]);
  const [topViewedProducts, setTopViewedProducts] = useState([]);
  const [loadingCharts, setLoadingCharts] = useState(false);

  useEffect(() => {
    fetchRevenueStats();
    fetchChartsData();
  }, []);

  const fetchRevenueStats = async (params = {}) => {
    try {
      setLoadingRevenue(true);
      setRevenueError('');

      const cleanedParams = {};
      if (params.startDate) cleanedParams.startDate = params.startDate;
      if (params.endDate) cleanedParams.endDate = params.endDate;

      const response = await productsAPI.getRevenueStats(cleanedParams);
      // Giả định backend trả về { data: { totalRevenue, totalProducts, totalSold } }
      setRevenueStats(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      setRevenueError('Không thể tải báo cáo doanh thu. Vui lòng thử lại sau.');
    } finally {
      setLoadingRevenue(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '0₫';
    return new Intl.NumberFormat('vi-VN').format(value) + '₫';
  };

  const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  };

  const fetchChartsData = async (paramsOverride) => {
    try {
      setLoadingCharts(true);
      const params = paramsOverride || {};
      if (!params.startDate && dateRange.startDate) params.startDate = dateRange.startDate;
      if (!params.endDate && dateRange.endDate) params.endDate = dateRange.endDate;

      const [orderRes, postRes] = await Promise.all([
        ordersAPI.getStatsByDate(params),
        postsAPI.getViewsByDate(params),
      ]);

      const orderData = orderRes.data?.data || [];
      const postData = postRes.data?.data || [];

      setShoppingBehaviorData(
        orderData.map((item) => ({
          date: formatDateShort(item.date),
          dateFull: item.date,
          orderCount: item.orderCount || 0,
          revenue: item.revenue || 0,
        }))
      );
      setArticleBehaviorData(
        postData.map((item) => ({
          period: formatDateShort(item.date),
          dateFull: item.date,
          views: item.views || 0,
        }))
      );

      // Fetch top 5 sản phẩm xem nhiều nhất
      try {
        const topRes = await import('../../utils/api').then(m => m.productsAPI.getTopViewed({ limit: 5 }));
        const topData = topRes.data?.data || [];
        setTopViewedProducts(topData.map(p => ({ name: p.name?.length > 15 ? p.name.substring(0, 15) + '...' : p.name, viewCount: p.viewCount || 0 })));
      } catch (_) {
        setTopViewedProducts([]);
      }
    } catch (err) {
      console.error('Error fetching charts:', err);
      setShoppingBehaviorData([]);
      setArticleBehaviorData([]);
    } finally {
      setLoadingCharts(false);
    }
  };

  return (
    <MainLayout title="Thống kê doanh thu">
      <div className="space-y-6">
        {/* Revenue Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Báo cáo doanh thu tổng quan</h2>
              <p className="text-sm text-gray-500 mt-1">
                Xem nhanh tình hình doanh thu và sản lượng bán ra trên toàn hệ thống trong khoảng thời gian đã chọn.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Từ ngày</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Đến ngày</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <button
                onClick={() => {
                  fetchRevenueStats(dateRange);
                  fetchChartsData(dateRange);
                }}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
              >
                Áp dụng
              </button>
            </div>
          </div>

          {revenueError && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-sm text-red-700">
              {revenueError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-900">
                {loadingRevenue && !revenueStats ? 'Đang tải...' : formatCurrency(revenueStats?.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Tổng tiền từ các đơn hàng đã ghi nhận</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-100 bg-white">
              <p className="text-sm text-gray-600 mb-1">Tổng sản phẩm tham gia doanh thu</p>
              <p className="text-2xl font-bold text-gray-900">
                {loadingRevenue && !revenueStats ? 'Đang tải...' : formatNumber(revenueStats?.totalProducts)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Số sản phẩm đã bán có phát sinh doanh thu</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-100 bg-white">
              <p className="text-sm text-gray-600 mb-1">Tổng số lượng bán ra</p>
              <p className="text-2xl font-bold text-gray-900">
                {loadingRevenue && !revenueStats ? 'Đang tải...' : formatNumber(revenueStats?.totalSold)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Tổng số lượng đơn vị sản phẩm được bán</p>
            </div>
          </div>
        </div>

        {/* Stats Grid điều hướng nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Quản lý sản phẩm',
              description: 'Xem và duyệt sản phẩm trên hệ thống',
              icon: FiPackage,
              color: 'bg-blue-500',
              onClick: () => navigate('/admin/products'),
            },
            {
              title: 'Quản lý đơn hàng',
              description: 'Xem danh sách và trạng thái đơn hàng',
              icon: FiShoppingCart,
              color: 'bg-green-500',
              onClick: () => navigate('/admin/orders'),
            },
            {
              title: 'Quản lý khách hàng',
              description: 'Theo dõi và quản lý tài khoản khách hàng',
              icon: FiUsers,
              color: 'bg-purple-500',
              onClick: () => navigate('/admin/customers'),
            },
            {
              title: 'Quản lý bài viết',
              description: 'Tin tức, bài viết giới thiệu sản phẩm',
              icon: FiFileText,
              color: 'bg-orange-500',
              onClick: () => navigate('/admin/posts'),
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                onClick={item.onClick}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <div className={`${item.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts - dữ liệu thật từ API */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hành vi mua hàng</h3>
            {loadingCharts ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
              </div>
            ) : shoppingBehaviorData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Chưa có dữ liệu đơn hàng trong khoảng thời gian này
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={shoppingBehaviorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : value, name === 'revenue' ? 'Doanh thu' : 'Số đơn']}
                      labelFormatter={(label) => `Ngày ${label}`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="orderCount" name="Số đơn" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 flex justify-between text-sm text-gray-600">
                  <span>Tổng đơn: {formatNumber(shoppingBehaviorData.reduce((s, d) => s + (d.orderCount || 0), 0))}</span>
                  <span>Doanh thu: {formatCurrency(shoppingBehaviorData.reduce((s, d) => s + (d.revenue || 0), 0))}</span>
                </div>
              </>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hành vi xem bài viết</h3>
            {loadingCharts ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
              </div>
            ) : articleBehaviorData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Chưa có dữ liệu lượt xem bài viết trong khoảng thời gian này
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={articleBehaviorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Lượt xem']} labelFormatter={(label) => `Ngày ${label}`} />
                    <Bar dataKey="views" name="Lượt xem" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 flex justify-between text-sm text-gray-600">
                  <span>Tổng lượt xem: {formatNumber(articleBehaviorData.reduce((s, d) => s + (d.views || 0), 0))}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* FC2 - Top 5 sản phẩm được xem nhiều nhất */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">👁 Top 5 sản phẩm được xem nhiều nhất</h3>
          {loadingCharts ? (
            <div className="h-[250px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
            </div>
          ) : topViewedProducts.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              Chưa có dữ liệu lượt xem sản phẩm
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topViewedProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [value, 'Lượt xem']} />
                <Bar dataKey="viewCount" name="Lượt xem" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/products/add')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition text-left"
            >
              <FiPackage className="w-6 h-6 text-gray-400 mb-2" />
              <p className="font-medium text-gray-800">Thêm sản phẩm</p>
            </button>
            <button
              onClick={() => navigate('/admin/posts/add')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition text-left"
            >
              <FiFileText className="w-6 h-6 text-gray-400 mb-2" />
              <p className="font-medium text-gray-800">Thêm bài viết</p>
            </button>
            <button
              onClick={() => navigate('/admin/products/categories')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition text-left"
            >
              <FiPackage className="w-6 h-6 text-gray-400 mb-2" />
              <p className="font-medium text-gray-800">Quản lý danh mục</p>
            </button>
            <button
              onClick={() => navigate('/admin/profile')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition text-left"
            >
              <FiUsers className="w-6 h-6 text-gray-400 mb-2" />
              <p className="font-medium text-gray-800">Thông tin cá nhân</p>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;


import MainLayout from '../../components/Layout/MainLayout';
import { FiPackage, FiShoppingCart, FiUsers, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
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

  // Mock data for charts
  const shoppingBehaviorData = [
    { date: '25/09', views: 1200 },
    { date: '26/09', views: 1500 },
    { date: '27/09', views: 1800 },
    { date: '28/09', views: 1600 },
    { date: '29/09', views: 2000 },
    { date: '30/09', views: 2200 },
    { date: '01/10', views: 2400 },
  ];

  const articleBehaviorData = [
    { period: '01', views: 300 },
    { period: '02', views: 250 },
    { period: '03', views: 400 },
    { period: '04', views: 350 },
    { period: '05', views: 500 },
    { period: '06', views: 450 },
    { period: '07', views: 600 },
    { period: '08', views: 550 },
    { period: '09', views: 700 },
    { period: '10', views: 650 },
    { period: '11', views: 800 },
    { period: '12', views: 750 },
  ];

  const stats = [
    {
      title: 'Tổng sản phẩm',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: FiPackage,
      color: 'bg-blue-500',
      onClick: () => navigate('/admin/products'),
    },
    {
      title: 'Tổng đơn hàng',
      value: '567',
      change: '+8%',
      trend: 'up',
      icon: FiShoppingCart,
      color: 'bg-green-500',
      onClick: () => navigate('/admin/orders'),
    },
    {
      title: 'Tổng khách hàng',
      value: '890',
      change: '+15%',
      trend: 'up',
      icon: FiUsers,
      color: 'bg-purple-500',
      onClick: () => navigate('/admin/customers'),
    },
    {
      title: 'Tổng bài viết',
      value: '123',
      change: '+5%',
      trend: 'up',
      icon: FiFileText,
      color: 'bg-orange-500',
      onClick: () => navigate('/admin/posts'),
    },
  ];

  return (
    <MainLayout title="Thống kê doanh thu">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={stat.onClick}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hành vi mua hàng</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={shoppingBehaviorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#10B981" fill="#10B981" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-gray-600">8,238 Tổng lượt xem SP</span>
              <span className="text-gray-600">6,607 Lượt xem SP kế</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hành vi xem bài viết</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={articleBehaviorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-gray-600">340 Lượt xem hết bài</span>
              <span className="text-gray-600">4,240 Tổng lượt xem</span>
            </div>
          </div>
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


import { Link, useLocation } from 'react-router-dom';
import {
  FiBarChart2,
  FiPackage,
  FiShoppingCart,
  FiFileText,
  FiUsers,
  FiUser,
  FiBell,
  FiLogOut,
  FiBriefcase
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/admin/dashboard', icon: FiBarChart2, label: 'Thống kê doanh thu' },
    {
      path: '/admin/products',
      icon: FiPackage,
      label: 'Sản phẩm',
      subItems: [
        { path: '/admin/products', label: 'Danh sách' },
        { path: '/admin/products/categories', label: 'Danh mục' },
      ],
    },
    { path: '/admin/orders', icon: FiShoppingCart, label: 'Đơn hàng' },
    { path: '/admin/posts', icon: FiFileText, label: 'Bài viết' },
    { path: '/admin/customers', icon: FiUsers, label: 'Khách hàng' },
    { path: '/admin/sellers', icon: FiBriefcase, label: 'Quản lý người bán' },
    { path: '/admin/notifications', icon: FiBell, label: 'Thông báo' },
    { path: '/admin/profile', icon: FiUser, label: 'Thông tin quản trị viên' },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
          <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
            <span className="text-white text-sm font-bold">HGQ</span>
          </div>
          <span className="text-lg font-bold text-gray-800">HƯƠNG GẠO QUÊ</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <div key={item.path} className="mb-2">
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${active
                  ? 'bg-green-50 text-green-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 w-full transition"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Thoát</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;


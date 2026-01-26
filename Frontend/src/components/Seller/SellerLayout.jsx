import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiBarChart2, FiPackage, FiShoppingCart, FiUser, FiLogOut, FiBox, FiHome } from 'react-icons/fi';
import { useSellerAuth } from '../../context/SellerAuthContext';

const SellerLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { seller, logout } = useSellerAuth();

    const menuItems = [
        { path: '/seller/dashboard', icon: FiBarChart2, label: 'Dashboard' },
        { path: '/seller/products', icon: FiPackage, label: 'Sản phẩm của tôi' },
        { path: '/seller/stock', icon: FiBox, label: 'Quản lý kho' },
        { path: '/seller/orders', icon: FiShoppingCart, label: 'Đơn hàng' },
        { path: '/seller/farm', icon: FiHome, label: 'Quản lý nông trại' },
        { path: '/seller/profile', icon: FiUser, label: 'Hồ sơ' },
    ];

    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/seller/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg fixed h-screen">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200">
                    <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                            <span className="text-white text-sm font-bold">HGQ</span>
                        </div>
                        <div>
                            <span className="text-lg font-bold text-gray-800 block">HƯƠNG GẠO QUÊ</span>
                            <span className="text-xs text-gray-500">Seller Portal</span>
                        </div>
                    </Link>
                </div>

                {/* Seller Info */}
                <div className="p-4 border-b border-gray-200 bg-green-50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                            <span className="text-white font-semibold">
                                {seller?.name?.charAt(0).toUpperCase() || 'S'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                                {seller?.name || seller?.fullName || 'Seller'}
                            </p>
                            <p className="text-xs text-gray-600 truncate">{seller?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${active
                                        ? 'bg-green-50 text-green-600 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition"
                    >
                        <FiLogOut className="w-5 h-5" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64">
                {/* Header */}
                <div className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {menuItems.find(item => isActive(item.path))?.label || 'Seller Portal'}
                        </h1>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SellerLayout;

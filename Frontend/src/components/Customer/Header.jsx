import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import ShoppingCart from './ShoppingCart';

const Header = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { customer, logout } = useCustomerAuth();
  const { user: adminUser } = useAuth();
  const { getCartCount, showCart, setShowCart } = useCart();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Check if user is logged in (either customer or admin)
  const isLoggedIn = !!customer || !!adminUser;
  const currentUser = customer || adminUser;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  const handleLogout = () => {
    if (customer) {
      logout();
    }
    // Admin logout is handled separately if needed
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/san-pham?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setShowSearch(false);
    }
  };

  return (
    <>
      <header className="bg-[#2d5016] text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#2d5016] text-lg font-bold">🌾</span>
              </div>
              <span className="text-xl font-bold">HƯƠNG GẠO QUÊ</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="hover:text-green-200 transition">GIỚI THIỆU</Link>
              <Link to="/khuyen-mai" className="hover:text-green-200 transition">KHUYẾN MÃI</Link>
              <Link to="/san-pham" className="hover:text-green-200 transition">
                SẢN PHẨM
              </Link>
              <Link to="/tin-tuc" className="hover:text-green-200 transition">TIN TỨC</Link>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {showSearch ? (
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 w-64"
                    autoFocus
                  />
                  <button type="submit" className="hover:text-green-200 transition">
                    <FiSearch className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchTerm('');
                    }}
                    className="hover:text-green-200 transition"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="hover:text-green-200 transition"
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setShowCart(true)}
                className="hover:text-green-200 transition relative"
              >
                <FiShoppingCart className="w-5 h-5" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount() > 9 ? '9+' : getCartCount()}
                  </span>
                )}
              </button>
              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="hover:text-green-200 transition"
                  >
                    <FiUser className="w-5 h-5" />
                  </button>
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                      <Link
                        to="/ho-so"
                        onClick={() => setShowUserDropdown(false)}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Hồ sơ cá nhân
                      </Link>
                      {!adminUser && (
                        <Link
                          to="/don-hang"
                          onClick={() => setShowUserDropdown(false)}
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        >
                          Đơn hàng
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="hover:text-green-200 transition"
                >
                  <FiUser className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
      <ShoppingCart isOpen={showCart} onClose={() => setShowCart(false)} />
    </>
  );
};

export default Header;


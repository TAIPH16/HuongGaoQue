import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useSellerAuth } from '../../context/SellerAuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const UniversalLogin = ({ onClose }) => {
    const navigate = useNavigate();
    const { login: adminLogin } = useAuth();
    const { updateProfile: updateCustomer } = useCustomerAuth();
    const { updateProfile: updateSeller } = useSellerAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Call UNIFIED login API
            const response = await axios.post(`${API_BASE_URL}/unified/auth/login`, {
                email: formData.email,
                password: formData.password
            });

            const { token, user } = response.data.data;

            // Lưu token và user data
            localStorage.setItem('unifiedToken', token);
            localStorage.setItem('unifiedUser', JSON.stringify(user));

            // Redirect dựa vào role
            switch (user.role) {
                case 'admin':
                    // Admin login
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    adminLogin(user, token);
                    navigate('/admin/dashboard');
                    break;

                case 'seller':
                    // Seller login
                    localStorage.setItem('sellerToken', token);
                    localStorage.setItem('seller', JSON.stringify(user));
                    updateSeller(user);
                    navigate('/seller/dashboard');
                    break;

                case 'user':
                default:
                    // Customer login
                    localStorage.setItem('customerToken', token);
                    localStorage.setItem('customer', JSON.stringify(user));
                    updateCustomer(user);
                    navigate('/');
                    break;
            }

            if (onClose) onClose();

        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full relative">
                {/* Close Button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                    >
                        <FiX size={24} />
                    </button>
                )}

                <div className="p-8">
                    {/* Logo */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xl font-bold">HGQ</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">HƯƠNG GẠO QUÊ</h1>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Đăng Nhập</h2>
                    <p className="text-gray-600 text-sm text-center mb-6">
                        Đăng nhập với tài khoản của bạn
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                required
                            />
                        </div>

                        {/* Mật khẩu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••••••"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="flex items-center justify-end">
                            <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#2d5016] text-white py-3 rounded-lg font-semibold hover:bg-[#1f350d] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">Hoặc đăng nhập bằng</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                            <FcGoogle size={20} />
                            <span className="text-gray-700 font-medium">Google</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                            <FaFacebook size={20} className="text-blue-600" />
                            <span className="text-gray-700 font-medium">Facebook</span>
                        </button>
                    </div>

                    {/* Register Links */}
                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            Chưa có tài khoản?
                            <Link to="/seller/register" className="text-green-600 font-semibold ml-1 hover:text-green-700">
                                Đăng ký Seller
                            </Link>
                        </p>
                        <p className="text-sm text-gray-600">
                            Hoặc
                            <Link to="/register" className="text-green-600 font-semibold ml-1 hover:text-green-700">
                                Đăng ký Customer
                            </Link>
                        </p>
                    </div>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-800 text-center">
                            💡 <strong>Tip:</strong> Dùng cùng 1 email/password cho mọi role.
                            Hệ thống tự động nhận diện bạn là Admin, Seller hay Customer!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniversalLogin;

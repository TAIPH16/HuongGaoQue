import { useState } from 'react';
<<<<<<< HEAD
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/auth/forgot-password', { email });
    setMessage('Link đặt lại mật khẩu đã được gửi!');
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Quên mật khẩu</h2>

      {message && <p className="text-green-600 mb-4">{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Nhập email"
          className="w-full border p-3 rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="w-full bg-green-700 text-white py-3 rounded">
          Gửi link
        </button>
      </form>
=======
import { Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await authAPI.forgotPassword(email);
      setMessage('Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Quên mật khẩu</h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
        </p>

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="your@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2d5016] text-white py-3 rounded-lg font-semibold hover:bg-[#1f350d] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="text-green-700 hover:underline">Quay lại đăng nhập</Link>
        </div>
      </div>
>>>>>>> bb854b4 (Upload files)
    </div>
  );
};

export default ForgotPassword;
<<<<<<< HEAD
=======

>>>>>>> bb854b4 (Upload files)

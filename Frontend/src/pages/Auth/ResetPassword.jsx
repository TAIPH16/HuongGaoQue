<<<<<<< HEAD
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!token || !email) {
    return (
      <div style={styles.container}>
        <p style={{ color: "red" }}>Link không hợp lệ hoặc đã hết hạn</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Mật khẩu nhập lại không khớp");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await axios.post("http://localhost:3000/api/auth/reset-password", {
        email,
        token,
        newPassword: password,
        confirmPassword,
      });

      alert("🎉 Đổi mật khẩu thành công!");
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Đổi mật khẩu thất bại");
=======
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await authAPI.resetPassword({ email, token, newPassword, confirmPassword });
      setMessage('Đặt lại mật khẩu thành công. Đang chuyển đến trang đăng nhập...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
>>>>>>> bb854b4 (Upload files)
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>🔐 Đặt lại mật khẩu</h2>

        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.input}
        />

        {message && <p style={styles.error}>{message}</p>}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },
  card: {
    width: "360px",
    padding: "24px",
    borderRadius: "8px",
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "15px",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px",
    textAlign: "center",
  },
};

export default ResetPassword;
=======
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Đặt lại mật khẩu</h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Nhập mật khẩu mới cho tài khoản: <span className="font-medium">{email}</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2d5016] text-white py-3 rounded-lg font-semibold hover:bg-[#1f350d] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="text-green-700 hover:underline">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

>>>>>>> bb854b4 (Upload files)

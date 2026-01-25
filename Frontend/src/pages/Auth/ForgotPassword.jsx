import { useState } from 'react';
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
    </div>
  );
};

export default ForgotPassword;

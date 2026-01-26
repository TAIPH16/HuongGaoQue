import { useEffect, useMemo, useRef, useState } from 'react';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { authAPI } from '../../utils/api';

const InputOTP = ({ length = 6, value, onChange, disabled }) => {
  const inputsRef = useRef([]);
  const values = useMemo(() => {
    const arr = new Array(length).fill('');
    (value || '').split('').forEach((ch, idx) => {
      if (idx < length) arr[idx] = ch;
    });
    return arr;
  }, [value, length]);

  const handleChange = (idx, ch) => {
    const next = (value || '').split('');
    next[idx] = ch.replace(/\D/g, '').slice(-1) || '';
    const joined = next.join('').slice(0, length);
    onChange(joined);
    if (ch && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !values[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2">
      {values.map((ch, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          className={`w-12 h-12 border rounded-lg text-center text-lg ${disabled ? 'bg-gray-100' : 'bg-white'} focus:ring-2 focus:ring-green-500`}
          value={ch}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
        />
      ))}
    </div>
  );
};

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setEmail('');
      setOtp('');
      setPassword('');
      setConfirm('');
      setError('');
      setSuccess('');
      setCooldown(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const sendOtp = async () => {
    if (!email) return;
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await authAPI.requestPasswordOtp(email);
      setSuccess('Mã OTP đã được gửi đến email của bạn.');
      setCooldown(30);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await authAPI.verifyPasswordOtp(email, otp);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Nhập sai OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await authAPI.resetPasswordWithOtp({ email, otp, newPassword: password, confirmPassword: confirm });
      setSuccess('Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.');
      if (onClose) setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <FiX className="w-6 h-6" />
        </button>
        <div className="flex">
          <div className="hidden md:block w-1/2 bg-gradient-to-br from-green-50 via-green-100 to-green-50 relative overflow-hidden">
            <div className="h-full flex items-center justify-center p-8 relative">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-300 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-yellow-200 rounded-full blur-3xl"></div>
              </div>
              <div className="text-center relative z-10">
                <div className="text-7xl mb-4 transform rotate-12">🌾</div>
                <div className="text-5xl mb-2 transform -rotate-6">🌾</div>
                <div className="text-4xl transform rotate-3">🌾</div>
                <div className="text-3xl mt-2 transform -rotate-12">🌾</div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 p-8">
            {step === 1 && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Quên Mật Khẩu</h2>
                <p className="text-gray-500 text-sm mb-4">Chúng tôi sẽ gửi mã OTP về email của bạn</p>
                {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-sm">{error}</div>}
                {success && <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 rounded text-sm">{success}</div>}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                  <button
                    disabled={loading}
                    onClick={sendOtp}
                    className="w-full bg-[#2d5016] text-white py-3 rounded-lg font-semibold hover:bg-[#1f350d] transition disabled:opacity-50"
                  >
                    {loading ? 'Đang gửi...' : 'Xác Nhận'}
                  </button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Quên Mật Khẩu</h2>
                <p className="text-gray-500 text-sm mb-4">Nhập mã OTP từ email của bạn.</p>
                {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-sm">{error}</div>}
                {success && <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 rounded text-sm">{success}</div>}
                <div className="space-y-4">
                  <InputOTP length={6} value={otp} onChange={setOtp} disabled={loading} />
                  <div className="text-right text-sm text-gray-500">
                    {cooldown > 0 ? (
                      <span>Gửi lại OTP - 00:{String(cooldown).padStart(2, '0')}</span>
                    ) : (
                      <button onClick={sendOtp} className="text-gray-700 hover:underline">Gửi lại OTP</button>
                    )}
                  </div>
                  <button
                    disabled={loading || otp.length !== 6}
                    onClick={verifyOtp}
                    className="w-full bg-[#2d5016] text-white py-3 rounded-lg font-semibold hover:bg-[#1f350d] transition disabled:opacity-50"
                  >
                    {loading ? 'Đang kiểm tra...' : 'Xác Nhận'}
                  </button>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Tạo Mật Khẩu Mới</h2>
                {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-sm">{error}</div>}
                {success && <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 rounded text-sm">{success}</div>}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none pr-10"
                        placeholder="Nhập mật khẩu"
                      />
                      <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {showPass ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none pr-10"
                        placeholder="Nhập lại mật khẩu"
                      />
                      <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {showConfirm ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {confirm && password !== confirm && (
                      <p className="text-xs text-red-500 mt-1">Mật khẩu không trùng khớp</p>
                    )}
                  </div>
                  <button
                    disabled={loading || !password || password !== confirm}
                    onClick={resetPassword}
                    className="w-full bg-[#2d5016] text-white py-3 rounded-lg font-semibold hover:bg-[#1f350d] transition disabled:opacity-50"
                  >
                    {loading ? 'Đang đặt lại...' : 'Xác Nhận'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;


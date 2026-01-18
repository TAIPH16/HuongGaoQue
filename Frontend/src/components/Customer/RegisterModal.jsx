import { useState, useEffect, useRef } from 'react';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle, loginWithFacebook } = useCustomerAuth();

  // Load Google OAuth script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);


  // Initialize Google OAuth when modal opens
  useEffect(() => {
    if (isOpen) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      if (!clientId) {
        // Don't show error to user, just silently skip Google OAuth
        return;
      }

      // Wait for Google SDK to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          
          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: async (response) => {
                try {
                  setLoading(true);
                  setError('');

                  // Send idToken directly to backend
                  await loginWithGoogle(response.credential);

                  onClose();
                } catch (err) {
                  setError(err.message || 'Đăng ký Google thất bại');
                } finally {
                  setLoading(false);
                }
              },
            });

            // Try to render Google Sign-In button
            const container = document.getElementById('google-signup-button-container');
            if (container && container.children.length === 0) {
              try {
                window.google.accounts.id.renderButton(container, {
                  theme: 'outline',
                  size: 'large',
                  width: '100%',
                  text: 'signup_with',
                  type: 'standard',
                });
              } catch (err) {
                console.error('Error rendering Google button:', err);
              }
            }
          } catch (err) {
            console.error('Error initializing Google OAuth:', err);
          }
        }
      }, 100);

      // Cleanup after 5 seconds
      const timeout = setTimeout(() => clearInterval(checkGoogle), 5000);
      
      return () => {
        clearInterval(checkGoogle);
        clearTimeout(timeout);
      };
    }
  }, [isOpen, loginWithGoogle, onClose]);

  const handleGoogleRegister = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!clientId) {
      setError('Google đăng ký chưa được cấu hình. Vui lòng sử dụng email/password.');
      return;
    }

    if (!window.google) {
      setError('Google OAuth đang tải. Vui lòng đợi vài giây rồi thử lại.');
      return;
    }

    try {
      // Try to show One Tap
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap doesn't work, try to trigger the button programmatically
          const container = document.getElementById('google-signup-button-container');
          if (container) {
            const googleButton = container.querySelector('div[role="button"]');
            if (googleButton) {
              googleButton.click();
            } else {
              setError('Vui lòng thử lại sau');
            }
          }
        }
      });
    } catch (err) {
      console.error('Google register error:', err);
      setError('Vui lòng thử lại sau');
    }
  };

  const handleFacebookRegister = async () => {
    try {
      setLoading(true);
      setError('');

      if (window.FB) {
        window.FB.login(
          async (response) => {
            if (response.authResponse) {
              const accessToken = response.authResponse.accessToken;
              window.FB.api('/me', { fields: 'id,name,email,picture' }, async (userInfo) => {
                try {
                  await loginWithFacebook(accessToken, userInfo.id);
                  onClose();
                } catch (err) {
                  setError(err.message || 'Đăng ký Facebook thất bại');
                } finally {
                  setLoading(false);
                }
              });
            } else {
              setError('Đăng ký Facebook bị hủy');
              setLoading(false);
            }
          },
          { scope: 'email,public_profile' }
        );
      } else {
        setError('Facebook SDK chưa sẵn sàng');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Đăng ký Facebook thất bại');
      setLoading(false);
    }
  };

  // Load Facebook SDK
  useEffect(() => {
    if (!window.FB && isOpen) {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        window.FB.init({
          appId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
          cookie: true,
          xfbml: true,
          version: 'v18.0',
        });
      };
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu không trùng khớp');
      return;
    }

    setLoading(true);

    try {
      const result = await register({ fullName, email, password });
      setError('');
      // Show success message and switch to login
      if (result && result.success) {
        setSuccess(result.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
        setTimeout(() => {
          onClose();
          onSwitchToLogin();
        }, 2000);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <FiX className="w-6 h-6" />
        </button>

        <div className="flex">
          {/* Left Side - Illustration */}
          <div className="hidden md:block w-1/2 bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
            <div className="absolute top-4 left-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🌾</span>
                <span className="text-[#2d5016] font-bold text-lg">HƯƠNG GẠO QUÊ</span>
              </div>
            </div>
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🌾</div>
                <div className="text-4xl mb-2">🌾</div>
                <div className="text-3xl">🌾</div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Đăng Kí</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Nhập email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none pr-12"
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nhập lại mật khẩu</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (e.target.value && password && e.target.value !== password) {
                        setError('Mật khẩu không trùng khớp');
                      } else if (error === 'Mật khẩu không trùng khớp') {
                        setError('');
                      }
                    }}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none pr-12 ${
                      password && confirmPassword && password !== confirmPassword
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Nhập lại mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">Mật khẩu không trùng khớp</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2d5016] text-white py-3 rounded-lg font-semibold hover:bg-[#1f350d] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang đăng ký...' : 'Đăng Kí'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc đăng kí bằng</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div id="google-signup-button-container" className="flex items-center justify-center min-h-[48px]">
                  <button
                    type="button"
                    onClick={handleGoogleRegister}
                    disabled={loading}
                    className="flex items-center justify-center space-x-2 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition disabled:opacity-50 w-full"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Google</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleFacebookRegister}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Bạn đã có tài khoản? </span>
              <button
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:underline font-medium"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;


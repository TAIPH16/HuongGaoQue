import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    const savedCustomer = localStorage.getItem('customer');
    
    if (token && savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch (error) {
        console.error('Error parsing customer data:', error);
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Use regular auth endpoint - backend handles both admin and customer
      const response = await axios.post(`${API_BASE_URL.replace('/api', '')}/api/auth/login`, {
        email,
        password,
      });
      
      const { token, user } = response.data;
      
      // Check if user is admin - if so, don't set as customer
      if (user.role === 'admin' || user.role === 'staff') {
        throw new Error('Vui lòng đăng nhập qua trang quản trị');
      }
      
      // For customer or no role, save as customer
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer', JSON.stringify(user));
      setCustomer(user);
      
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
      throw new Error(errorMessage);
    }
  };

  const register = async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL.replace('/api', '')}/api/auth/register`, {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: 'user',
      });
      
      // Don't auto-login after registration - user must login manually
      // Just return success without setting customer state
      return { success: true, message: 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const response = await axios.post(`${API_BASE_URL.replace('/api', '')}/api/auth/google-login`, {
        idToken,
      });
      const { token, user } = response.data;
      
      // Only save if user is customer/user, not admin
      if (user.role === 'admin' || user.role === 'staff') {
        throw new Error('Vui lòng đăng nhập qua trang quản trị');
      }
      
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer', JSON.stringify(user));
      setCustomer(user);
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng nhập Google thất bại';
      throw new Error(errorMessage);
    }
  };

  const loginWithFacebook = async (accessToken, userId) => {
    try {
      const response = await axios.post(`${API_BASE_URL.replace('/api', '')}/api/auth/facebook-login`, {
        accessToken,
        userId,
      });
      const { token, user } = response.data;
      
      // Only save if user is customer/user, not admin
      if (user.role === 'admin' || user.role === 'staff') {
        throw new Error('Vui lòng đăng nhập qua trang quản trị');
      }
      
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer', JSON.stringify(user));
      setCustomer(user);
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng nhập Facebook thất bại';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('customer_token');
      if (token) {
        await axios.post(
          `${API_BASE_URL.replace('/api', '')}/api/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer');
      setCustomer(null);
      return { success: true, message: 'Đăng xuất thành công' };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer');
      setCustomer(null);
      return { success: true, message: 'Đăng xuất thành công' };
    }
  };

  const updateCustomer = (customerData) => {
    setCustomer(customerData);
    if (customerData) {
      localStorage.setItem('customer', JSON.stringify(customerData));
    } else {
      localStorage.removeItem('customer');
    }
  };

  const value = {
    customer,
    setCustomer: updateCustomer,
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    loading,
    isAuthenticated: !!customer,
  };

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
};


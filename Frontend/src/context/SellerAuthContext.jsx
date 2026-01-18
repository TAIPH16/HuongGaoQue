import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SellerAuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const SellerAuthProvider = ({ children }) => {
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('sellerToken');
        const storedSeller = localStorage.getItem('seller');

        if (token && storedSeller) {
            setSeller(JSON.parse(storedSeller));
        }
        setLoading(false);
    };

    const register = async (sellerData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/seller/auth/register`, sellerData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Đăng ký thất bại' };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/seller/auth/login`, {
                email,
                password
            });

            const { token, seller: sellerData } = response.data.data;

            localStorage.setItem('sellerToken', token);
            localStorage.setItem('seller', JSON.stringify(sellerData));
            setSeller(sellerData);

            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Đăng nhập thất bại' };
        }
    };

    const logout = () => {
        localStorage.removeItem('sellerToken');
        localStorage.removeItem('seller');
        setSeller(null);
    };

    const updateProfile = (updatedSeller) => {
        setSeller(updatedSeller);
        localStorage.setItem('seller', JSON.stringify(updatedSeller));
    };

    return (
        <SellerAuthContext.Provider value={{
            seller,
            loading,
            register,
            login,
            logout,
            updateProfile
        }}>
            {children}
        </SellerAuthContext.Provider>
    );
};

export const useSellerAuth = () => {
    const context = useContext(SellerAuthContext);
    if (!context) {
        throw new Error('useSellerAuth must be used within SellerAuthProvider');
    }
    return context;
};

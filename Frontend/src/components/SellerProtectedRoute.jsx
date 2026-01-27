import { Navigate } from 'react-router-dom';
import { useSellerAuth } from '../context/SellerAuthContext';

const SellerProtectedRoute = ({ children }) => {
    const { seller, loading } = useSellerAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!seller) {
        return <Navigate to="/seller/login" replace />;
    }

    return children;
};

export default SellerProtectedRoute;

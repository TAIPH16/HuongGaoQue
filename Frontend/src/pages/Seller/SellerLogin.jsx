import { useState } from 'react';
import SellerLoginModal from './SellerLoginModal';
import SellerRegister from './SellerRegister';

const SellerAuthPage = () => {
    const [showRegister, setShowRegister] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Rice illustrations */}
                <div className="absolute top-20 left-10 opacity-20">
                    <div className="w-32 h-32 bg-gradient-to-br from-yellow-200 to-green-200 rounded-full blur-3xl"></div>
                </div>
                <div className="absolute bottom-20 right-10 opacity-20">
                    <div className="w-40 h-40 bg-gradient-to-br from-green-200 to-yellow-200 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative z-10">
                <div className="max-w-md">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-4">
                            <span className="text-white text-2xl font-bold">HGQ</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">
                            HƯƠNG GẠO QUÊ
                        </h1>
                        <p className="text-xl text-green-600 font-semibold mb-6">
                            Cổng Người Bán
                        </p>
                    </div>

                    {/* Rice Illustrations */}
                    <div className="flex space-x-6 mb-8">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-24 bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-full relative">
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-16 bg-green-600 rounded-full"></div>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-yellow-300 rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-24 bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-full relative">
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-16 bg-green-600 rounded-full"></div>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-yellow-300 rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-24 bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-full relative">
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-16 bg-green-600 rounded-full"></div>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-yellow-300 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 text-gray-600">
                        <p className="flex items-center">
                            <span className="text-green-600 mr-2">✓</span>
                            Quản lý sản phẩm dễ dàng
                        </p>
                        <p className="flex items-center">
                            <span className="text-green-600 mr-2">✓</span>
                            Theo dõi đơn hàng real-time
                        </p>
                        <p className="flex items-center">
                            <span className="text-green-600 mr-2">✓</span>
                            Dashboard thống kê chi tiết
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Forms */}
            <div className="flex-1 flex items-center justify-center p-4">
                {showRegister ? (
                    <SellerRegister onSwitchToLogin={() => setShowRegister(false)} />
                ) : (
                    <SellerLoginModal onSwitchToRegister={() => setShowRegister(true)} />
                )}
            </div>
        </div>
    );
};

export default SellerAuthPage;

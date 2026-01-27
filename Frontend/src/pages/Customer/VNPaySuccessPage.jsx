import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { vnpayAPI } from '../../utils/customerApi';
import { useCart } from '../../context/CartContext';

const VNPaySuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const orderId = searchParams.get('orderId');
  const transactionNo = searchParams.get('transactionNo');
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState(null);

  useEffect(() => {
    if (orderId) {
      checkOrderStatus();
      // Clear cart sau khi thanh toán thành công
      clearCart();
      // Clear checkout data
      localStorage.removeItem('checkout_address');
      localStorage.removeItem('checkout_notes');
      localStorage.removeItem('vnpay_orderId');
    }
  }, [orderId]);

  const checkOrderStatus = async () => {
    try {
      const response = await vnpayAPI.checkStatus(orderId);
      setOrderStatus(response.data.data);
    } catch (error) {
      console.error('Error checking order status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Thanh toán thành công!</h1>
            <p className="text-gray-600 mb-2">
              Cảm ơn bạn đã mua sắm! Đơn hàng của bạn đang được xử lý.
            </p>
            {transactionNo && (
              <p className="text-sm text-gray-500">
                Mã giao dịch: {transactionNo}
              </p>
            )}
            {orderStatus && (
              <p className="text-sm text-gray-500 mt-2">
                Mã đơn hàng: {orderStatus.orderNumber}
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Trạng thái đơn hàng</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Trạng thái:</span>
                <span className="font-semibold text-green-600">
                  {orderStatus?.status === 'processing' ? 'Đang xử lý' : orderStatus?.status || 'Đang xử lý'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Thanh toán:</span>
                <span className="font-semibold text-green-600">
                  {orderStatus?.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Link
              to="/don-hang"
              className="flex-1 border-2 border-[#2d5016] text-[#2d5016] py-3 rounded-lg hover:bg-green-50 transition font-semibold"
            >
              Xem Đơn Hàng
            </Link>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-[#2d5016] text-white py-3 rounded-lg hover:bg-[#1f350d] transition font-semibold"
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default VNPaySuccessPage;


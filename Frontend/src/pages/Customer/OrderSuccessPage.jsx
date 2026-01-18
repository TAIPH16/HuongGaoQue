import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { customerOrdersAPI } from '../../utils/customerApi';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await customerOrdersAPI.getById(orderId);
      setOrder(response.data?.data || response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-4 py-12 text-center">Đang tải...</div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#2d5016] text-white rounded-full flex items-center justify-center">
                🏠
              </div>
              <span className="ml-2 font-semibold text-sm">Địa chỉ</span>
            </div>
            <div className="w-16 h-1 bg-[#2d5016]"></div>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#2d5016] text-white rounded-full flex items-center justify-center">
                💳
              </div>
              <span className="ml-2 font-semibold text-sm">Thanh toán</span>
            </div>
            <div className="w-16 h-1 bg-[#2d5016]"></div>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#2d5016] text-white rounded-full flex items-center justify-center">
                ✓
              </div>
              <span className="ml-2 font-semibold text-sm">Hoàn thành</span>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Đơn hàng đã đặt thành công</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Cảm ơn bạn đã mua sắm! Đơn đặt hàng của bạn đang được vận chuyển.
          </p>
          {order && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Mã đơn hàng</p>
              <p className="text-lg font-bold text-[#2d5016]">{order.orderNumber || order._id}</p>
            </div>
          )}
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
              Xong
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default OrderSuccessPage;


import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/Customer/CustomerLayout';

const VNPayFailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const message = searchParams.get('message') || 'Thanh toán thất bại';

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Thanh toán thất bại</h1>
            <p className="text-gray-600 mb-2">
              {decodeURIComponent(message)}
            </p>
            {orderId && (
              <p className="text-sm text-gray-500">
                Mã đơn hàng: {orderId}
              </p>
            )}
          </div>

          <div className="flex space-x-4">
            <Link
              to="/don-hang"
              className="flex-1 border-2 border-[#2d5016] text-[#2d5016] py-3 rounded-lg hover:bg-green-50 transition font-semibold"
            >
              Xem Đơn Hàng
            </Link>
            <button
              onClick={() => navigate('/gio-hang')}
              className="flex-1 bg-[#2d5016] text-white py-3 rounded-lg hover:bg-[#1f350d] transition font-semibold"
            >
              Quay Lại Giỏ Hàng
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default VNPayFailPage;


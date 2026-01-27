import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomerLayout from '../../components/Customer/CustomerLayout';

const VNPayProcessingPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Trang này sẽ được redirect từ VNPay sau khi thanh toán
    // Nếu có orderId trong URL, có thể kiểm tra trạng thái
  }, [orderId]);

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-[#2d5016] mb-4"></div>
            <h1 className="text-3xl font-bold mb-4">Đang xử lý thanh toán...</h1>
            <p className="text-gray-600">
              Vui lòng đợi trong giây lát. Chúng tôi đang xử lý giao dịch của bạn.
            </p>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default VNPayProcessingPage;


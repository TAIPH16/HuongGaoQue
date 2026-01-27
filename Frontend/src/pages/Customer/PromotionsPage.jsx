import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/Customer/CustomerLayout';

const PromotionsPage = () => {
  const combos = [
    {
      id: 1,
      name: 'Combo "Tiết Kiệm Gia Đình"',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
      offer: 'Mua 10kg gạo Đồng bằng Sông Cửu Long, tặng ngay 1kg gạo cùng loại. Kèm theo 1 chai dầu ăn cao cấp 500ml.',
      benefits: 'Dành cho gia đình không quá nhiều người, tiết kiệm và tiện dụng.',
    },
    {
      id: 2,
      name: 'Combo "Thực Đơn Sức Khỏe"',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
      offer: 'Mua 5kg gạo lứt Đồng bằng Sông Cửu Long, tặng 1kg gạo nếp. Tặng kèm túi lọc nước gạo thiên nhiên.',
      benefits: 'Hỗ trợ cho chế độ ăn lành mạnh, giàu dinh dưỡng, đa dạng thực đơn.',
    },
    {
      id: 3,
      name: 'Combo "Tân Sinh Viên"',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
      offer: 'Mua 2kg gạo, tặng 1 bịch gia vị nấu cơm ngon và 1 chén sứ. Tặng kèm hộp thủy tinh đựng cơm tiện lợi.',
      benefits: 'Dành cho sinh viên, người mới ra ở riêng, người sống riêng tư',
    },
  ];

  return (
    <CustomerLayout>
      {/* Hero Banner */}
      <div className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1920)',
        }}>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-green-300">Combo Tiết Kiệm</h1>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tận Hưởng Đầy Đủ Hương Vị Gạo</h2>
            <p className="text-lg">
              Cơ hội vàng để bạn và gia đình thêm phần phong phú bữa ăn, thêm phần khỏe mạnh cuộc sống.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Combo Khuyến Mãi Gạo</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {combos.map((combo) => (
            <div key={combo.id} className="bg-green-50 rounded-lg overflow-hidden shadow-lg">
              <img
                src={combo.image}
                alt={combo.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">{combo.name}</h3>
                <p className="text-gray-700 mb-4">{combo.offer}</p>
                <div className="mb-4">
                  <p className="font-semibold mb-2">Lợi ích:</p>
                  <p className="text-gray-600">{combo.benefits}</p>
                </div>
                <Link
                  to={`/san-pham/combo-${combo.id}`}
                  className="block w-full bg-[#2d5016] text-white text-center py-3 rounded-lg hover:bg-[#1f350d] transition"
                >
                  Mua Ngay
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default PromotionsPage;


import { useEffect, useState } from 'react';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import comboImg from '../../asset/images/combo.jpg';

const PromotionsPage = () => {
  const navigate = useNavigate();
  const { addCart } = useCart();
  const [combos, setCombos] = useState([]);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await axios.get("/api/promotions");
        setCombos(res?.data?.data || []); // bảo vệ undefined
      } catch (err) {
        console.error(err);
        setCombos([]);
      }
    };
    fetchPromotions();
  }, []);

  const handleBuyCombo = (combo) => {
    if (!combo?.product) {
      alert("Promotion chưa có product");
      return;
    }
    addCart({
      product: {
        id: combo.product._id,
        name: combo.product.name,
        image: combo.product?.image || '/placeholder.png', // fallback
        listedPrice: combo.listedPrice || combo.product?.Price || 0,
      },
      quantity: 1,
      promotion_id: combo._id,
    });
    navigate('/thanh-toan');
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(price || 0) + '₫';

  // fallback ảnh
  const getImageUrl = (img) => {
    if (!img) return '/placeholder.png';
    try {
      if (img.startsWith('http')) return img;
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${img}`;
    } catch {
      return '/placeholder.png';
    }
  };

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#2d5016]">
          Combo Khuyến Mãi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {combos.length === 0 && (
            <p className="text-center col-span-3 text-gray-500">
              Không có combo khuyến mãi
            </p>
          )}

          {combos.map((combo) => (
            <div
              key={combo._id}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition p-4 flex flex-col"
            >
              <div className="relative">
                <img
                  src={combo.image || comboImg}
                  alt={combo.name || 'Combo khuyến mãi'}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {combo.listedPrice && (
                  <span className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full font-semibold shadow">
                    {formatPrice(combo.listedPrice)}
                  </span>
                )}
              </div>

              <div className="mt-4 flex-1 flex flex-col justify-between">
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {combo?.name || 'Chưa có tên'}
                </h3>

                <p className="text-gray-600 mb-4">
                  Sản phẩm: {combo.product?.name || 'Chưa có'}
                </p>

                <button
                  onClick={() => handleBuyCombo(combo)}
                  className="mt-auto bg-[#2d5016] text-white py-3 rounded-lg hover:bg-[#1f350d] transition font-semibold"
                >
                  Mua Ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default PromotionsPage;
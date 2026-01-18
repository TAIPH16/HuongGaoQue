import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Contact */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xl font-bold">🌾</span>
              </div>
              <span className="text-xl font-bold text-white">HƯƠNG GẠO QUÊ</span>
            </div>
            <p className="text-sm mb-2">
              Địa chỉ: Khoa Công nghệ phần mềm, Trường Công nghệ Thông tin & Truyền thông, Trường Đại học Cần Thơ
            </p>
            <p className="text-sm mb-2">Điện thoại: (+84) 123 456 789</p>
            <p className="text-sm mb-4">Email: hello-hoang.vercel.app</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition"><FiFacebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition"><FiInstagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition"><FiYoutube className="w-5 h-5" /></a>
            </div>
          </div>

          {/* THÔNG TIN */}
          <div>
            <h3 className="text-white font-bold mb-4">THÔNG TIN</h3>
            <ul className="space-y-2">
              <li><Link to="/tam-nhin" className="hover:text-white transition">Tầm nhìn</Link></li>
              <li><Link to="/su-menh" className="hover:text-white transition">Sứ mệnh</Link></li>
            </ul>
          </div>

          {/* DỊCH VỤ */}
          <div>
            <h3 className="text-white font-bold mb-4">DỊCH VỤ</h3>
            <ul className="space-y-2">
              <li><Link to="/ve-chung-toi" className="hover:text-white transition">Về chúng tôi</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          {/* SITE MAP */}
          <div>
            <h3 className="text-white font-bold mb-4">SITE MAP</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white transition">Giới thiệu</Link></li>
              <li><Link to="/san-pham" className="hover:text-white transition">Sản phẩm</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">Copyright 2023 © Huonggaoque. All right reserved</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms" className="text-sm hover:text-white transition">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


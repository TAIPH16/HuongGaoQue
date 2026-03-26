import { useState } from "react";
import CustomerLayout from "../../components/Customer/CustomerLayout";
import { FiMapPin, FiPhone, FiMail, FiGlobe } from "react-icons/fi";
import contactAPI from "./contactAPI";
import Swal from "sweetalert2";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.submit({
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        message: formData.message,
      });

      setFormData({ fullName: "", phone: "", email: "", message: "" });

      Swal.fire({
        icon: "success",
        title: "Gửi liên hệ thành công",
        text: "Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gửi thất bại",
        text: "Có lỗi xảy ra. Vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout>
      {/* HERO */}
      <div className="relative h-64">
        <img
          src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1920"
          alt="Contact"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white text-center">
            Liên Hệ Với Chúng Tôi
          </h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* ================= INFO ================= */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Hương Gạo Quê</h2>
            <InfoItem icon={<FiMapPin />} title="Địa chỉ" value="FPT, Ninh Kiều, Cần Thơ" />
            <InfoItem icon={<FiPhone />} title="Điện thoại" value="0369304545" />
            <InfoItem icon={<FiMail />} title="Email" value="g1@gmail.com" />
            <InfoItem icon={<FiGlobe />} title="Website" value="https://huonggaoque.vn" />
          </div>

          {/* ================= FORM ================= */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Gửi liên hệ</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Họ tên" name="fullName" value={formData.fullName} onChange={handleChange} />
              <Input label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} />
              <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
              <div>
                <label className="block mb-2 font-medium">Lời nhắn</label>
                <textarea
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2d5016]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2d5016] text-white py-3 rounded-lg font-semibold hover:bg-[#1f350d] transition disabled:opacity-50"
              >
                {loading ? "Đang gửi..." : "Gửi liên hệ"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ContactPage;

// ================= COMPONENTS =================
const Input = ({ label, ...props }) => (
  <div>
    <label className="block mb-2 font-medium">{label}</label>
    <input
      required
      {...props}
      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2d5016]"
    />
  </div>
);

const InfoItem = ({ icon, title, value }) => (
  <div className="flex gap-4 items-center">
    <div className="w-12 h-12 bg-[#2d5016] text-white flex items-center justify-center rounded-lg text-xl">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-gray-600">{value}</p>
    </div>
  </div>
);
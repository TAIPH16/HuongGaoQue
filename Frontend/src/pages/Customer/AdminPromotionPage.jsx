import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // import sweetalert2

const AdminPromotionsPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);

  const [form, setForm] = useState({
    name: "",
    product: "",
    image: null,
    listedPrice: 0,
  });

  // ================= GET PRODUCTS =================
  const fetchProducts = async () => {
    const res = await axios.get("/api/product");
    setProducts(res.data.data);
  };

  // ================= GET PROMOS =================
  const fetchPromos = async () => {
    const res = await axios.get("/api/promotions");
    setPromos(res.data.data);
  };

  useEffect(() => {
    fetchProducts();
    fetchPromos();
  }, []);

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(form).forEach((k) => data.append(k, form[k]));
      await axios.post("/api/promotions", data);

      // popup thông báo thành công
      Swal.fire({
        icon: 'success',
        title: 'Thêm khuyến mãi thành công',
        showConfirmButton: false,
        timer: 1500
      });

      fetchPromos();
      setForm({ name: "", product: "", image: null, listedPrice: 0 }); // reset form
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Thêm thất bại',
        text: err.response?.data?.message || 'Có lỗi xảy ra',
      });
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Bạn có chắc muốn xóa?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete("/api/promotions/" + id);

      Swal.fire({
        icon: 'success',
        title: 'Đã xóa',
        showConfirmButton: false,
        timer: 1200
      });

      fetchPromos();
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Xóa lỗi',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-[#2d5016] mb-6">Quản lý khuyến mãi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-6"
        >
          <h2 className="text-2xl font-semibold text-[#2d5016] mb-4">Thêm khuyến mãi</h2>

          {/* NAME */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Tên</label>
            <input
              className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              value={form.name}
            />
          </div>

          {/* PRODUCT */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Product</label>
            <select
              className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
              onChange={(e) => setForm({ ...form, product: e.target.value })}
              value={form.product}
            >
              <option value="">Chọn sản phẩm</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* IMAGE */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Ảnh</label>
            <input
              type="text"
              className="border border-gray-300 px-3 py-2 rounded-lg"
              placeholder="Nhập tên file, ví dụ combo1.jpg"
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              value={form.image || ''}
            />
          </div>

          {/* PRICE */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Giá</label>
            <input
              type="number"
              className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
              onChange={(e) => setForm({ ...form, listedPrice: e.target.value })}
              value={form.listedPrice}
            />
          </div>

          <button className="bg-[#2d5016] text-white px-6 py-3 rounded-lg hover:bg-[#1f350d] transition-all font-semibold w-full">
            Thêm
          </button>
        </form>

        {/* LIST */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-[#2d5016] mb-4">Danh sách khuyến mãi</h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {promos.map((p) => (
              <div
                key={p._id}
                className="flex justify-between items-center border-b border-gray-200 py-3 px-2 rounded-lg hover:bg-green-50 transition"
              >
                <div>
                  <div className="font-semibold text-gray-800">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.product?.name}</div>
                </div>

                <button
                  onClick={() => handleDelete(p._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPromotionsPage;
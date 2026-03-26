import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // THÊM DÒNG NÀY ĐỂ LẤY ID TỪ URL
import axios from "axios";

const ProductVariations = () => {
  // Lấy ID của sản phẩm gốc từ URL (khi bạn bấm 3 chấm)
  const { id: originalProductId } = useParams();
  console.log(originalProductId);

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    productId: "", // Mã SKU mới (để trống cho người dùng tự nhập)
    name: "", // Sẽ tự điền tên SP gốc
    categoryId: "", // Sẽ tự chọn danh mục của SP gốc
    listedPrice: "",
    stock: "",
    description: "",
    image: null,
    preview: "",
  });

  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Hàm gọi đồng thời API danh mục và API sản phẩm gốc
    const fetchInitialData = async () => {
      try {
        // 1. Lấy danh sách danh mục đổ vào dropdown
        const catRes = await axios.get("http://localhost:3001/api/categories");
        const categoryData = catRes.data.data || catRes.data;
        setCategories(categoryData);
        console.log(categoryData);

        // 2. Lấy thông tin sản phẩm gốc để TỰ ĐIỀN VÀO FORM
        if (originalProductId) {
          const prodRes = await axios.get(
            `http://localhost:3001/api/products/${originalProductId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            },
          );
          const originalProduct = prodRes.data.data || prodRes.data;

          // Xử lý logic tự động điền (Pre-fill)
          setForm((prevForm) => ({
            ...prevForm,
            // Tự điền tên sản phẩm gốc + thêm 1 khoảng trắng (hoặc gạch nối cho đẹp)
            name: `${originalProduct.name} - `,

            // Tự động chọn đúng danh mục (lấy _id của danh mục từ SP gốc)
            categoryId:
              originalProduct.category._id || originalProduct.category,
          }));
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu ban đầu:", error);
      }
    };

    fetchInitialData();
  }, [originalProductId]); // Chạy lại nếu URL ID thay đổi

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({
        ...form,
        image: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.listedPrice ||
      !form.productId ||
      !form.categoryId
    ) {
      alert("Vui lòng điền đủ Mã SP, Tên SP, Danh mục và Giá!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("productId", form.productId);
      formData.append("name", form.name);
      formData.append("category", form.categoryId);
      formData.append("listedPrice", Number(form.listedPrice));
      formData.append("initialQuantity", Number(form.stock) || 0);
      formData.append("remainingQuantity", Number(form.stock) || 0);
      formData.append("description", form.description);

      if (form.image) {
        formData.append("images", form.image);
      }

      await axios.post("http://localhost:3001/api/products", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Tạo sản phẩm (biến thể) thành công!");

      // Tùy chọn: Reset lại form nhưng vẫn GIỮ LẠI tên gốc và danh mục để nhập tiếp biến thể khác (VD nhập xong 5kg thì nhập tiếp 10kg)
      setForm((prev) => ({
        productId: "",
        name: prev.name.split("-")[0] + "- ", // Giữ lại phần tên gốc trước dấu "-"
        categoryId: prev.categoryId,
        listedPrice: "",
        stock: "",
        description: "",
        image: null,
        preview: "",
      }));
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Lỗi khi tạo sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-6 text-green-700">
        Thêm Biến Thể Mới
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Mã sản phẩm: Người dùng TỰ NHẬP mã mới */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mã SKU (Bắt buộc khác nhau)
          </label>
          <input
            name="productId"
            placeholder="VD: ST25-5KG"
            value={form.productId}
            onChange={handleChange}
            className="border p-3 rounded focus:outline-green-500 w-full"
          />
        </div>

        {/* Danh mục: ĐÃ ĐƯỢC CHỌN SẴN */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục
          </label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="border p-3 rounded focus:outline-green-500 bg-gray-100 w-full"
          >
            <option value="" disabled>
              -- Chọn danh mục sản phẩm --
            </option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tên Sản Phẩm: ĐÃ CÓ SẴN TÊN GỐC, NGƯỜI DÙNG CHỈ GÕ THÊM */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên biến thể (Chỉ cần gõ thêm Kg)
          </label>
          <input
            name="name"
            placeholder="Tên (VD: Gạo ST25 - 5kg)"
            value={form.name}
            onChange={handleChange}
            className="border p-3 rounded focus:outline-green-500 w-full font-semibold text-blue-800 bg-blue-50"
          />
        </div>

        <input
          name="listedPrice"
          type="number"
          placeholder="Giá bán (VNĐ)"
          value={form.listedPrice}
          onChange={handleChange}
          className="border p-3 rounded focus:outline-green-500"
        />

        <input
          name="stock"
          type="number"
          placeholder="Số lượng kho"
          value={form.stock}
          onChange={handleChange}
          className="border p-3 rounded focus:outline-green-500"
        />

        <textarea
          name="description"
          placeholder="Mô tả sản phẩm..."
          rows="3"
          value={form.description}
          onChange={handleChange}
          className="border p-3 rounded col-span-2 focus:outline-green-500"
        />

        <div className="col-span-2 border border-dashed border-gray-400 p-4 rounded text-center">
          <input
            type="file"
            onChange={handleImage}
            className="mb-2 w-full"
            accept="image/*"
          />
          {form.preview && (
            <img
              src={form.preview}
              alt="preview"
              className="w-40 h-40 object-cover mx-auto rounded shadow"
            />
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full py-3 rounded text-white font-bold text-lg transition-colors ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Đang lưu..." : "Lưu Sản Phẩm"}
      </button>
    </div>
  );
};

export default ProductVariations;

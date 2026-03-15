import { useState } from "react";
import { FiX } from "react-icons/fi";

const AdminViewVariations = ({ isOpen, onClose, product }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!isOpen || !product) return null;

  const API_BASE = "http://localhost:3000";

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫";

  const listedPrice = product.listedPrice || 0;
  const discountPercent = product.discountPercent || 0;

  const finalPrice = listedPrice - (listedPrice * discountPercent) / 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[1000px] max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-6 relative">
        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          <FiX size={24} />
        </button>

        {/* product name */}
        <h2 className="text-2xl font-bold mb-6">{product.name}</h2>

        <div className="grid grid-cols-2 gap-8">
          {/* ================= IMAGES ================= */}

          <div>
            {/* main image */}
            <img
              src={`${API_BASE}${product.images?.[selectedImage]}`}
              alt="product"
              className="w-full h-[350px] object-cover rounded-lg border"
            />

            {/* thumbnails */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {product.images?.map((img, index) => (
                <img
                  key={index}
                  src={`${API_BASE}${img}`}
                  alt="thumb"
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 object-cover rounded cursor-pointer border
                    ${
                      selectedImage === index
                        ? "border-green-600"
                        : "border-gray-200"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* ================= PRODUCT INFO ================= */}

          <div className="space-y-4">
            {/* price */}
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-green-700">
                  {formatPrice(finalPrice)}
                </span>

                {discountPercent > 0 && (
                  <>
                    <span className="line-through text-gray-400">
                      {formatPrice(listedPrice)}
                    </span>

                    <span className="bg-red-100 text-red-600 px-2 py-1 text-sm rounded">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* product info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p>
                <b>Danh mục:</b> {product.category?.name}
              </p>

              <p>
                <b>Đơn vị:</b> {product.unit}
              </p>

              <p>
                <b>Tồn kho:</b> {product.initialQuantity}
              </p>

              <p>
                <b>Trạng thái:</b>
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded
                  ${
                    product.status === "active"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {product.status}
                </span>
              </p>
            </div>

            {/* description */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Mô tả</h3>

              <div
                className="text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: product.description,
                }}
              />
            </div>
          </div>
        </div>

        {/* ================= DETAILS ================= */}

        {product.details?.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold text-lg mb-4">Chi tiết sản phẩm</h3>

            <div className="grid grid-cols-3 gap-4">
              {product.details.map((detail, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <p className="font-medium text-gray-700">
                    {detail.indexName}
                  </p>

                  <p className="text-gray-600">{detail.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminViewVariations;

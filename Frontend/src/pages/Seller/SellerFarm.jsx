import { useEffect, useState } from 'react';
import axios from 'axios';
import SellerLayout from '../../components/Seller/SellerLayout';
import { useSellerAuth } from '../../context/SellerAuthContext';
import { FiCheck, FiX } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const SellerFarm = () => {
  const { seller, updateProfile } = useSellerAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    farmName: seller?.farmName || '',
    farmAddress: seller?.farmAddress || '',
    farmArea: seller?.farmArea || '',
    farmType: seller?.farmType || '',
    farmOwnerName: seller?.farmOwnerName || '',
    farmContactPhone: seller?.farmContactPhone || seller?.phoneNumber || '',
    farmDescription: seller?.farmDescription || '',
    address: (() => {
      let addr = seller?.address || {};
      if (addr && typeof addr === 'string') {
        try { addr = JSON.parse(addr); } catch { addr = { street: addr }; }
      }
      return {
        street: addr?.street || '',
        ward: addr?.ward || '',
        district: addr?.district || '',
        city: addr?.city || '',
        country: addr?.country || 'Việt Nam',
      };
    })(),
  });

  useEffect(() => {
    if (seller) {
      let addr = seller.address || {};
      if (addr && typeof addr === 'string') {
        try { addr = JSON.parse(addr); } catch { addr = { street: addr }; }
      }
      setFormData({
        farmName: seller.farmName || '',
        farmAddress: seller.farmAddress || addr?.street || '',
        farmArea: seller.farmArea || '',
        farmType: seller.farmType || '',
        farmOwnerName: seller.farmOwnerName || '',
        farmContactPhone: seller.farmContactPhone || seller.phoneNumber || '',
        farmDescription: seller.farmDescription || '',
        address: {
          street: addr?.street || '',
          ward: addr?.ward || '',
          district: addr?.district || '',
          city: addr?.city || '',
          country: addr?.country || 'Việt Nam',
        },
      });
    }
  }, [seller]);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const token = localStorage.getItem('sellerToken');
      const payload = new FormData();
      payload.append('farmName', formData.farmName);
      payload.append('farmAddress', formData.farmAddress);
      payload.append('farmArea', formData.farmArea);
      payload.append('farmType', formData.farmType);
      payload.append('farmOwnerName', formData.farmOwnerName);
      payload.append('farmContactPhone', formData.farmContactPhone);
      payload.append('farmDescription', formData.farmDescription);
      payload.append('address', JSON.stringify(formData.address));
      const res = await axios.put(`${API_BASE_URL}/seller/auth/profile`, payload, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      updateProfile(res.data.data);
      setSuccess('Đã lưu thông tin nông trại');
      setEditing(false);
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại');
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // reset from current seller
    let addr = seller?.address || {};
    if (addr && typeof addr === 'string') {
      try { addr = JSON.parse(addr); } catch { addr = { street: addr }; }
    }
    setFormData({
      farmName: seller?.farmName || '',
      farmAddress: seller?.farmAddress || addr?.street || '',
      farmArea: seller?.farmArea || '',
      farmType: seller?.farmType || '',
      farmOwnerName: seller?.farmOwnerName || '',
      farmContactPhone: seller?.farmContactPhone || seller?.phoneNumber || '',
      farmDescription: seller?.farmDescription || '',
      address: {
        street: addr?.street || '',
        ward: addr?.ward || '',
        district: addr?.district || '',
        city: addr?.city || '',
        country: addr?.country || 'Việt Nam',
      },
    });
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Quản lý nông trại</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg">Chỉnh sửa</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2">
                  <FiCheck /> {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button onClick={handleCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg flex items-center gap-2">
                  <FiX /> Hủy
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên trang trại</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.farmName}
                  onChange={(e) => handleChange('farmName', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập tên trang trại"
                />
              ) : (
                <p className="font-semibold text-gray-800">{formData.farmName || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diện tích</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.farmArea}
                  onChange={(e) => handleChange('farmArea', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ví dụ: 2 ha, 5000 m²"
                />
              ) : (
                <p className="font-semibold text-gray-800">{formData.farmArea || '-'}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ trang trại</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.farmAddress}
                  onChange={(e) => handleChange('farmAddress', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập địa chỉ trang trại"
                />
              ) : (
                <p className="font-semibold text-gray-800">{formData.farmAddress || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại hình sản xuất</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.farmType}
                  onChange={(e) => handleChange('farmType', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ví dụ: Trồng trọt, Chăn nuôi, Hỗn hợp..."
                />
              ) : (
                <p className="font-semibold text-gray-800">{formData.farmType || '-'}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => handleChange('address.street', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Số nhà, đường"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={formData.address.ward}
                    onChange={(e) => handleChange('address.ward', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Phường/Xã"
                  />
                  <input
                    type="text"
                    value={formData.address.district}
                    onChange={(e) => handleChange('address.district', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Quận/Huyện"
                  />
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleChange('address.city', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Tỉnh/Thành phố"
                  />
                </div>
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) => handleChange('address.country', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Quốc gia"
                />
              </div>
            ) : (
              <p className="font-semibold text-gray-800">
                {[formData.address.street, formData.address.ward, formData.address.district, formData.address.city, formData.address.country]
                  .filter(Boolean)
                  .join(', ') || '-'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chủ trang trại / Người quản lý</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.farmOwnerName}
                  onChange={(e) => handleChange('farmOwnerName', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Nhập tên người quản lý"
                />
              ) : (
                <p className="font-semibold text-gray-800">{formData.farmOwnerName || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại liên hệ</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.farmContactPhone}
                  onChange={(e) => handleChange('farmContactPhone', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Nhập số điện thoại"
                />
              ) : (
                <p className="font-semibold text-gray-800">{formData.farmContactPhone || '-'}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            {editing ? (
              <textarea
                value={formData.farmDescription}
                onChange={(e) => handleChange('farmDescription', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                rows={4}
                placeholder="Mô tả ngắn về trang trại, quy mô, loại hình..."
              />
            ) : (
              <p className="text-gray-800 whitespace-pre-line">{formData.farmDescription || '-'}</p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>Ngày tạo: <span className="font-medium">{seller?.farmCreatedAt ? new Date(seller.farmCreatedAt).toLocaleString('vi-VN') : '-'}</span></div>
            <div>Cập nhật: <span className="font-medium">{seller?.farmUpdatedAt ? new Date(seller.farmUpdatedAt).toLocaleString('vi-VN') : '-'}</span></div>
          </div>

        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerFarm;


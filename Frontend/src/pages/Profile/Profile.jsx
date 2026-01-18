import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/Layout/MainLayout';
import { FiEdit, FiSave, FiX } from 'react-icons/fi';
import { profileAPI } from '../../utils/profileApi';
import SuccessModal from '../../components/Modal/SuccessModal';
import ErrorModal from '../../components/Modal/ErrorModal';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    country: 'Việt Nam',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address?.street || user.address?.address || '',
        ward: user.address?.ward || '',
        district: user.address?.district || '',
        city: user.address?.city || '',
        country: user.address?.country || 'Việt Nam',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      formDataToSend.append('address', JSON.stringify({
        street: formData.address,
        ward: formData.ward,
        district: formData.district,
        city: formData.city,
        country: formData.country,
      }));

      const response = await profileAPI.updateAdmin(formDataToSend);
      
      // Debug: Log response
      console.log('Profile update response:', response.data);
      
      // Update user in context
      if (response.data?.data) {
        const updatedUser = response.data.data;
        
        // Debug: Log updated user data
        console.log('Updated user from response:', updatedUser);
        console.log('Address from response:', updatedUser.address);
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Cập nhật formData ngay lập tức để hiển thị
        const newFormData = {
          fullName: updatedUser.fullName || updatedUser.name || '',
          email: updatedUser.email || '',
          phoneNumber: updatedUser.phoneNumber || '',
          address: updatedUser.address?.street || updatedUser.address?.address || '',
          ward: updatedUser.address?.ward || '',
          district: updatedUser.address?.district || '',
          city: updatedUser.address?.city || '',
          country: updatedUser.address?.country || 'Việt Nam',
        };
        
        console.log('New formData to set:', newFormData);
        setFormData(newFormData);
      }

      setSuccessModal({ isOpen: true, message: 'Cập nhật thông tin thành công' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorModal({ 
        isOpen: true, 
        message: error.response?.data?.message || 'Cập nhật thông tin thất bại, vui lòng thử lại' 
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <MainLayout title="Thông tin quản trị viên">
      <div className="space-y-6">
        {/* Profile Header with Banner */}
        <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-lg p-8 text-white relative overflow-hidden h-48">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div 
              className="absolute top-0 left-0 w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            ></div>
          </div>
          
          <div className="relative z-10 flex items-center space-x-4">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
              {user?.profile_image ? (
                <img 
                  src={`http://localhost:3000${user.profile_image}`} 
                  alt={user?.fullName || 'Admin'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-green-600 text-3xl font-bold">
                  {user?.fullName?.charAt(0) || 'A'}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.fullName || 'Admin'}</h2>
              <p className="text-green-100">{user?.email || ''}</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="ml-auto bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 transition"
                title="Chỉnh sửa"
              >
                <FiEdit className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Main Column */}
          <div className="space-y-6">
            {/* Personal Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Thông tin cá nhân</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phường</label>
                      <input
                        type="text"
                        name="ward"
                        value={formData.ward}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quận</label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quốc gia</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center space-x-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiSave className="w-4 h-4" />
                      <span>{isSaving ? 'Đang lưu...' : 'Lưu'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        if (user) {
                          setFormData({
                            fullName: user.fullName || user.name || '',
                            email: user.email || '',
                            phoneNumber: user.phoneNumber || '',
                            dateOfBirth: user.dateOfBirth || '',
                            address: user.address?.street || user.address?.address || '',
                            ward: user.address?.ward || '',
                            district: user.address?.district || '',
                            city: user.address?.city || '',
                            country: user.address?.country || 'Việt Nam',
                          });
                        }
                      }}
                      className="flex items-center space-x-1 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                    >
                      <FiX className="w-4 h-4" />
                      <span>Hủy</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Họ tên:</span>
                    <span className="text-sm text-gray-900">{formData.fullName || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Ngày sinh:</span>
                    <span className="text-sm text-gray-900">
                      {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <span className="text-sm text-gray-900">{formData.email || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Số điện thoại:</span>
                    <span className="text-sm text-gray-900">{formData.phoneNumber || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Địa chỉ:</span>
                    <span className="text-sm text-gray-900">{formData.address || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Phường:</span>
                    <span className="text-sm text-gray-900">{formData.ward || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Quận:</span>
                    <span className="text-sm text-gray-900">{formData.district || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Thành phố:</span>
                    <span className="text-sm text-gray-900">{formData.city || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-700">Quốc gia:</span>
                    <span className="text-sm text-gray-900">{formData.country || 'Việt Nam'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        title="Thành công"
        message={successModal.message}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="Thất bại"
        message={errorModal.message}
      />
    </MainLayout>
  );
};

export default Profile;


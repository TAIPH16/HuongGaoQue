import { useState, useEffect } from 'react';
import { customersAPI } from '../../utils/api';
import MainLayout from '../../components/Layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiMoreVertical, FiMinus, FiEdit, FiCheckCircle } from 'react-icons/fi';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [pagination.currentPage, searchTerm, statusFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 25,
        search: searchTerm,
      };
      if (statusFilter !== 'Tất cả') {
        params.status = statusFilter;
      }

      const response = await customersAPI.getAll(params);
      setCustomers(response.data.data || []);
      setPagination(response.data.pagination || { currentPage: 1, totalPages: 1 });
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await customersAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // --- LOGIC: CHẶN KHÁCH HÀNG (không cho đăng nhập) ---
  const handleBan = async (customer) => {
    if (window.confirm(`Bạn có chắc chắn muốn chặn khách hàng ${customer.name || customer.fullName || customer.email || 'này'}? Khách hàng sẽ không thể đăng nhập.`)) {
      try {
        await customersAPI.ban(customer._id);
        alert('Đã chặn khách hàng thành công!');
        fetchCustomers(); // Tải lại danh sách
        setSelectedCustomer(null); // Đóng menu
      } catch (error) {
        console.error('Lỗi khi chặn khách hàng:', error);
        alert('Có lỗi xảy ra, vui lòng thử lại.');
      }
    }
  };

  // --- LOGIC: MỞ KHÓA KHÁCH HÀNG (CHUYỂN TỪ CẤM SANG ACTIVE) ---
  const handleUnban = async (customer) => {
    if (window.confirm(`Bạn có chắc chắn muốn mở khóa khách hàng ${customer.name || customer.fullName || customer.email || 'này'}?`)) {
      try {
        await customersAPI.unban(customer._id);
        alert('Đã mở khóa khách hàng thành công!');
        fetchCustomers(); // Tải lại danh sách
        setSelectedCustomer(null); // Đóng menu
      } catch (error) {
        console.error('Lỗi khi mở khóa khách hàng:', error);
        alert('Có lỗi xảy ra, vui lòng thử lại.');
      }
    }
  };

  // --- LOGIC: ẨN KHÁCH HÀNG (chỉ ẩn khỏi danh sách) ---
  const handleHide = async (customer) => {
    if (window.confirm(`Bạn có chắc chắn muốn ẩn khách hàng ${customer.name || customer.fullName || customer.email || 'này'}?`)) {
      try {
        await customersAPI.hide(customer._id);
        alert('Đã ẩn khách hàng thành công!');
        fetchCustomers(); // Tải lại danh sách
        setSelectedCustomer(null); // Đóng menu
      } catch (error) {
        console.error('Lỗi khi ẩn khách hàng:', error);
        alert('Có lỗi xảy ra, vui lòng thử lại.');
      }
    }
  };

  // --- LOGIC: HIỆN KHÁCH HÀNG (bỏ ẩn) ---
  const handleUnhide = async (customer) => {
    if (window.confirm(`Bạn có chắc chắn muốn hiện lại khách hàng ${customer.name || customer.fullName || customer.email || 'này'}?`)) {
      try {
        await customersAPI.unhide(customer._id);
        alert('Đã hiện lại khách hàng thành công!');
        fetchCustomers(); // Tải lại danh sách
        setSelectedCustomer(null); // Đóng menu
      } catch (error) {
        console.error('Lỗi khi hiện lại khách hàng:', error);
        alert('Có lỗi xảy ra, vui lòng thử lại.');
      }
    }
  };

  return (
    <MainLayout title="Quản Lí Khách Hàng" onSearch={setSearchTerm}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Lượt truy cập</h3>
            <p className="text-2xl font-bold text-gray-800">{stats?.totalVisits || 7212}</p>
            <p className="text-sm text-red-600 mt-1">↓ 5.3% (-221 lượt tuần này)</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Lượt đặt hàng</h3>
            <p className="text-2xl font-bold text-gray-800">{stats?.totalOrders || 340}</p>
            <p className="text-sm text-green-600 mt-1">↑ 52% (+157 lượt hôm nay)</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Lượt đánh giá</h3>
            <p className="text-2xl font-bold text-gray-800">{stats?.totalReviews || 4082}</p>
            <p className="text-sm text-red-600 mt-1">↓ 72% (-3,527 lượt hôm nay)</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex space-x-1 p-1 border-b border-gray-200">
            {['Tất cả', 'Hoạt động', 'Đã cấm', 'Đã ẩn'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 text-sm font-medium transition ${statusFilter === tab
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Khách Hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khu Vực</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số Điện Thoại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  {/* SỬA HEADER CỘT TRẠNG THÁI */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Không có khách hàng nào
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(customer.isBanned || customer.is_banned) ? 'bg-red-100' : 'bg-green-100'}`}>
                            <span className={`${(customer.isBanned || customer.is_banned) ? 'text-red-600' : 'text-green-600'} text-xs font-semibold`}>
                              {customer.name?.charAt(0) || customer.fullName?.charAt(0) || customer.email?.charAt(0).toUpperCase() || 'K'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{customer.name || customer.fullName || customer.email || "Chưa đặt tên"}</span>
                        </div>
                      </td>
                      
                      {/* CỘT KHU VỰC - Hiển thị từ address.city hoặc region */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.region || customer.address?.city ? 
                          (customer.region || customer.address.city) : 
                          <span className="text-gray-400 italic text-xs">Chưa cập nhật</span>}
                      </td>

                      {/* CỘT SỐ ĐIỆN THOẠI - Hiển thị từ phoneNumber */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {customer.phoneNumber ? customer.phoneNumber : <span className="text-gray-400 italic text-xs">--</span>}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.email}</td>
                      
                      {/* CỘT TRẠNG THÁI */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.isBanned || customer.is_banned ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            ● Đã cấm
                            </span>
                        ) : customer.isHidden || customer.is_hidden ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            ● Đã ẩn
                            </span>
                        ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            ● Hoạt động
                            </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          {/* Nút chặn khách hàng (tròn có dấu trừ) - chỉ hiện khi customer đang active và chưa bị ẩn */}
                          {!(customer.isBanned || customer.is_banned) && !(customer.isHidden || customer.is_hidden) && (
                            <button
                              onClick={() => handleBan(customer)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 border border-red-300 text-red-600 hover:bg-red-100 transition-colors"
                              title="Chặn khách hàng (không cho đăng nhập)"
                            >
                              <FiMinus className="w-4 h-4" />
                            </button>
                          )}

                          {/* Nút bỏ chặn khách hàng - chỉ hiện khi customer đã bị chặn */}
                          {(customer.isBanned || customer.is_banned) && (
                            <button
                              onClick={() => handleUnban(customer)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 border border-green-300 text-green-600 hover:bg-green-100 transition-colors"
                              title="Bỏ chặn khách hàng"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Menu ba chấm */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setSelectedCustomer(
                                  selectedCustomer === customer._id ? null : customer._id
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                            >
                              <FiMoreVertical className="w-5 h-5" />
                            </button>

                            {selectedCustomer === customer._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                                {/* Chỉnh sửa */}
                                <button
                                  onClick={() => {
                                    navigate(`/admin/customers/${customer._id}`);
                                    setSelectedCustomer(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                                >
                                  <FiEdit className="w-4 h-4" />
                                  <span>Chỉnh sửa</span>
                                </button>

                                {/* Ẩn khách hàng - chỉ hiện khi customer đang active và chưa bị ẩn */}
                                {!(customer.isHidden || customer.is_hidden) && (
                                  <button
                                    onClick={() => {
                                      handleHide(customer);
                                      setSelectedCustomer(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                                  >
                                    <FiMinus className="w-4 h-4" />
                                    <span>Ẩn khách hàng</span>
                                  </button>
                                )}

                                {/* Hiện lại khách hàng - chỉ hiện khi customer đã bị ẩn */}
                                {(customer.isHidden || customer.is_hidden) && (
                                  <button
                                    onClick={() => {
                                      handleUnhide(customer);
                                      setSelectedCustomer(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center space-x-2 transition-colors"
                                  >
                                    <FiCheckCircle className="w-4 h-4" />
                                    <span>Hiện lại khách hàng</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị {customers.length} trên {pagination.totalCustomers || 0} khách hàng
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                &lt;
              </button>
              {[...Array(Math.min(5, pagination.totalPages || 1))].map((_, i) => {
                const page = pagination.currentPage <= 3 ? i + 1 : pagination.currentPage - 2 + i;
                if (page > pagination.totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setPagination({ ...pagination, currentPage: page })}
                    className={`px-3 py-1 rounded-lg ${page === pagination.currentPage
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-300'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomerList;
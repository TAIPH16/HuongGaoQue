import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerLayout from '../../components/Seller/SellerLayout';
import { sellerStockAPI } from '../../utils/sellerApi';
import { FiPackage, FiEdit, FiEye, FiPlus, FiSearch, FiFilter } from 'react-icons/fi';

const SellerStockManagement = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [selectedStock, setSelectedStock] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [editForm, setEditForm] = useState({ remainingQuantity: '', initialQuantity: '' });
  const [addStockForm, setAddStockForm] = useState({ quantity: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStocks();
  }, [pagination.currentPage, searchTerm, statusFilter]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 25,
        search: searchTerm,
      };
      if (statusFilter) {
        params.status = statusFilter;
      }

      const res = await sellerStockAPI.getAll(params);
      setStocks(res.data.data || []);
      setPagination(res.data.pagination || { currentPage: 1, totalPages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được danh sách kho');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (stock) => {
    setSelectedStock(stock);
    setEditForm({
      remainingQuantity: stock.remainingQuantity || '',
      initialQuantity: stock.initialQuantity || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateStock = async () => {
    try {
      await sellerStockAPI.update(selectedStock._id, editForm);
      setShowEditModal(false);
      fetchStocks();
      alert('Cập nhật kho thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleAddStock = (stock) => {
    setSelectedStock(stock);
    setAddStockForm({ quantity: '' });
    setShowAddStockModal(true);
  };

  const handleAddStockSubmit = async () => {
    try {
      await sellerStockAPI.addStock(selectedStock._id, parseInt(addStockForm.quantity));
      setShowAddStockModal(false);
      fetchStocks();
      alert('Thêm kho thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Thêm kho thất bại');
    }
  };

  const handleViewDetail = async (stock) => {
    try {
      const res = await sellerStockAPI.getById(stock._id);
      setSelectedStock(res.data.data);
      setShowDetailModal(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Không tải được chi tiết');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FiPackage className="w-6 h-6" />
              Quản lý kho
            </h2>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Còn hàng">Còn hàng</option>
              <option value="Hết hàng">Hết hàng</option>
              <option value="Đang tính">Đang tính</option>
            </select>
          </div>
        </div>

        {/* Stock List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
            </div>
          ) : stocks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Không có sản phẩm nào trong kho.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mã SP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Số lượng ban đầu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tồn kho
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Đã bán
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stocks.map((stock) => (
                    <tr key={stock._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {stock.images && stock.images[0] && (
                            <img
                              src={stock.images[0]}
                              alt={stock.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <span className="text-sm font-medium text-gray-800">
                            {stock.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{stock.productId}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {formatPrice(stock.initialQuantity || 0)} {stock.unit || 'kg'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        <span className={`font-semibold ${
                          (stock.remainingQuantity || 0) < 10 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatPrice(stock.remainingQuantity || 0)} {stock.unit || 'kg'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatPrice(stock.soldQuantity || 0)} {stock.unit || 'kg'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            stock.status === 'Còn hàng'
                              ? 'bg-green-100 text-green-800'
                              : stock.status === 'Hết hàng'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {stock.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(stock)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Xem chi tiết"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(stock)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Cập nhật"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAddStock(stock)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                            title="Thêm kho"
                          >
                            <FiPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Trang {pagination.currentPage} / {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Cập nhật kho</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Số lượng tồn kho</label>
                <input
                  type="number"
                  value={editForm.remainingQuantity}
                  onChange={(e) => setEditForm({ ...editForm, remainingQuantity: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số lượng ban đầu</label>
                <input
                  type="number"
                  value={editForm.initialQuantity}
                  onChange={(e) => setEditForm({ ...editForm, initialQuantity: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStock}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Thêm kho</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Số lượng thêm vào</label>
              <input
                type="number"
                value={addStockForm.quantity}
                onChange={(e) => setAddStockForm({ quantity: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="Nhập số lượng"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddStockModal(false)}
                className="flex-1 px-4 py-2 border rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleAddStockSubmit}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Chi tiết kho</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{selectedStock.product?.name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Mã SP:</span>
                    <span className="ml-2">{selectedStock.product?.productId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Đơn vị:</span>
                    <span className="ml-2">{selectedStock.product?.unit || 'kg'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Số lượng ban đầu:</span>
                    <span className="ml-2">{formatPrice(selectedStock.product?.initialQuantity || 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tồn kho:</span>
                    <span className="ml-2 font-semibold text-green-600">
                      {formatPrice(selectedStock.product?.remainingQuantity || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Đã bán:</span>
                    <span className="ml-2">{formatPrice(selectedStock.product?.soldQuantity || 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="ml-2">{selectedStock.product?.status}</span>
                  </div>
                </div>
              </div>
              {selectedStock.stockMovements && selectedStock.stockMovements.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Lịch sử thay đổi</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedStock.stockMovements.map((movement, idx) => (
                      <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="flex justify-between">
                          <span>Đơn hàng: {movement.orderNumber}</span>
                          <span className={movement.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
                            {movement.status}
                          </span>
                        </div>
                        <div className="text-gray-600 text-xs mt-1">
                          {new Date(movement.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDetailModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </SellerLayout>
  );
};

export default SellerStockManagement;


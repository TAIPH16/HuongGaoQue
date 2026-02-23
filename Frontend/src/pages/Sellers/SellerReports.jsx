import { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { sellersAPI } from '../../utils/api';
import { FiBarChart2, FiEye, FiX } from 'react-icons/fi';

const SellerReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailReport, setDetailReport] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await sellersAPI.getReports();
      setReports(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching seller reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (sellerId) => {
    try {
      setDetailLoading(true);
      const response = await sellersAPI.getReportById(sellerId);
      setDetailReport(response.data?.data || null);
    } catch (error) {
      console.error('Error fetching seller report detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value == null) return '0₫';
    return new Intl.NumberFormat('vi-VN').format(value) + '₫';
  };

  const formatNumber = (value) => {
    if (value == null) return '0';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <MainLayout title="Báo cáo người bán">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">
            Tổng quan doanh thu, đơn hàng và sản phẩm theo từng người bán. Bấm &quot;Xem chi tiết&quot; để xem báo cáo chi tiết.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người bán</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khu vực</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Đơn hàng</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">SP đã bán</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Đơn chờ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng SP</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto" />
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      Chưa có dữ liệu báo cáo người bán.
                    </td>
                  </tr>
                ) : (
                  reports.map((item) => (
                    <tr key={item.seller?._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.seller?.fullName || item.seller?.email || '—'}</div>
                        <div className="text-xs text-gray-500">{item.seller?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.seller?.region || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-green-700">
                        {formatCurrency(item.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900">
                        {formatNumber(item.totalOrders)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900">
                        {formatNumber(item.totalProductsSold)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-amber-600">
                        {formatNumber(item.pendingOrders)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900">
                        {formatNumber(item.totalProducts)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openDetail(item.seller._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100"
                        >
                          <FiEye className="w-4 h-4" />
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal chi tiết báo cáo một người bán */}
      {(detailReport !== null || detailLoading) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => !detailLoading && setDetailReport(null)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FiBarChart2 className="w-5 h-5 text-green-600" />
                Báo cáo chi tiết
              </h3>
              <button
                onClick={() => setDetailReport(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {detailLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
                </div>
              ) : detailReport ? (
                <>
                  <div className="mb-6">
                    <p className="font-semibold text-gray-900">{detailReport.seller?.fullName || '—'}</p>
                    <p className="text-sm text-gray-500">{detailReport.seller?.email}</p>
                    {detailReport.seller?.region && (
                      <p className="text-sm text-gray-600">Khu vực: {detailReport.seller.region}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Tổng doanh thu</p>
                      <p className="text-xl font-bold text-green-700">{formatCurrency(detailReport.totalRevenue)}</p>
                    </div>
                    <div className="p-4 bg-white border rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Tổng đơn hàng (đã hoàn thành)</p>
                      <p className="text-xl font-bold text-gray-900">{formatNumber(detailReport.totalOrders)}</p>
                    </div>
                    <div className="p-4 bg-white border rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Số lượng sản phẩm đã bán</p>
                      <p className="text-xl font-bold text-gray-900">{formatNumber(detailReport.totalProductsSold)}</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Đơn hàng chờ xử lý</p>
                      <p className="text-xl font-bold text-amber-700">{formatNumber(detailReport.pendingOrders)}</p>
                    </div>
                    <div className="p-4 bg-white border rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Tổng sản phẩm đang bán</p>
                      <p className="text-xl font-bold text-gray-900">{formatNumber(detailReport.totalProducts)}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Sản phẩm hết hàng</p>
                      <p className="text-xl font-bold text-red-700">{formatNumber(detailReport.outOfStockProducts)}</p>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default SellerReports;

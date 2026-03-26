import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import contactAPI from "./contactAPI";

const AdminContactPage = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // ================= LOAD CONTACTS =================
  const loadContacts = async () => {
    setLoading(true);
    try {
      const res = await contactAPI.getAll({ search, date: filterDate });
      setContacts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [search, filterDate]);

  // ================= DELETE CONTACT =================
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá liên hệ này?")) return;
    try {
      await contactAPI.delete(id);
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // ================= MARK REPLIED =================
  const handleUpdate = async (contact) => {
    try {
      // Cập nhật trên server
      await contactAPI.update(contact._id, { replied: !contact.replied });

      // Cập nhật trực tiếp local state để UI đổi ngay
      setContacts((prev) =>
        prev.map((c) =>
          c._id === contact._id ? { ...c, replied: !c.replied } : c
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  // ================= RESET SEARCH/FILTER =================
  const handleReset = () => {
    setSearch("");
    setFilterDate("");
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Quản Lý Liên Hệ</h1>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email, số điện thoại"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 flex-1"
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
        <button
          onClick={handleReset}
          className="bg-[#2d5016] text-white px-4 py-2 rounded-lg hover:bg-[#1f350d]"
        >
          Reset
        </button>
      </div>

      {/* CONTACT LIST */}
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : contacts.length === 0 ? (
        <p>Không có liên hệ nào.</p>
      ) : (
        <div className="space-y-4">
          {contacts.map((c) => (
            <ContactItem
              key={c._id}
              contact={c}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContactPage;

// ================= COMPONENT =================
const ContactItem = ({ contact, onUpdate, onDelete }) => {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="border p-4 rounded-lg bg-white shadow cursor-pointer hover:bg-gray-50">
      {/* CLICK TOGGLE DETAIL */}
      <div
        className="flex justify-between items-center"
        onClick={() => setShowDetail(!showDetail)}
      >
        <p className="font-semibold">{contact.email}</p>
        <p
          className={`px-2 py-1 rounded text-white ${
            contact.replied ? "bg-yellow-500" : "bg-green-600"
          }`}
        >
          {contact.replied ? "Đã phản hồi" : "Chưa phản hồi"}
        </p>
      </div>

      {showDetail && (
        <div className="mt-2 space-y-1">
          <p>
            <b>SĐT:</b> {contact.phone}
          </p>
          <p>
            <b>Email:</b> {contact.email}
          </p>
          <p>
            <b>Lời nhắn:</b> {contact.message}
          </p>
          <p>
            <b>Ngày gửi:</b>{" "}
            {new Date(contact.createdAt).toLocaleString("vi-VN")}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onUpdate(contact)}
              className={`px-3 py-1 rounded-lg text-white ${
                contact.replied ? "bg-yellow-500" : "bg-green-600"
              }`}
            >
              {contact.replied ? "Bỏ phản hồi" : "Đánh dấu đã phản hồi"}
            </button>
            <button
              onClick={() => onDelete(contact._id)}
              className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Xoá
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
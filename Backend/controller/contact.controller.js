const Contact = require("../model/contact");

//
// ================= CREATE CONTACT (CUSTOMER) =================
// POST /api/contacts/submit
//
exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu",
      });
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      message,
      replied: false, // mặc định
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: "Gửi liên hệ thành công",
      data: newContact,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//
// ================= GET ALL CONTACTS (ADMIN) =================
// GET /api/contacts?search=&date=
//
exports.getAllContacts = async (req, res) => {
  try {
    const { search, date } = req.query;

    let query = {};

    // ===== SEARCH =====
    if (search && search.trim() !== "") {
      const regex = new RegExp(search, "i");

      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    // ===== FILTER DATE =====
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 });

    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//
// ================= UPDATE CONTACT =================
// PATCH /api/contacts/:id
//
exports.updateContact = async (req, res) => {
  try {
    const { replied } = req.body;

    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      { replied },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy contact",
      });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//
// ================= DELETE CONTACT =================
// DELETE /api/contacts/:id
//
exports.deleteContact = async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy contact",
      });
    }

    res.json({
      success: true,
      message: "Đã xoá liên hệ",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
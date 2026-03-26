const express = require("express");
const router = express.Router();
const contactController = require("../controller/contact.controller");

// Lấy danh sách tất cả contact
router.get("/", contactController.getAllContacts);

// Tạo contact
router.post("/submit", contactController.createContact);

// Xoá contact
router.delete("/:id", contactController.deleteContact);

// Cập nhật contact (ví dụ replied)
router.put("/:id", contactController.updateContact);

module.exports = router;
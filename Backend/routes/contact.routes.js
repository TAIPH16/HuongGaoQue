const express = require("express");
const router = express.Router();
const contactController = require("../controller/contact.controller");
const protectRoute = require("../middleware/auth.middleware");
const { uploadMultiple, handleUploadError } = require("../middleware/upload.middleware");

// === SEARCH CONTACT (Admin) ===
router.get(
  "/search",
  protectRoute(["admin"]),
  contactController.searchContact
);

// === FILTER CONTACT (Admin) ===
router.get(
  "/filter",
  protectRoute(["admin"]),
  contactController.filterContact
);

// === CREATE CONTACT (User) ===
router.post(
  "/",
  protectRoute(["user"]),
  uploadMultiple("attachments", 5),   // max 5 files
  handleUploadError,
  contactController.createContact
);

// === GET ALL CONTACTS ===
router.get(
  "/",
  protectRoute(["admin", "user"]),
  contactController.viewContactList
);

// === GET CONTACT DETAIL ===
router.get(
  "/:id",
  protectRoute(["admin", "user"]),
  contactController.viewContactDetail
);

// === UPDATE CONTACT ===
router.put(
  "/:id",
  protectRoute(["admin", "user"]),
  uploadMultiple("attachments", 5),
  handleUploadError,
  contactController.updateContact
);

// === DELETE CONTACT ===
router.delete(
  "/:id",
  protectRoute(["admin"]),
  contactController.deleteContact
);

// === GET ATTACHMENT OF MAIN MESSAGE ===
router.get(
  "/:id/attachment/:index",
  protectRoute(["admin", "user"]),
  contactController.getAttachment
);

// === GET ATTACHMENT OF REPLY ===
router.get(
  "/:contactId/reply/:replyIndex/attachment/:attachmentIndex",
  protectRoute(["admin", "user"]),
  contactController.getReplyAttachment
);

// === REPLY CONTACT ===
router.post(
  "/:id/reply",
  protectRoute(["user", "admin"]),
  uploadMultiple("attachments", 5),
  handleUploadError,
  contactController.replyContact
);

module.exports = router;

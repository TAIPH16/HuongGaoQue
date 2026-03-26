const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    replied: { type: Boolean, default: false }, // thêm trường replied
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", ContactSchema);
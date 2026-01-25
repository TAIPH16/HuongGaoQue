const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      default: "",
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minlength: 6,
      required: function () {
        // Password is only required if a google_id is NOT present
        return !this.google_id;
      },
    },
    phoneNumber: { type: String, default: "" },
    // 2. Thêm trường Khu vực (Thành phố/Tỉnh)
    region: { type: String, default: "" },
    // Farm information for sellers
    farmName: { type: String, default: "" },
    farmAddress: { type: String, default: "" },
    // Address object - lưu thông tin địa chỉ chi tiết
    address: {
      street: { type: String, default: "" },
      ward: { type: String, default: "" },
      district: { type: String, default: "" },
      city: { type: String, default: "" },
      country: { type: String, default: "Việt Nam" },
    },
    google_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    facebook_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    profile_image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin", "guest", "seller"],
      default: "user",
    },
    // Total membership points (number) used for membership rank calculation
    membership_points: {
      type: Number,
      default: 0,
    },
    // Whether the user is banned (separate boolean flag)
    is_banned: {
      type: Boolean,
      default: false,
    },
    // Whether the user is hidden from admin list
    is_hidden: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    // Whether the seller is approved (for seller role)
    is_approved: {
      type: Boolean,
      default: function () {
        return this.role !== "seller"; // Auto-approve non-sellers
      },
    },
    login_history: [
      {
        login_time: {
          type: Date,
          default: Date.now,
        },
        login_type: {
          type: String,
          enum: ["email", "google"],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

// 🔑 Hash password before saving
userSchema.pre("save", async function (next) {
  // Hash if modified AND it's not a pure Google-only account (has password field)
  if (!this.isModified("password") || (!this.password && this.google_id)) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 Compare password function
userSchema.methods.comparePassword = async function (userPassword) {
  // If the user has a password, compare it; otherwise, return false
  if (this.password) {
    return await bcrypt.compare(userPassword, this.password);
  }
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;

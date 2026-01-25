const User = require("../model/user");
const path = require("path");
const fs = require("fs");

/**
 * Lấy danh sách users
 */
const getUsers = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find({ isActive: true })
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments({ isActive: true });

  return {
    data: users,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      limit,
    },
  };
};

/**
 * Lấy chi tiết user
 */
const getUserDetail = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  return user;
};

/**
 * Cập nhật user
 */
const updateUser = async (userId, userData, file) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  const {
    fullName,
    email,
    phoneNumber,
    address,
    region,
    dateOfBirth,
    settlementAccount,
    businessInfo,
    accountSettings,
    securitySettings,
    deleteAvatar,
  } = userData;

  /* ================= AVATAR ================= */

  if (file) {
    // xóa avatar cũ nếu có
    if (user.profile_image) {
      const oldPath = path.join(__dirname, "..", "public", user.profile_image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    user.profile_image = "/images/users/" + file.filename;
  }

  if (deleteAvatar === "true" || deleteAvatar === true) {
    if (user.profile_image) {
      const avatarPath = path.join(
        __dirname,
        "..",
        "public",
        user.profile_image,
      );
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
      user.profile_image = "";
    }
  }

  /* ================= BASIC INFO ================= */

  if (fullName !== undefined && fullName !== "") {
    user.fullName = fullName;
    user.name = fullName;
  }

  if (email && email !== user.email) {
    const existed = await User.findOne({ email });
    if (existed && existed._id.toString() !== userId) {
      throw new Error("Email đã được sử dụng");
    }
    user.email = email;
  }

  /* ================= PHONE VALIDATE (QUAN TRỌNG) ================= */

  if (phoneNumber !== undefined) {
    if (phoneNumber !== "" && !/^0\d{9}$/.test(phoneNumber)) {
      throw new Error("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)");
    }
    user.phoneNumber = phoneNumber || "";
  }

  /* ================= ADDRESS ================= */

  if (address !== undefined && address !== null) {
    try {
      if (!(typeof address === "string" && address.trim() === "")) {
        const parsed =
          typeof address === "string" ? JSON.parse(address) : address;

        if (!user.address) {
          user.address = {
            street: "",
            ward: "",
            district: "",
            city: "",
            country: "Việt Nam",
          };
        }

        user.address.street =
          parsed.street !== undefined
            ? parsed.street || ""
            : user.address.street;
        user.address.ward =
          parsed.ward !== undefined ? parsed.ward || "" : user.address.ward;
        user.address.district =
          parsed.district !== undefined
            ? parsed.district || ""
            : user.address.district;
        user.address.city =
          parsed.city !== undefined ? parsed.city || "" : user.address.city;
        user.address.country =
          parsed.country !== undefined
            ? parsed.country || "Việt Nam"
            : user.address.country;

        if (parsed.city) {
          user.region = parsed.city;
        }
      }
    } catch (err) {
      console.error("Parse address error:", err);
    }
  }

  if (region !== undefined && region !== "") {
    user.region = region;
  }

  if (dateOfBirth) {
    user.dateOfBirth = new Date(dateOfBirth);
  }

  /* ================= JSON FIELDS ================= */

  if (settlementAccount !== undefined) {
    user.settlementAccount =
      typeof settlementAccount === "string"
        ? JSON.parse(settlementAccount)
        : settlementAccount;
  }

  if (businessInfo !== undefined) {
    user.businessInfo =
      typeof businessInfo === "string"
        ? JSON.parse(businessInfo)
        : businessInfo;
  }

  if (accountSettings !== undefined) {
    user.accountSettings =
      typeof accountSettings === "string"
        ? JSON.parse(accountSettings)
        : accountSettings;
  }

  if (securitySettings !== undefined) {
    user.securitySettings =
      typeof securitySettings === "string"
        ? JSON.parse(securitySettings)
        : securitySettings;
  }

  await user.save();

  const updatedUser = await User.findById(user._id).select("-password").lean();

  // normalize address
  updatedUser.address = {
    street: updatedUser.address?.street || "",
    ward: updatedUser.address?.ward || "",
    district: updatedUser.address?.district || "",
    city: updatedUser.address?.city || "",
    country: updatedUser.address?.country || "Việt Nam",
  };

  if (!updatedUser.fullName && updatedUser.name) {
    updatedUser.fullName = updatedUser.name;
  }

  if (!updatedUser.name && updatedUser.fullName) {
    updatedUser.name = updatedUser.fullName;
  }

  console.log("Updated user:", {
    _id: updatedUser._id,
    fullName: updatedUser.fullName,
    phoneNumber: updatedUser.phoneNumber,
    region: updatedUser.region,
  });

  return updatedUser;
};

/**
 * Xóa user (soft delete)
 */
const deleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  user.isActive = false;
  await user.save();
};

module.exports = {
  getUsers,
  getUserDetail,
  updateUser,
  deleteUser,
};

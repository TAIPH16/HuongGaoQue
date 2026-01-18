// ... existing code ...
const User = require('../model/user.js');

exports.getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;

    let query = { role: 'user' }; // Chỉ lấy users có role là 'user'
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'Đã cấm' || status === 'Banned') {
      query.is_banned = true;
      query.is_hidden = { $ne: true }; // Don't show hidden in banned filter
    } else if (status === 'Hoạt động' || status === 'Active') {
      query.is_banned = { $ne: true };
      query.is_hidden = { $ne: true }; // Don't show hidden in active filter
    } else if (status === 'Đã ẩn' || status === 'Hidden') {
      query.is_hidden = true;
    } else {
      // For "Tất cả", show all except hidden (unless explicitly filtering for hidden)
      // Actually, for "Tất cả" we should show everything
    }

    const customers = await User.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCustomers: total,
        limit: limit
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCustomerStats = async (req, res) => {
  try {
    // Implement stats logic here
    const totalVisits = await User.countDocuments({ role: 'user' });
    // ... calculate other stats
    
    res.status(200).json({
      success: true,
      data: {
        totalVisits: totalVisits || 7212,
        totalOrders: 340,
        totalReviews: 4082
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'user' });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.banCustomer = async (req, res) => {
  try {
    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { is_banned: true }, // Dùng is_banned theo model
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.unbanCustomer = async (req, res) => {
  try {
    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { is_banned: false }, // Dùng is_banned theo model
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.hideCustomer = async (req, res) => {
  try {
    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { is_hidden: true },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.unhideCustomer = async (req, res) => {
  try {
    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { is_hidden: false },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update customer by admin
exports.updateCustomer = async (req, res) => {
  try {
    const userService = require('../service/user.service');
    const userData = {
      fullName: req.body.fullName || req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      region: req.body.region,
      address: req.body.address,
      dateOfBirth: req.body.dateOfBirth,
      deleteAvatar: req.body.deleteAvatar,
    };
    
    const updatedCustomer = await userService.updateUser(req.params.id, userData, req.file || null);
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin khách hàng thành công',
      data: updatedCustomer
    });
  } catch (err) {
    if (err.message === 'Không tìm thấy người dùng' || err.message === 'Email đã được sử dụng') {
      return res.status(err.message === 'Không tìm thấy người dùng' ? 404 : 400).json({
        success: false,
        message: err.message
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};
const User = require('../model/user.js');

// Get all sellers with filters
exports.getSellers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status;

        let query = { role: 'seller' };

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }

        if (status === 'Đã cấm' || status === 'Banned') {
            query.is_banned = true;
            query.is_hidden = { $ne: true };
        } else if (status === 'Hoạt động' || status === 'Active') {
            query.is_banned = { $ne: true };
            query.is_hidden = { $ne: true };
        } else if (status === 'Đã ẩn' || status === 'Hidden') {
            query.is_hidden = true;
        }

        const sellers = await User.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 });

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: sellers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalSellers: total,
                limit: limit
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get seller statistics
exports.getSellerStats = async (req, res) => {
    try {
        const totalSellers = await User.countDocuments({ role: 'seller' });
        const activeSellers = await User.countDocuments({ role: 'seller', is_banned: { $ne: true }, is_hidden: { $ne: true } });
        const bannedSellers = await User.countDocuments({ role: 'seller', is_banned: true });

        res.status(200).json({
            success: true,
            data: {
                totalSellers: totalSellers || 0,
                activeSellers: activeSellers || 0,
                bannedSellers: bannedSellers || 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get seller by ID
exports.getSellerById = async (req, res) => {
    try {
        const seller = await User.findOne({ _id: req.params.id, role: 'seller' });
        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }
        res.status(200).json({ success: true, data: seller });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Approve seller
exports.approveSeller = async (req, res) => {
    try {
        const seller = await User.findByIdAndUpdate(
            req.params.id,
            { is_approved: true, is_banned: false },
            { new: true }
        );
        if (!seller) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người bán' });
        }
        res.status(200).json({ success: true, data: seller });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Reject seller
exports.rejectSeller = async (req, res) => {
    try {
        const seller = await User.findByIdAndUpdate(
            req.params.id,
            { is_approved: false, is_banned: true },
            { new: true }
        );
        if (!seller) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người bán' });
        }
        res.status(200).json({ success: true, data: seller });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Ban seller
exports.banSeller = async (req, res) => {
    try {
        const seller = await User.findByIdAndUpdate(
            req.params.id,
            { is_banned: true },
            { new: true }
        );
        if (!seller) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người bán' });
        }
        res.status(200).json({ success: true, data: seller });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Unban seller
exports.unbanSeller = async (req, res) => {
    try {
        const seller = await User.findByIdAndUpdate(
            req.params.id,
            { is_banned: false },
            { new: true }
        );
        if (!seller) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người bán' });
        }
        res.status(200).json({ success: true, data: seller });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Hide seller
exports.hideSeller = async (req, res) => {
    try {
        const seller = await User.findByIdAndUpdate(
            req.params.id,
            { is_hidden: true },
            { new: true }
        );
        if (!seller) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người bán' });
        }
        res.status(200).json({ success: true, data: seller });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Unhide seller
exports.unhideSeller = async (req, res) => {
    try {
        const seller = await User.findByIdAndUpdate(
            req.params.id,
            { is_hidden: false },
            { new: true }
        );
        if (!seller) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người bán' });
        }
        res.status(200).json({ success: true, data: seller });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update seller by admin
exports.updateSeller = async (req, res) => {
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

        const updatedSeller = await userService.updateUser(req.params.id, userData, req.file || null);

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin người bán thành công',
            data: updatedSeller
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

const express = require('express');
const router = express.Router();
const User = require('../model/user');
const jwt = require('jsonwebtoken');

// UNIFIED LOGIN - Cho tất cả roles: admin, seller, customer
exports.unifiedLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user (bất kỳ role nào)
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Check if banned
        if (user.is_banned) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn đã bị khóa'
            });
        }

        // Check if seller needs approval
        if (user.role === 'seller' && !user.is_approved) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn chưa được duyệt. Vui lòng đợi admin xác nhận.'
            });
        }

        // Generate token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Update login history
        user.login_history.push({
            login_time: new Date(),
            login_type: 'email'
        });
        await user.save();

        // Return user data with role for frontend routing
        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name || user.fullName,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role, // QUAN TRỌNG: Frontend dùng để redirect
                    phoneNumber: user.phoneNumber,
                    profile_image: user.profile_image
                }
            }
        });
    } catch (error) {
        console.error('Unified login error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi đăng nhập'
        });
    }
};

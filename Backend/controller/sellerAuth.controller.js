const express = require('express');
const router = express.Router();
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Seller Registration
exports.registerSeller = async (req, res) => {
    try {
        const { name, email, password, phoneNumber, farmName, farmAddress } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        // Create new seller
        const seller = new User({
            name,
            fullName: name,
            email,
            password,
            phoneNumber,
            role: 'seller',
            is_approved: false, // Chờ admin duyệt

            farmName: farmName || '',
            farmAddress: farmAddress || '',
            address: {
                street: farmAddress || '',
            },
        });

        await seller.save();

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công! Vui lòng đợi admin duyệt tài khoản.',
            data: {
                id: seller._id,
                email: seller.email,
                name: seller.name,
                is_approved: seller.is_approved
            }
        });
    } catch (error) {
        console.error('Seller registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi đăng ký'
        });
    }
};

// Seller Login
exports.loginSeller = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find seller
        const seller = await User.findOne({ email, role: 'seller' });
        if (!seller) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Check if banned
        if (seller.is_banned) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn đã bị khóa'
            });
        }

        // Check if approved
        if (!seller.is_approved) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn chưa được duyệt. Vui lòng đợi admin xác nhận.'
            });
        }

        // Check password
        const isPasswordValid = await seller.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: seller._id,
                role: seller.role,
                email: seller.email
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Update login history
        seller.login_history.push({
            login_time: new Date(),
            login_type: 'email'
        });
        await seller.save();

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                token,
                seller: {
                    id: seller._id,
                    name: seller.name,
                    fullName: seller.fullName,
                    email: seller.email,
                    phoneNumber: seller.phoneNumber,
                    role: seller.role,
                    profile_image: seller.profile_image
                }
            }
        });
    } catch (error) {
        console.error('Seller login error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi đăng nhập'
        });
    }
};

// Get Seller Profile
exports.getSellerProfile = async (req, res) => {
    try {
        const seller = await User.findById(req.userId).select('-password');
        if (!seller || seller.role !== 'seller') {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin người bán'
            });
        }

        res.json({
            success: true,
            data: seller
        });
    } catch (error) {
        console.error('Get seller profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thông tin'
        });
    }
};

// Update Seller Profile
exports.updateSellerProfile = async (req, res) => {
    try {
        const { fullName, phoneNumber, address, region, farmName, farmAddress } = req.body;

        const seller = await User.findById(req.userId);
        if (!seller || seller.role !== 'seller') {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin người bán'
            });
        }

        // Update fields
        if (fullName) seller.fullName = fullName;
        if (phoneNumber) seller.phoneNumber = phoneNumber;
        if (region) seller.region = region;
        if (farmName) seller.farmName = farmName;
        if (farmAddress) seller.farmAddress = farmAddress;
        if (address) {
            seller.address = typeof address === 'string' ?
                { street: address } :
                { ...seller.address, ...address };
        }

        // Handle avatar upload if present
        if (req.file) {
            seller.profile_image = `/images/sellers/${req.file.filename}`;
        }

        await seller.save();

        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: seller
        });
    } catch (error) {
        console.error('Update seller profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật thông tin'
        });
    }
};

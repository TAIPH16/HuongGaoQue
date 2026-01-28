const User = require('../model/user');
const jwt = require('jsonwebtoken');

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

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email và mật khẩu là bắt buộc'
            });
        }

        // Normalize email to lowercase (same as registration)
        const normalizedEmail = email.trim().toLowerCase();
        // Trim password to remove any accidental whitespace
        const trimmedPassword = password.trim();
        
        // Find seller
        const seller = await User.findOne({ email: normalizedEmail, role: 'seller' });
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

        // Check if seller has password (not OAuth only account)
        if (!seller.password) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản này sử dụng đăng nhập bằng Google/Facebook'
            });
        }

        // Check password
        const isPasswordValid = await seller.comparePassword(trimmedPassword);
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
                    profile_image: seller.profile_image,
                    address: seller.address,
                    farmName: seller.farmName,
                    farmAddress: seller.farmAddress,
                    farmArea: seller.farmArea,
                    farmType: seller.farmType,
                    farmOwnerName: seller.farmOwnerName,
                    farmContactPhone: seller.farmContactPhone,
                    farmDescription: seller.farmDescription,
                    farmCreatedAt: seller.farmCreatedAt,
                    farmUpdatedAt: seller.farmUpdatedAt,
                    region: seller.region,
                    is_approved: seller.is_approved,
                    is_banned: seller.is_banned
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
        const { fullName, phoneNumber, address, region, farmName, farmAddress, farmArea, farmType, farmOwnerName, farmContactPhone, farmDescription } = req.body;

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
        if (farmArea !== undefined) seller.farmArea = farmArea;
        if (farmType !== undefined) seller.farmType = farmType;
        if (farmOwnerName !== undefined) seller.farmOwnerName = farmOwnerName;
        if (farmContactPhone !== undefined) seller.farmContactPhone = farmContactPhone;
        if (farmDescription !== undefined) seller.farmDescription = farmDescription;
        if (address) {
            try {
                let parsed = typeof address === 'string' ? JSON.parse(address) : address;
                if (parsed && typeof parsed === 'object') {
                    seller.address = {
                        street: parsed.street || seller.address?.street || '',
                        ward: parsed.ward || seller.address?.ward || '',
                        district: parsed.district || seller.address?.district || '',
                        city: parsed.city || seller.address?.city || '',
                        country: parsed.country || seller.address?.country || 'Việt Nam',
                    };
                } else {
                    // fallback: treat as plain street string
                    seller.address = { street: String(address) };
                }
            } catch (e) {
                // fallback when not JSON
                seller.address = { street: String(address) };
            }
        }

        // Handle avatar upload if present
        if (req.file) {
            seller.profile_image = `/images/sellers/${req.file.filename}`;
        }

        // set/update farm dates
        if (!seller.farmCreatedAt && (farmName || farmAddress || farmArea || farmType || farmOwnerName || farmContactPhone || farmDescription || address)) {
            seller.farmCreatedAt = new Date();
        }
        seller.farmUpdatedAt = new Date();

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

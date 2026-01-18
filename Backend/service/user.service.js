const User = require('../model/user');
const path = require('path');
const fs = require('fs');

/**
 * Lấy danh sách users
 */
const getUsers = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ isActive: true })
        .select('-password')
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
            limit: limit
        }
    };
};

/**
 * Lấy chi tiết user
 */
const getUserDetail = async (userId) => {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
        throw new Error('Không tìm thấy người dùng');
    }

    return user;
};

/**
 * Cập nhật user
 */
const updateUser = async (userId, userData, file) => {
    const user = await User.findById(userId);
    
    if (!user) {
        throw new Error('Không tìm thấy người dùng');
    }

    const {
        fullName,
        email,
        phoneNumber,
        address,
        dateOfBirth,
        settlementAccount,
        businessInfo,
        accountSettings,
        securitySettings,
        deleteAvatar
    } = userData;

    // Xử lý avatar mới
    if (file) {
        // Xóa avatar cũ nếu có
        if (user.avatar) {
            const oldAvatarPath = path.join(__dirname, '..', 'public', user.avatar);
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }
        user.avatar = '/images/users/' + file.filename;
    }

    // Xóa avatar nếu được yêu cầu
    if (deleteAvatar === 'true' || deleteAvatar === true) {
        if (user.avatar) {
            const avatarPath = path.join(__dirname, '..', 'public', user.avatar);
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
            }
            user.avatar = '';
        }
    }

    // Cập nhật các trường khác
    if (fullName !== undefined && fullName !== null && fullName !== '') {
        user.fullName = fullName;
        // Cũng cập nhật name để tương thích
        user.name = fullName;
    }
    if (email !== undefined && email !== null && email !== '' && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser._id.toString() !== userId) {
            throw new Error('Email đã được sử dụng');
        }
        user.email = email;
    }
    if (phoneNumber !== undefined) {
        user.phoneNumber = phoneNumber || '';
    }
    // Xử lý address - luôn cập nhật nếu có trong request
    if (address !== undefined && address !== null) {
        try {
            // Nếu là string rỗng, skip
            if (typeof address === 'string' && address.trim() === '') {
                // Không làm gì, giữ nguyên address cũ
            } else {
                const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
                if (parsedAddress && typeof parsedAddress === 'object') {
                    // Đảm bảo user.address là object
                    if (!user.address) {
                        user.address = {
                            street: '',
                            ward: '',
                            district: '',
                            city: '',
                            country: 'Việt Nam'
                        };
                    }
                    // Cập nhật từng field của address (cho phép empty string)
                    user.address.street = parsedAddress.street !== undefined ? (parsedAddress.street || '') : user.address.street;
                    user.address.ward = parsedAddress.ward !== undefined ? (parsedAddress.ward || '') : user.address.ward;
                    user.address.district = parsedAddress.district !== undefined ? (parsedAddress.district || '') : user.address.district;
                    user.address.city = parsedAddress.city !== undefined ? (parsedAddress.city || '') : user.address.city;
                    user.address.country = parsedAddress.country !== undefined ? (parsedAddress.country || 'Việt Nam') : user.address.country;
                    
                    // Cập nhật region từ address.city nếu có
                    if (parsedAddress.city && parsedAddress.city.trim() !== '') {
                        user.region = parsedAddress.city;
                    }
                }
            }
        } catch (error) {
            console.error('Error parsing address:', error, 'Address value:', address);
            // Nếu parse lỗi, bỏ qua và giữ nguyên address cũ
        }
    }
    // Cập nhật region trực tiếp nếu có (ưu tiên hơn address.city)
    if (userData.region !== undefined && userData.region !== null && userData.region !== '') {
        user.region = userData.region;
    }
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (settlementAccount !== undefined) {
        user.settlementAccount = typeof settlementAccount === 'string' 
            ? JSON.parse(settlementAccount) 
            : settlementAccount;
    }
    if (businessInfo !== undefined) {
        user.businessInfo = typeof businessInfo === 'string' 
            ? JSON.parse(businessInfo) 
            : businessInfo;
    }
    if (accountSettings !== undefined) {
        user.accountSettings = typeof accountSettings === 'string' 
            ? JSON.parse(accountSettings) 
            : accountSettings;
    }
    if (securitySettings !== undefined) {
        user.securitySettings = typeof securitySettings === 'string' 
            ? JSON.parse(securitySettings) 
            : securitySettings;
    }

    await user.save();

    // Query lại với toObject() để đảm bảo trả về plain object với đầy đủ fields
    const updatedUser = await User.findById(user._id).select('-password').lean();
    
    // Đảm bảo address luôn là object với đầy đủ fields
    if (!updatedUser.address) {
        updatedUser.address = {
            street: '',
            ward: '',
            district: '',
            city: '',
            country: 'Việt Nam'
        };
    } else {
        // Đảm bảo tất cả các field của address đều có giá trị
        updatedUser.address = {
            street: updatedUser.address.street || '',
            ward: updatedUser.address.ward || '',
            district: updatedUser.address.district || '',
            city: updatedUser.address.city || '',
            country: updatedUser.address.country || 'Việt Nam'
        };
    }
    
    // Đảm bảo fullName và name đều có giá trị
    if (!updatedUser.fullName && updatedUser.name) {
        updatedUser.fullName = updatedUser.name;
    }
    if (!updatedUser.name && updatedUser.fullName) {
        updatedUser.name = updatedUser.fullName;
    }
    
    // Debug: Log để kiểm tra
    console.log('User after save and normalize:', {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        name: updatedUser.name,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        region: updatedUser.region
    });
    
    return updatedUser;
};

/**
 * Xóa user (soft delete)
 */
const deleteUser = async (userId) => {
    const user = await User.findById(userId);
    
    if (!user) {
        throw new Error('Không tìm thấy người dùng');
    }

    user.isActive = false;
    await user.save();
};

module.exports = {
    getUsers,
    getUserDetail,
    updateUser,
    deleteUser
};


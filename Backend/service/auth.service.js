const User = require("../model/user.js");
const jwt = require("jsonwebtoken");
const NodeCache = require("node-cache");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const TokenBlacklist = require("../model/tokenblacklist.js");

// Initialize in-memory cache for OTP and reset tokens
const otpCache = new NodeCache({
    stdTTL: 300, // OTP expires after 5 minutes
    checkperiod: 60,
});

const cooldownCache = new NodeCache({
    stdTTL: 30, // 30 seconds cooldown for OTP resend
    checkperiod: 10,
});

const resetTokenCache = new NodeCache({
    stdTTL: 900, // Reset token expires after 15 minutes
    checkperiod: 60,
});

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Google OAuth2 client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "99d" });
};

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const sendOTP = async (email, otp, subject = "Your OTP", purpose = "OTP") => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const mailSubject = subject || "Your OTP";
    const text = `Your ${purpose} is ${otp}. It is valid for 5 minutes.`;

    if (!emailUser || !emailPass) {
        console.warn(`[DEV ONLY] Email credentials missing. ${purpose}:`, otp, 'to:', email);
        return;
    }
    const mailOptions = {
        from: emailUser,
        to: email,
        subject: mailSubject,
        text,
    };

    await transporter.sendMail(mailOptions);
};

const sendResetLink = async (email, token) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    // If email credentials are missing, log the link for development instead of failing
    if (!emailUser || !emailPass) {
        console.warn('Email credentials are missing. Skipping email send. Reset link (dev only):', resetLink);
        return;
    }

    const mailOptions = {
        from: emailUser,
        to: email,
        subject: "Password Reset Request",
        text: `Click the following link to reset your password: ${resetLink}\nThis link is valid for 15 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        // As a fallback, log the link to allow manual testing
        console.error('Failed to send reset email. Reset link (dev only):', resetLink);
        throw err;
    }
};

const loginService = async (email, password) => {
    if (!email || !password) {
        throw new Error("All fields are required!");
    }

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Invalid email or password!");
    }

    // check if account is banned
    if (user.is_banned) {
        throw new Error("This account has been banned!");
    }

    // check if account is deleted
    if (user.is_deleted) {
        throw new Error("This account has been deleted!");
    }

    // check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new Error("Invalid email or password!");
    }

    // Log login event
    user.login_history.push({
        login_time: new Date(),
        login_type: "email",
    });
    await user.save();

    const token = generateToken(user._id);

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address,
            region: user.region,
            profile_image: user.profile_image,
            role: user.role,
            created_at: user.created_at,
        },
    };
};

const registerService = async (name, email, password, role = 'user') => {
    if (!name || !email || !password) {
        throw new Error("All fields are required!");
    }

    if (password.length < 6) {
        throw new Error("Password should be at least 6 characters long!");
    }

    if (name.length < 3) {
        throw new Error("Name should be at least 3 characters long!");
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        throw new Error("Email already exists!");
    }

    // Tạo user trực tiếp thay vì gửi OTP
    const profile_image = `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`;
    const newUser = new User({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: role || 'user',
        profile_image,
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    return {
        success: true,
        message: "Registration successful!",
        token,
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            profile_image: newUser.profile_image,
            role: newUser.role,
            created_at: newUser.created_at,
        },
    };
};

const resendOTP = async (email) => {
    if (cooldownCache.get(email)) {
        throw new Error("Please wait 30 seconds before resending OTP!");
    }

    const cachedData = otpCache.get(email);
    if (!cachedData) {
        throw new Error("No pending registration found for this email!");
    }

    const newOTP = generateOTP();
    otpCache.set(email, { ...cachedData, otp: newOTP });

    cooldownCache.set(email, true);

    await sendOTP(email, newOTP, "Your OTP for Registration", "registration OTP");

    return { success: true, message: "New OTP sent to your email!" };
};

const verifyOTP = async (email, otp) => {
    const cachedData = otpCache.get(email);
    if (!cachedData) {
        throw new Error("OTP expired or invalid!");
    }

    if (cachedData.otp !== otp) {
        throw new Error("Invalid OTP!");
    }

    const profile_image = `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`;
    const user = new User({
        name: cachedData.name,
        email,
        password: cachedData.password,
        profile_image,
    });

    await user.save();

    otpCache.del(email);

    return { success: true, message: "Registration successful!" };
};

// ===== Forgot password with OTP =====
const requestPasswordOtpService = async (email) => {
    if (!email) {
        throw new Error("Email is required!");
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("No user found with this email!");
    }
    if (!user.password && user.google_id) {
        throw new Error("This account uses Google login. Please sign in with Google.");
    }
    const key = `pwdreset:${email}`;
    if (cooldownCache.get(key)) {
        throw new Error("Please wait 30 seconds before resending OTP!");
    }
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString(); // 6 digits
    otpCache.set(key, { otp }, 300); // 5 minutes
    cooldownCache.set(key, true);
    await sendOTP(email, otp, "Password Reset OTP", "password reset OTP");
    return { success: true, message: "OTP has been sent to your email." };
};

const verifyPasswordOtpService = async (email, otp) => {
    if (!email || !otp) {
        throw new Error("Email and OTP are required!");
    }
    const key = `pwdreset:${email}`;
    const data = otpCache.get(key);
    if (!data) {
        throw new Error("OTP expired or invalid!");
    }
    if (data.otp !== otp) {
        throw new Error("Invalid OTP!");
    }
    return { success: true, message: "OTP is valid." };
};

const resetPasswordWithOtpService = async (email, otp, newPassword, confirmPassword) => {
    if (!email || !otp || !newPassword || !confirmPassword) {
        throw new Error("All fields are required!");
    }
    if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match!");
    }
    if (newPassword.length < 6) {
        throw new Error("Password should be at least 6 characters long!");
    }
    const key = `pwdreset:${email}`;
    const data = otpCache.get(key);
    if (!data) {
        throw new Error("OTP expired or invalid!");
    }
    if (data.otp !== otp) {
        throw new Error("Invalid OTP!");
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("User not found!");
    }
    user.password = newPassword;
    await user.save();
    otpCache.del(key);
    return { success: true, message: "Password reset successful!" };
};

const forgotPasswordService = async (email) => {
    if (!email) {
        throw new Error("Email is required!");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("No user found with this email!");
    }

    // 🚫 Block Google-only accounts from using forgot password
    if (!user.password && user.google_id) {
        throw new Error("This account uses Google login. Please sign in with Google.");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    resetTokenCache.set(resetToken, { email });

    await sendResetLink(email, resetToken);

    return { success: true, message: "Password reset link sent to your email!" };
};


const resetPasswordService = async (email, token, newPassword, confirmPassword) => {
    if (!email || !token || !newPassword || !confirmPassword) {
        throw new Error("All fields are required!");
    }

    if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match!");
    }

    if (newPassword.length < 6) {
        throw new Error("Password should be at least 6 characters long!");
    }

    const cachedToken = resetTokenCache.get(token);
    if (!cachedToken || cachedToken.email !== email) {
        throw new Error("Invalid or expired reset token!");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("User not found!");
    }

    user.password = newPassword;
    await user.save();

    resetTokenCache.del(token);

    return { success: true, message: "Password reset successful!" };
};

// Google OAuth2 login service
const googleLoginService = async (idToken) => {
    if (!idToken) {
        throw new Error("Google ID token is required!");
    }

    try {
        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error("Invalid Google token payload!");
        }

        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            throw new Error("Email not found in Google token!");
        }

        // Check if user already exists
        let user = await User.findOne({
            $or: [
                { email },
                { google_id: googleId }
            ]
        });

        // Check if account is banned
        if (user && user.is_banned) {
            throw new Error("This account has been banned!");
        }

        // Check if account is deleted
        if (user && user.is_deleted) {
            throw new Error("This account has been deleted!");
        }

        if (!user) {
            // Create new user with Google data
            user = new User({
                name: name || 'Google User',
                fullName: name || 'Google User',
                email,
                google_id: googleId,
                profile_image: picture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`,
                role: 'user',
                // No password set for Google users
            });

            await user.save();
        } else if (!user.google_id) {
            // User exists with email but not linked to Google - link it
            user.google_id = googleId;
            if (picture) {
                user.profile_image = picture;
            }
            await user.save();
        }

        // Log login event
        user.login_history.push({
            login_time: new Date(),
            login_type: "google",
        });
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profile_image: user.profile_image,
                role: user.role,
                created_at: user.created_at,
            },
        };
    } catch (error) {
        console.error("Google login error:", error.message);
        throw error; // Rethrow the specific error to preserve the message
    }
};

// Facebook OAuth login service
const facebookLoginService = async (accessToken, userId) => {
    if (!accessToken || !userId) {
        throw new Error("Facebook access token and user ID are required!");
    }

    try {
        // Verify Facebook token by calling Facebook Graph API
        const axios = require('axios');
        const verifyResponse = await axios.get(`https://graph.facebook.com/v18.0/me`, {
            params: {
                access_token: accessToken,
                fields: 'id,name,email,picture'
            }
        });

        const { id: facebookId, email, name, picture } = verifyResponse.data;

        if (!email) {
            throw new Error("Email not found in Facebook profile!");
        }

        // Check if user already exists
        let user = await User.findOne({
            $or: [
                { email },
                { facebook_id: facebookId }
            ]
        });

        // Check if account is banned
        if (user && user.is_banned) {
            throw new Error("This account has been banned!");
        }

        // Check if account is deleted
        if (user && user.is_deleted) {
            throw new Error("This account has been deleted!");
        }

        if (!user) {
            // Create new user with Facebook data
            user = new User({
                name: name || 'Facebook User',
                fullName: name || 'Facebook User',
                email,
                facebook_id: facebookId,
                profile_image: picture?.data?.url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`,
                role: 'user',
                // No password set for Facebook users
            });

            await user.save();
        } else if (!user.facebook_id) {
            // User exists with email but not linked to Facebook - link it
            user.facebook_id = facebookId;
            if (picture?.data?.url) {
                user.profile_image = picture.data.url;
            }
            await user.save();
        }

        // Log login event
        user.login_history.push({
            login_time: new Date(),
            login_type: "facebook",
        });
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profile_image: user.profile_image,
                role: user.role,
                created_at: user.created_at,
            },
        };
    } catch (error) {
        console.error("Facebook login error:", error.message);
        throw error;
    }
};

const logoutService = async (token) => {
    if (!token) {
        throw new Error("Token is required!");
    }
    try {
        // Verify JWT with secret (checks signature, exp, etc.)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Basic sanity check (verify ensures structure, but confirm userId for safety)
        if (!decoded.userId) {
            throw new Error("Invalid token structure!");
        }
        const expiresAt = new Date(decoded.exp * 1000); // Convert Unix timestamp to Date

        // Insert into blacklist (unique will error if already blacklisted, but idempotent)
        await TokenBlacklist.create({ token, expiresAt });
        return { success: true, message: "Logged out successfully!" };
    } catch (error) {

        // Handle JWT-specific errors gracefully
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            throw new Error("Token is not valid");
        }

        if (error.code === 11000) { // Duplicate key error
            return { success: true, message: "Already logged out!" };
        }
        throw error;
    }
};

module.exports = {
    loginService,
    registerService,
    resendOTP,
    verifyOTP,
    forgotPasswordService,
    resetPasswordService,
    requestPasswordOtpService,
    verifyPasswordOtpService,
    resetPasswordWithOtpService,
    googleLoginService,
    facebookLoginService,
    logoutService
};
const { loginService, registerService, resendOTP, verifyOTP, forgotPasswordService, resetPasswordService, googleLoginService, facebookLoginService, logoutService } = require("../service/auth.service.js");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await loginService(email, password);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error in login controller:", error);
        res.status(400).json({ message: error.message });
    }
};

const register = async (req, res) => {
    try {
        // Support both 'name' and 'fullName' for backward compatibility
        const { name, fullName, email, password, role } = req.body;
        const userName = fullName || name; // Use fullName if provided, otherwise fallback to name
        
        if (!userName || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        
        const data = await registerService(userName, email, password, role);
        res.status(201).json(data);
    } catch (error) {
        console.error("Error in register controller:", error);
        res.status(400).json({ message: error.message });
    }
};

const verify = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const data = await verifyOTP(email, otp);
        res.status(201).json(data);
    } catch (error) {
        console.error("Error in verify OTP controller:", error);
        res.status(400).json({ message: error.message });
    }
};

const resend = async (req, res) => {
    try {
        const { email } = req.body;
        const data = await resendOTP(email);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error in resend OTP controller:", error);
        res.status(400).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const data = await forgotPasswordService(email);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error in forgot password controller:", error);
        res.status(400).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword, confirmPassword } = req.body;
        const data = await resetPasswordService(email, token, newPassword, confirmPassword);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error in reset password controller:", error);
        res.status(400).json({ message: error.message });
    }
};

// Google OAuth2 login controller
const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        const data = await googleLoginService(idToken);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error in Google login controller:", error);
        res.status(400).json({ message: error.message });
    }
};

// Facebook OAuth login controller
const facebookLogin = async (req, res) => {
    try {
        const { accessToken, userId } = req.body;
        const data = await facebookLoginService(accessToken, userId);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error in Facebook login controller:", error);
        res.status(400).json({ message: error.message });
    }
};

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        await logoutService(token);
        res.status(200).json({ success: true, message: "Logged out successfully!" });
    } catch (error) {
        console.error("Error in logout controller:", error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = { login, register, verify, resend, forgotPassword, resetPassword, googleLogin, facebookLogin, logout };
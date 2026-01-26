const express = require("express");
const { login, register, verify, resend, forgotPassword, resetPassword, requestPasswordOtp, verifyPasswordOtp, resetPasswordWithOtp, googleLogin, facebookLogin, logout } = require("../controller/auth.controller.js");

const router = express.Router();

// Route for handling user login
router.post("/login", login);
// Route for handling user registration
router.post("/register", register);
// Route for verifying OTP
router.post("/verify-otp", verify);
// Route for resending OTP
router.post("/resend-otp", resend);
// Route for initiating password reset
router.post("/forgot-password", forgotPassword);
// Route for resetting password
router.post("/reset-password", resetPassword);
// OTP-based forgot password
router.post("/forgot-password/request-otp", requestPasswordOtp);
router.post("/forgot-password/verify-otp", verifyPasswordOtp);
router.post("/forgot-password/reset-with-otp", resetPasswordWithOtp);
// Route for Google OAuth2 login
router.post("/google-login", googleLogin);
// Route for Facebook OAuth login
router.post("/facebook-login", facebookLogin);
// Route for handling user logout
router.post("/logout", logout);

module.exports = router;
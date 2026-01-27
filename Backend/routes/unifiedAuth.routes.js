const express = require('express');
const router = express.Router();
const unifiedAuthController = require('../controller/unifiedAuth.controller');

// UNIFIED LOGIN - Dùng chung cho admin, seller, customer
router.post('/login', unifiedAuthController.unifiedLogin);

module.exports = router;

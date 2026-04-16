const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/register', adminOnly,protect,register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;

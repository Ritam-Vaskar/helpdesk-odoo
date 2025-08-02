const { login, register } = require('../controllers/authController');
const express = require('express');
const router = express.Router();

// @route POST /api/auth/register
router.post('/register',  register );
router.post('/login',  login );
// @route POST /api/auth/login


module.exports = router;

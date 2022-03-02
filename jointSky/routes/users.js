const express = require('express');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const router = express.Router({ mergeParams: true });
const users = require('../controllers/users');

// Register and log in!
router.route('/register').get(users.registerPage).post(catchAsync(users.registerUser));

// Login Route
router
	.route('/login')
	.get(users.loginPage)
	.post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginMessage);

// Logout Route
router.get('/logout', users.logoutUser);

module.exports = router;

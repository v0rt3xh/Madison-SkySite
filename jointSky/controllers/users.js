const User = require('../models/user');
const passport = require('passport');

module.exports.registerPage = (req, res) => {
	res.render('users/register');
};

module.exports.registerUser = async (req, res) => {
	try {
		const { email, username, password } = req.body;
		const user = new User({ username, email });
		const registeredUser = await User.register(user, password);
		req.login(registeredUser, (err) => {
			if (err) {
				return next(err);
			}
			req.flash('success', 'Welcome to Joint Sky!');
			res.redirect('/sites');
		});
	} catch (err) {
		req.flash('error', err.message);
		res.redirect('/register');
	}
};

module.exports.loginPage = (req, res) => {
	res.render('users/login');
};

module.exports.loginMessage = (req, res) => {
	req.flash('success', 'Welcome back!');
	const redirectUrl = req.session.returnTo || 'sites';
	delete req.session.returnTo;
	res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
	req.logout();
	req.flash('success', 'You have successfully logged out, see you around!');
	res.redirect('/sites');
};

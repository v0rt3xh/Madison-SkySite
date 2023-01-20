const expressError = require('./utils/expressError');
const { siteSchema, reviewSchema } = require('./schema.js');
const obDesk = require('./models/site');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		req.flash('error', 'You must log in to perform this action.');
		return res.redirect('/login');
	}
	next();
};

module.exports.validateSites = (req, res, next) => {
	const { error } = siteSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new expressError(msg, 400);
	} else {
		next();
	}
};

module.exports.verifyAuthor = async (req, res, next) => {
	const { id } = req.params;
	const inqurySite = await obDesk.findById(id);
	if (!inqurySite) {
		req.flash('error', 'Sorry, we cannot find that sky deck!');
		return res.redirect('/sites');
	}
	if (!inqurySite.author.equals(req.user._id)) {
		req.flash('error', 'You do not have permission to edit it!');
		return res.redirect(`/sites/${id}`);
	}
	next();
};

module.exports.verifyReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params;
	const review = await Review.findById(reviewId);
	if (!review) {
		req.flash('error', 'Sorry, we cannot find that review!');
		return res.redirect(`/sites/${id}`);
	}
	if (!review.author.equals(req.user._id)) {
		req.flash('error', 'You do not have permission to edit it!');
		return res.redirect(`/sites/${id}`);
	}
	next();
};

module.exports.validateReviews = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new expressError(msg, 400);
	} else {
		next();
	}
};

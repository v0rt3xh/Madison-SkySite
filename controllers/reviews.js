const obDesk = require('../models/site');
const Review = require('../models/review');

module.exports.addReview = async (req, res) => {
	const { id } = req.params;
	const inqurySite = await obDesk.findById(id);
	const newReview = new Review(req.body.review);
	newReview.author = req.user._id;
	inqurySite.reviews.push(newReview);
	await newReview.save();
	await inqurySite.save();
	req.flash('success', 'Successfully created your reviews!');
	res.redirect(`/sites/${inqurySite._id}`);
};

module.exports.deleteReview = async (req, res) => {
	const { id, reviewId } = req.params;
	await obDesk.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	await Review.findByIdAndDelete(req.params.reviewId);
	req.flash('success', 'Successfully deleted your reviews');
	res.redirect(`/sites/${id}`);
};

const obDesk = require('../models/site');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const currentToken = process.env.MAPBOX_TOKEN;
const geocodingService = mbxGeocoding({ accessToken: currentToken });
const { cloudinary } = require('../cloudinary');
module.exports.index = async (req, res, next) => {
	const sites = await obDesk.find({});
	res.render('sites/index', { sites });
};

// Sunrise, sunset, stargaze
module.exports.sunriseIndex = async (req, res) => {
	const sites = await obDesk.find({ isSunrise: 'yes' });
	res.render('sites/sunrise', { sites });
};

module.exports.sunsetIndex = async (req, res) => {
	const sites = await obDesk.find({ isSunset: 'yes' });
	res.render('sites/sunset', { sites });
};

module.exports.stargazeIndex = async (req, res) => {
	const sites = await obDesk.find({ isStargaze: 'yes' });
	res.render('sites/stargaze', { sites });
};

module.exports.renderNewForm = async (req, res) => {
	res.render('sites/new');
};

module.exports.createNewSite = async (req, res, next) => {
	let customGeometry = null;
	let rawInput = false;
	if (req.body.rawCoordinate) {
		rawInput = true;
		const coordinateArray = req.body.site.location.split(',');
		const latitude = Number(coordinateArray[0]);
		const longitude = Number(coordinateArray[1]);
		customGeometry = {
			type: 'Point',
			coordinates: [ longitude, latitude ]
		};
	} else {
		const geoData = await geocodingService
			.forwardGeocode({
				query: req.body.site.location,
				limit: 1
			})
			.send();
		customGeometry = geoData.body.features[0].geometry;
	}
	req.flash('success', 'Successfully add your sites!');
	const site = new obDesk(req.body.site);
	// Add event selections:
	if (req.body.isSunrise) {
		site.isSunrise = 'yes';
	} else {
		site.isSunrise = undefined;
	}
	if (req.body.isSunset) {
		site.isSunset = 'yes';
	} else {
		site.isSunset = undefined;
	}
	if (req.body.isStar) {
		site.isStargaze = 'yes';
	} else {
		site.isStargaze = undefined;
	}
	// raw coordinates
	if (rawInput) {
		site.isRawLocation = 'yes';
	} else {
		site.isRawLocation = undefined;
	}
	site.geometry = customGeometry;
	site.author = req.user._id;
	site.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	await site.save();
	res.redirect(`/sites/${site._id}`);
};

module.exports.displaySite = async (req, res) => {
	const { id } = req.params;
	const inqurySite = await obDesk
		.findById(id)
		.populate({
			path: 'reviews',
			populate: {
				path: 'author'
			}
		})
		.populate('author');
	if (!inqurySite) {
		req.flash('error', 'Sorry, we cannot find that sky deck!');
		return res.redirect('/sites');
	}
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
	}
	res.render('sites/show', { inqurySite });
};

module.exports.renderEditForm = async (req, res, next) => {
	const { id } = req.params;
	const inqurySite = await obDesk.findById(id);
	res.render('sites/edit', { inqurySite });
};

module.exports.confirmEdition = async (req, res, next) => {
	const { id } = req.params;
	const siteTmp = await obDesk.findByIdAndUpdate(id, { ...req.body.site });
	const newImages = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	siteTmp.images.push(...newImages);
	let customGeometry = null;
	let rawInput = false;
	if (req.body.rawCoordinate) {
		rawInput = true;
		const coordinateArray = req.body.site.location.split(',');
		const latitude = Number(coordinateArray[0]);
		const longitude = Number(coordinateArray[1]);
		customGeometry = {
			type: 'Point',
			coordinates: [ longitude, latitude ]
		};
	} else {
		const geoData = await geocodingService
			.forwardGeocode({
				query: req.body.site.location,
				limit: 1
			})
			.send();
		customGeometry = geoData.body.features[0].geometry;
	}
	// Update those attributes we added (stargaze, rawCoordinate, etc)
	// Add event selections:
	if (req.body.isSunrise) {
		siteTmp.isSunrise = 'yes';
	} else {
		siteTmp.isSunrise = undefined;
	}
	if (req.body.isSunset) {
		siteTmp.isSunset = 'yes';
	} else {
		siteTmp.isSunset = undefined;
	}
	if (req.body.isStar) {
		siteTmp.isStargaze = 'yes';
	} else {
		siteTmp.isStargaze = undefined;
	}
	// raw coordinates
	if (rawInput) {
		siteTmp.isRawLocation = 'yes';
	} else {
		siteTmp.isRawLocation = undefined;
	}
	siteTmp.geometry = customGeometry;
	await siteTmp.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await siteTmp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
	}
	req.flash('success', 'Successfully updated your sites');
	res.redirect(`/sites/${siteTmp._id}`);
};

// Reminder, when delete a site, its corresponding image should be destroyed as well
module.exports.deleteSite = async (req, res) => {
	const { id } = req.params;
	await obDesk.findByIdAndDelete(id);
	req.flash('success', 'The sky deck has been removed!');
	res.redirect('/sites');
};

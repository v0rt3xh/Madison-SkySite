// Clean up our routes using express Router
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const sites = require('../controllers/sites');
// File Upload
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const { isLoggedIn, validateSites, verifyAuthor } = require('../middleware');

// index Route
router
	.route('/')
	.get(catchAsync(sites.index))
	.post(isLoggedIn, upload.array('image'), validateSites, catchAsync(sites.createNewSite));
//.post(isLoggedIn, validateSites, catchAsync(sites.createNewSite));

// Sunrise, sunset, stargaze route
router.get('/sunrise', catchAsync(sites.sunriseIndex));
router.get('/sunset', catchAsync(sites.sunsetIndex));
router.get('/stargaze', catchAsync(sites.stargazeIndex));
// new and create Route
router.get('/new', isLoggedIn, sites.renderNewForm);

// Edit and update

router
	.route('/:id')
	.get(catchAsync(sites.displaySite))
	.put(isLoggedIn, verifyAuthor, upload.array('image'), validateSites, catchAsync(sites.confirmEdition))
	.delete(isLoggedIn, verifyAuthor, catchAsync(sites.deleteSite));

router.get('/:id/edit', isLoggedIn, verifyAuthor, catchAsync(sites.renderEditForm));

module.exports = router;

// Load some env variables if needed
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');

const expressError = require('./utils/expressError');
const methodOverride = require('method-override');
// Authentication
const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/user');

const usersRoute = require('./routes/users');
const sitesRoute = require('./routes/sites');
const reviewsRoute = require('./routes/reviews');

// sanitization
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

mongoose.connect('mongodb://localhost:27017/ob-desk', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
const dbConnection = mongoose.connection;
dbConnection.on('error', console.error.bind(console, 'Connection Error'));
dbConnection.once('open', () => {
	console.log('Database Connected');
});
const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const sessionConfig = {
	name: 'Session_CJ',
	secret: 'GoodSecret!',
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true, // safety feature
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
};

app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());

const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com/',
	'https://api.tiles.mapbox.com/',
	'https://api.mapbox.com/',
	'https://kit.fontawesome.com/',
	'https://cdnjs.cloudflare.com/',
	'https://cdn.jsdelivr.net/',
	'https://ajax.googleapis.com'
];
const styleSrcUrls = [
	'https://kit-free.fontawesome.com/',
	'https://stackpath.bootstrapcdn.com/',
	'https://api.mapbox.com/',
	'https://api.tiles.mapbox.com/',
	'https://fonts.googleapis.com/',
	'https://use.fontawesome.com/',
	'https://cdn.jsdelivr.net/'
];
const connectSrcUrls = [
	'https://*.tiles.mapbox.com',
	'https://api.mapbox.com',
	'https://events.mapbox.com',
	'https://api.weather.gov',
	'https://ajax.googleapis.com',
	'https://weather.visualcrossing.com'
];
const fontSrcUrls = [];

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: [ "'self'", ...connectSrcUrls ],
			scriptSrc: [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
			styleSrc: [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
			workerSrc: [ "'self'", 'blob:' ],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				'https://res.cloudinary.com/jointsky/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
				'https://images.unsplash.com/'
			],
			fontSrc: [ "'self'", ...fontSrcUrls ],
			mediaSrc: [ 'https://res.cloudinary.com/jointsky/' ],
			childSrc: [ 'blob:' ],
			frameSrc: [ 'https://in-the-sky.org/' ]
		}
	})
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware for message displaying

app.use((req, res, next) => {
	// Current user helper
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

// Middleware for validations

const validateSites = (req, res, next) => {
	const { error } = siteSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new expressError(msg, 400);
	} else {
		next();
	}
};

const validateReviews = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new expressError(msg, 400);
	} else {
		next();
	}
};

// Check our passport pipeline

/*
app.get('/fakeUser', async (req, res) => {
	const user = new User({ email: 'ddus123@wisc.edu', username: 'Unknown Dude' });
	const newUser = await User.register(user, 'Happyhour');
	res.send(newUser);
});
*/

app.use('/', usersRoute);
app.use('/sites', sitesRoute);
app.use('/sites/:id/reviews', reviewsRoute);

app.get('/', (req, res) => {
	res.render('home');
});

// 404 Handler

app.all('*', (req, res, next) => {
	next(new expressError('404 Not Found', 404));
});

// A very basic error handler

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) {
		err.message = 'Something went wrong :-(';
	}
	res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
	console.log('Listening on port 3000');
});

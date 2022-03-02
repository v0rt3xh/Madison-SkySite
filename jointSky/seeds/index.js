const mongoose = require('mongoose');
const obDesk = require('../models/site');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelper');
mongoose.connect('mongodb://localhost:27017/ob-desk', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
const dbConnection = mongoose.connection;
dbConnection.on('error', console.error.bind(console, 'Connection Error'));
dbConnection.once('open', () => {
	console.log('Database Connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await obDesk.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 15) + 10;
		const ob = new obDesk({
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			images: [
				{
					url:
						'https://res.cloudinary.com/jointsky/image/upload/v1641267112/JointSky/mazmccsgwesvmhapnvlo.jpg',
					filename: 'JointSky/mazmccsgwesvmhapnvlo'
				},
				{
					url:
						'https://res.cloudinary.com/jointsky/image/upload/v1641260905/JointSky/mannbzsaq8dzu3ep4djv.jpg',
					filename: 'JointSky/mannbzsaq8dzu3ep4djv'
				}
			],
			geometry: { type: 'Point', coordinates: [ cities[random1000].longitude, cities[random1000].latitude ] },
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam animi obcaecati laborum fugiat voluptas, reiciendis vitae beatae nostrum accusantium incidunt nesciunt repudiandae, consectetur eos aperiam magnam dignissimos eius, minima voluptate!',
			price: price,
			author: '61d31becc15df385337ce74c'
		});
		await ob.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});

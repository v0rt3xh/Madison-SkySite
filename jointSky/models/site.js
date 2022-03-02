const mongoose = require('mongoose');
// Just a short cut
const Review = require('./review');
const Schema = mongoose.Schema;
// https://res.cloudinary.com/jointsky/image/upload/v1641267112/JointSky/mazmccsgwesvmhapnvlo.jpg
const imageSchema = new Schema({
	url: String,
	filename: String
});

const opts = { toJSON: { virtuals: true } };
imageSchema.virtual('thumbnail').get(function() {
	return this.url.replace('/upload', '/upload/w_200');
});

const siteSchema = new Schema(
	{
		title: String,
		images: [ imageSchema ],
		geometry: {
			type: {
				type: String,
				enum: [ 'Point' ],
				required: true
			},
			coordinates: {
				type: [ Number ],
				required: true
			}
		},
		isStargaze: String,
		isSunset: String,
		isSunrise: String,
		isRawLocation: String,
		price: Number,
		description: String,
		location: String,
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		},
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Review'
			}
		]
	},
	opts
);

siteSchema.virtual('properties.popUpMarkup').get(function() {
	return `<strong><a href="/sites/${this._id}">${this.title}</a><strong>`;
});

siteSchema.post('findOneAndDelete', async function(doc) {
	if (doc) {
		await Review.deleteMany({
			_id: {
				$in: doc.reviews
			}
		});
	}
});

module.exports = mongoose.model('Site', siteSchema);

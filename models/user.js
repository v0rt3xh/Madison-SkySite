const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	}
});

// Use the plugin
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);

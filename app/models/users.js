'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    id: String,
    username: String,
	twitter: {
		id: String
	},
	firstName: String,
	lastName: String
});

module.exports = mongoose.model('User', User);

'use strict';

require('dotenv').load();

var User = require('../models/users');
var TwitterStrategy = require('passport-twitter').Strategy;

module.exports = function(passport){
	passport.serializeUser(function (user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});
	
	passport.use(new TwitterStrategy({
		consumerKey: process.env.TWITTER_CONSUMER_KEY,
		consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
		callbackURL: process.env.APP_URL + 'auth/twitter/callback'
	}, 
	
	function(token, tokenSecret, profile, cb){
		User.findOne({'twitter.id': profile.id}, function(err, user){
			if (err){
				return cb(err, user);
			}
			if (user){
				return cb(null, user);
			}
			else{
				var newUser = new User();
				newUser.twitter.id = profile.id;
				newUser.username = profile.username;
				newUser.save(function (err) {
					if (err) {
						throw err;
					}
					return cb(null, newUser);
				});
			}
		});
	}));
};

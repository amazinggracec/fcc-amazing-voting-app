'use strict';

var path = process.cwd();
var Poll = require('../models/polls.js');
var Choice = require('../models/choices.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}
	
	function add_choices(id, options){
		options.forEach(function(option){
			Choice.find({"poll_id": id, "poll_option": option}, function(err, opt){
				if (err){
					throw err;
				}
				if (opt.length == 0 && option !== ""){
					var newChoice = new Choice();
					newChoice.poll_id = id;
					newChoice.poll_option = option;
					newChoice.votes = 0;
					newChoice.save();							
				}	
			});			
		});
	}
	
	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');

		});
	
	app.route('/login')
		.get(function (req, res) {
			/*res.sendFile(path + '/public/login.html');*/
			res.redirect("/auth/twitter");
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});
	
	app.route('/error')
		.get(function(req, res){
			res.sendFile(path + '/public/error.html');
		});
	
	app.route('/profile/info')
		.get(isLoggedIn, function(req, res){
			Poll.find({"user_id": req.user._id}, function(err, polls){
				var obj = {
					"twitter_id": req.user.twitter.id,
					"username": req.user.username,
					"polls": polls.length > 0? polls.map(function(poll){
						return {"_id": poll._id, "poll_name": poll.poll_name, "date_last": poll.date_last.toDateString()};
					}):[]
				};
			res.json(obj);
		})});
	
	app.get('/auth', function(req, res){
		if (req.user !== undefined){
			res.json({"authenticated": true, "username": req.user.username});
		}
		else{
			res.json({"authenticated": false, "username": ""});
		}
	});

	app.get('/auth/twitter', 
		passport.authenticate('twitter'));
	
	app.get('/auth/twitter/callback',
		passport.authenticate('twitter', {failureRedirect: '/login'}),
		function(req, res){
			res.redirect('/');
		});
		
	app.get('/polls', function(req, res){
		Poll.find(function(err, poll){
			if (err){
				throw err;
			}
			var polls = poll.map(function(poll){
				return {"_id": poll._id, "poll_name": poll.poll_name, "date_last": poll.date_last.toDateString()};
			});
			res.json(polls);
		});
	});
	
	app.route('/polls/add')
		.get(isLoggedIn, function(req, res){
			res.sendFile(path + '/public/polls/new_poll.html');
		});
	
	app.get('/polls/add/new', function(req, res){

		var poll_name = req.query.poll_name;
		
		Poll.find({"poll_name": poll_name}, function(err, poll){
			if (err){
				throw err;
			}	
			if (poll.length > 0){
				res.send("Poll already exists");
			}
			else{
				var newPoll = new Poll();
				newPoll.poll_name = req.query.poll_name;
				newPoll.user_id = req.user._id;
				newPoll.save();		
				
				add_choices(newPoll._id, req.query.option);
				res.redirect('/polls/' + newPoll._id);
			}
		});
	});

	app.get('/polls/result/:id', function(req, res){

		Poll.findById(req.params.id, function(err, poll){
			if (err){
				throw err;
			}

			var name = poll.poll_name;
			
			Choice.find({"poll_id": req.params.id}, function(err, choice){
				if (err){
					throw err;
				}
				var choices = choice.map(function(obj){
					return {"option": obj.poll_option, "vote": obj.votes, "id": obj._id, "poll_id": obj.poll_id};
				});
				
				var poll_info = {"name": name, choices};
				res.json(poll_info);
			});				
		});
	});
	
	app.get("/polls/delete/:id", function(req, res){
		if (req.user != undefined){
			Poll.find({"_id": req.params.id}, function(err, poll){
				if (err){
					throw err;
				}
				Choice.find({"poll_id": req.params.id}).remove(function(err){
					if (err){
						throw err;
					}
					if (poll[0].user_id == req.user._id){
						poll[0].remove(function(err){
							if (err){
								throw err;
							}
							res.redirect('/');
						});
					}
					else{
						res.send("You don't have the authorization to delete the poll");
					}					
				});
			});
		}
		else{
			res.send("You don't have the authorization to delete the poll");
		}
	});
	
	app.get('/polls/options/add/:id', function(req, res){
		add_choices(req.params.id, req.query.option);
		res.redirect('/polls/' + req.params.id);
	});
	
	app.get('/polls/:id/vote/', function(req, res){
		var poll_id = req.params.id;
		
		if (req.query.opts != "new_option"){
			Poll.findById(poll_id, function(err, poll){
				if (err){
					throw err;
				}
				var d = new Date();
				poll.date_last = d;
				poll.save();
				Choice.findOne({"poll_id": poll_id, "_id": req.query.opts}, function(err, option){
					if (err){
						throw err;
					}
					option.votes++;
					option.save(function(err){
						if (err){
							throw err;
						}
						res.redirect('/polls/' + req.params.id + "/results");
					});
				});		
			});
		}
		else{
			add_choices(poll_id, [req.query.option_name]);
			Poll.findById(poll_id, function(err, poll){
				if (err){
					throw err;
				}
				var d = new Date();
				poll.date_last = d;
				poll.save();
				Choice.findOne({"poll_id": poll_id, "poll_option": req.query.option_name}, function(err, option){
					if (err){
						throw err;
					}
					option.votes++;
					option.save(function(err){
						if (err){
							throw err;
						}
						res.redirect('/polls/' + req.params.id + "/results");
					});
				});		
			});
		}
	});
	
	app.get('/polls/:id/results', function(req, res){
		res.sendFile(path + "/public/polls/results.html");
	});
	
	app.get('/polls/:id', function(req, res){
		Poll.findById(req.params.id, function(err, poll){
			if (err){
				throw err;
			}

			if (poll != null || poll != undefined){
				res.sendFile(path + '/public/polls/view.html');
			}
			else{
				res.redirect('/error');
			}
		});
	});
};

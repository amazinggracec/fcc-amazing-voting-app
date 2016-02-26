var app = angular.module('voting-app', ["chart.js"]);

app.controller("MenuCtrl", function($scope, $http) {
	var path = "";
	for (var i = 0; i < window.location.pathname.split("/"); i++){
		path = path + "../";
	}
	$http.get(path + "/auth/").success(function(profile){
		$scope.auth = profile.authenticated;
		$scope.username = profile.username;
	});
});
app.controller('pollCtrl', function($scope, $http){
	$http.get("polls/").success(function(polls){
		$scope.polls = polls;
	});
});
app.controller("ProfileCtrl", function($scope, $http){
	$http.get("profile/info").success(function(info){
		$scope.polls = info.polls;
		$scope.username = info.username;
	});
});

app.controller('pollVoteCtrl', function($scope, $http){
	var id = window.location.pathname.replace("/polls/", "").replace("/results", "");
	$http.get("result/" + id).success(function(options){
		$scope.options = options.choices;
		$scope.poll_name = options.name;
		var tweet = options.name.length > 79? options.name.substring(0,79).replace(/(\s\S+$)$/gi, "...") : options.name;
		var opts = options.choices.map(function(obj){return obj.option;});
		var data = options.choices.map(function(obj){return obj.vote;});
		$("#twitter-share").html("<a href='https://twitter.com/share' class='twitter-share-button' data-size = 'large' data-text = 'Check this out: " + tweet + "'>Tweet</a>");
		window.twttr.widgets.load();
	});	
});

app.controller('pollResultsCtrl', function($scope, $http){
	var id = window.location.pathname.replace("/polls/", "").replace("/results", "");
	$http.get("../result/" + id).success(function(options){
		var tweet = options.name.length > 79? options.name.substring(0,79).replace(/(\s\S+$)$/gi, "...") : options.name;
		$("#twitter-share").html("<a href='https://twitter.com/share' class='twitter-share-button' data-size = 'large' data-text = 'Check this out: " + tweet + "'>Tweet</a>");
		$scope.poll_name = options.name;
		$scope.labels = options.choices.map(function(obj){return obj.option;});
		$scope.series = ['A'];
		$scope.data = options.choices.map(function(obj){return obj.vote;});
		window.twttr.widgets.load();
	});
});

window.twttr = (function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0],
	t = window.twttr || {};
	if (d.getElementById(id)) return t;
	js = d.createElement(s);
	js.id = id;
	js.src = "https://platform.twitter.com/widgets.js";
	fjs.parentNode.insertBefore(js, fjs);
	
	t._e = [];
	t.ready = function(f) {
	t._e.push(f);
	};
	
	return t;
}(document, "script", "twitter-wjs"));	
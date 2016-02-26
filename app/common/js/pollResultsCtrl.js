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

angular.module("voting-app", []).controller('pollResultsCtrl', function($scope, $http){

			
	var id = window.location.pathname.replace("/polls/", "");
	$http.get("result/" + id).success(function(options){
		$scope.options = options.choices;
		$scope.poll_name = options.name;
		var tweet = options.name.length > 79? options.name.substring(0,79).replace(/(\s\S+$)$/gi, "...") : options.name;
		var opts = options.choices.map(function(obj){return obj.option;});
		var data = options.choices.map(function(obj){return obj.vote;});
		$("#twitter-share").html("<a href='https://twitter.com/share' class='twitter-share-button' data-size = 'large' data-text = 'Check this out: " + tweet + "'>Tweet</a>");
		$scope.labels = opts;
		$scope.series = ['A'];
		$scope.data = data;
		window.twttr.widgets.load();
	});
});
angular.module('voting-app', []).controller("MenuCtrl", function($scope, $http) {
	var path = "";
	for (var i = 0; i < window.location.pathname.split("/"); i++){
		path = path + "../";
	}
	$http.get(path + "/auth/").success(function(profile){
		$scope.auth = profile.authenticated;
		$scope.username = profile.username;
	});
});


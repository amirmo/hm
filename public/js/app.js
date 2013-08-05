angular.module('hm', []).factory('Auth', ['$http', '$location', function($http, $location){
	return {
		login: function(u, p){
			$http({
				method: 'POST',
				data: {
					'username': u,
					'password': p
				},
				headers: {
					'Content-Type': 'application/json'
				},
				url: '/login'
			}).success(function(res) {
				console.log(res);
				$location.path('/home')
			});
		},
		register: function(u, p){
			$http({
				method: 'POST',
				data: {
					'username': u,
					'password': p
				},
				headers: {
					'Content-Type': 'application/json'
				},
				url: '/register'
			}).success(function(res) {
				console.log(res);
				$location.path('/home')
			});
		},
		logout: function(){
			$http.get('/logout').success(function(res) {
				console.log(res);	
				$location.path('/login')
			});
		}
	};
}]).config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/login', {templateUrl: 'partials/login.html', controller: LoginCtrl}).
      when('/home', {templateUrl: 'partials/index.html', controller: HomeCtrl}).
      // when('/register', {templateUrl: 'views/register.html', controller: RegisterCtrl}).
      otherwise({redirectTo: '/home'});
}]);
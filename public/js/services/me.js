define(['services/services'], function(services){

	services.factory('me', ['auth', '$location', '$rootScope', 'doobio', '$q', '$timeout'
		,function(auth, $location, $rootScope, doobio, $q, $timeout) {
			return function() {
				var delay = $q.defer();

				var promise = auth.authenticate();

				function success() {
					console.log('successed in authentication')
					var temp;
					var me = auth.me();

					me.then(function(data){
						$rootScope.username = data.username;
						if (!doobio.get($rootScope.username) && $rootScope.username) {
							doobio.create($rootScope.username);
						}
						temp = data;
						temp._patterns = {};
						temp._followers = {};
						temp._following = {};

						for (var i in temp.followers)
							temp._followers[temp.followers[i].username] = temp.followers[i];

						for (var i in temp.following)
							temp._following[temp.following[i].username] = temp.following[i];


						delay.resolve(temp);

					}, function(er, status){
						console.log('failed to fetch you')
						delay.reject('We couldn`t load your data from server! Please reload the page.');
					});

				}

				function failure () {
					console.log('Failed to authenticate you!')
					delay.reject('Failed to authenticate you!');
					$location.path('/login');
				}

				promise.then(success, failure);

				return delay.promise;
			}
		}]); 
});
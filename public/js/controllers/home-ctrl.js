define(['controllers/controllers', 'services/auth', 'services/socket', 'services/doob', 'uiBootstrap'], 
function(controllers){
	
	controllers.controller('home-ctrl', ['$scope', '$location', '$rootScope', 'auth', 'socket',
	'doobio', '$http', '$cookies', '$q',
		function ($scope, $location, $rootScope, auth, socket, doobio, $http, $cookies, $q) {

		$scope.$on('$routeChangeSuccess', function(next, current) { 
			// socket.connect();
		});

		$scope.navBar = 'invisible';
		$scope.isBroadcasting = false;
		$scope.invitationEmail = ''


		$scope.loadedSoundCategoryList = null;
		$scope.categoryListBindToSound = [];

		var f = {
			username: 1,
			activities: 1,
			followers: 1,
			following: 1,
			projects: 1,
			password: 1,
			soundPatterns: 1
		}

		var me = auth.me(f);

		me.then(function(data){
			$rootScope.username = data.username;
			if (!doobio.get($rootScope.username) && $rootScope.username) {
				doobio.create($rootScope.username);
			}
			$scope.me = data;
			console.log($scope.me)
			$scope.me._patterns = {};
			$scope.me._followers = $scope.me.followers;
			if ($scope.me._followers.length == 0)
				$scope.me._followers.push('You have no followers!');

			// for (var i in $scope.me.soundPatterns)
			// 	$scope.me._patterns[$scope.me.soundPatterns[i].id] = $scope.me.soundPatterns[i];

			$scope.loadDoobInstance(function(error, doob){
				if (error) return console.log(error);

				var promise = auth.getSoundPatterns();

				promise.then(function(soundPatterns){

					// console.log(soundPatterns)
					
					for (var i in soundPatterns) {

						$scope.me._patterns[soundPatterns[i]._id] = soundPatterns[i];

						for (var j in soundPatterns[i].content.tracks)

							new doobio.instances[$rootScope.username].audio.Sound({
								name: soundPatterns[i].content.tracks[j].name,
								url: soundPatterns[i].content.tracks[j].url
							});

						new doobio.instances[$rootScope.username].sequencer.SoundPattern({
							name: soundPatterns[i].name,
							id: soundPatterns[i]._id, 
							tracks: soundPatterns[i].content.tracks,
							effects: soundPatterns[i].content.effects
						});
					}
				}, function(error){

				});

			});

		}, function(er){
			console.log(er)
		})

		$scope.authenticate = function(callback) {

			if (!$rootScope.username) {

				var promise = auth.authenticate();

				promise.then(function(){
					if (callback) callback(null, $rootScope.username);
					$scope.navBar = 'visible';
					
					// $scope.doob = doobio;
					// $cookies.doob = $cookies.doob || {};
					// $cookies.doob[$rootScope.username] = doobio.get($rootScope.username).assetsToJSON;
				}, function(){
					$location.path('/login');
					if (callback) callback('Authentication failed.');

				});	
			}
			else if (callback) callback(null, $rootScope.username);
		};

		$scope.authenticate();

		$scope.loadDoobInstance = function(callback) {
			
			$scope.authenticate(function(error, username){
				// $scope.$broadcast('doob');
				
				$scope.doob = doobio;

				if (error) {
					console.log(error);
					if (callback) callback(error);
				}
				else if (!doobio.get(username)) {
					doobio.create(username);
					if (callback) callback(null, doobio.get(username));
					$scope.$broadcast('doob:ready', $scope.doob);
				}
				else if (doobio.get(username)) {
					if (callback) callback(null, doobio.get(username));
					$scope.$broadcast('doob:ready', $scope.doob);
				}
				else if (callback) callback('There`s a problem loadding doob.io instance!');
			});
		};

		$scope.loadDoobInstance();

		$scope.broadcast = function() {
			$scope.isBroadcasting = !$scope.isBroadcasting;
			doobio.toggleBroadcast($rootScope.username);
		};

		$scope.sendInvite = function(ev) {
			console.log('$scope.invitationEmail')
			console.log($scope.invitationEmail)	
			// if (ev.which == 13) console.log($scope.invitationEmail)
		}

		
		// Check if the user's logged in
		// var promise = auth.authenticate();

		// promise.then(function(){
		// 	if (!doobio.get($rootScope.username) && $rootScope.username) {
		// 		doobio.create($rootScope.username);
		// 	}
		// 	$scope.doob = doobio;
		// 	// $cookies.doob = $cookies.doob || {};
		// 	// $cookies.doob[$rootScope.username] = doobio.get($rootScope.username).assetsToJSON;
		// }, function(){
		// 	$location.path('/login');
		// });

		

		$scope.showDoobios = function() {
			// socket.emit('user:subscribe', {
			// 	username: $rootScope.username,
			// 	to: 'poi'
			// });
			console.log(doobio.instances[$rootScope.username].env)
			
		}

		$scope.now = function() {
			// return new Date().getTime();
			return 1378509094598;
		}



		var kick, hat, clap, kickHat, kickHat2, rev;

		$scope.navBarClass = function(visibility) {

			if (visibility) return visibility;

			if ($rootScope.username) return 'visible';

			return 'invisible';

			// return 'visible';
		}

		// scope variables.
		$scope.subscriberCount = 0;
		$scope.subscribers = [];

		$scope.logout = function(){
			auth.logout(this);
			$scope.isBroadcasting = false;
		}
		
		$scope.unsubsc = function(){
			// socket.emit('user:unsubscribe', {
			// 	username: $rootScope.username,
			// 	from: 'amir'
			// });
			$http.post('/me').success(function(data){
				console.log(data)
			}).error(function(status){
				console.log('shit $s', status)
			})
		}

		// (function(){
		$scope.loadSoundCategoryList = function() {

			var delay = $q.defer()

			if ($scope.loadedSoundCategoryList && $scope.categoryListBindToSound) {
				delay.resolve([$scope.loadedSoundCategoryList, $scope.categoryListBindToSound]);
			}
			else {

				$http.get('/sounds').success(function(data, status) {

					$scope.loadedSoundCategoryList = [];
					
					for (var i in data) {
						if (data[i].category != 'impulses') {
							$scope.loadedSoundCategoryList.push(data[i].category);
							$scope.categoryListBindToSound[i] = [];
							// scope.categoryListBindToSound[data[i].category] = data[i].sounds;
							// scope.categoryListBindToSound.push(data[i].sounds.name);
						// scope.loadedList[i] = true;
						for (var j = 0; j < data[i].sounds.length; ++j)
							$scope.categoryListBindToSound[i].push(data[i].sounds[j]);
						}
					}

					// console.log($scope.categoryListBindToSound)
					delay.resolve([$scope.loadedSoundCategoryList, $scope.categoryListBindToSound]);
				}).error(function(data, status) {
					console.log(data);
					delay.reject();
				});					
			}


			return delay.promise;
			// return $scope.loadedSoundCategoryList;
		}
		// }());

		// $scope.loadSoundCategoryList()

		$scope.kickHat = function() {
	    	  	kickHat = doobio.sequencer($rootScope.username).SoundPattern({
		    		tracks: {
		    			'Kick': {
		    				name: 'Kick',
		    				dummyName: '___kick',
		    				pattern: [1,5,9,13],
		    				url: doobio.instances[$rootScope.username].env.assets['Kick'].url
		    			},
		    			'Hat': {
		    				name: 'Hat',
		    				dummyName: '___hat',
		    				pattern: [2,3,7,11,12,16],
		    				url: doobio.instances[$rootScope.username].env.assets['Hat'].url
		    			},
		    			'Clap': {
		    				name: 'Clap',
		    				dummyName: '___clap',
		    				pattern: [7, 15],
		    				url: doobio.instances[$rootScope.username].env.assets['Hat'].url
		    			}
		    		}, tempo: 120, steps: 32//, route: {destination: doob.g}
		    	}, true);
		}

		$scope.add = function(){

			hat = new doobio.audio($rootScope.username).Sound({name:'Hat', url: '/public/wav/hat.wav'});
    		kick = new doobio.audio($rootScope.username).Sound({name:'Kick', url: '/public/wav/kick.wav'}),
    		clap = new doobio.audio($rootScope.username).Sound({name:'Clap', url: '/public/wav/clap.wav'});
    		// clap2 = new doobio.audio($rootScope.username).Sound({url: '/public/wav/clap.wav'});
			
	   //  	setTimeout(function(){
		  //   	kickHat = sequencer('amir').SoundPattern({
		  //   		sounds: ['Kick', 'Hat', 'Clap'],
		  //   		soundPatterns: {
		  //   			'Kick': [1,5,9,13],
		  //   			'Hat': [2,3,7,11,12,16],
		  //   			'Clap': [7, 15]
		  //   		}, tempo: 120, steps: 16, bars: 5//, route: {destination: doob.g}
		  //   	}, function(){
		  //   		$rootScope.$apply();
		  //   	});
		  //   	// console.log(sequencer('amir').SoundPattern);

				// effects('amir').loadReverbImpulse({
				// 	name: 'Five Columns Long',
				// 	url: '/public/wav/impulses/Five_Columns_Long.wav',
				// 	callback: function(buffer) {
				// 		rev = new effects('amir').Reverb({
				// 			buffer: buffer, 
				// 			// destination: doobio.get('amir').env.masterGain,
				// 			impulse: 'Five Columns Long'
				// 		});
				// 		kickHat.graph.addSend(rev);
			 //    		console.log(kickHat.graph);
			 //    		console.log(rev);
			 //    		// console.log();
				// 		// kickHat.io.graphs[2].addSend(rev);
				// 	}
				// });

	   //  	}, 2000);
	    	
	    	

		}

		// rev = new effects.Biquad({type: 2});

		$scope.addEffect = function(){

			doobio.effects($rootScope.username).loadReverbImpulse({
					name: 'Five Columns Long',
					url: '/public/wav/impulses/Five_Columns_Long.wav',
					callback: function(buffer) {
						rev = new doobio.effects($rootScope.username).Reverb({
							buffer: buffer, 
							// destination: doobio.get('amir').env.masterGain,
							impulse: 'Five Columns Long'
						});
						console.log(rev.toJSON())
						clap.graph.addSend(rev);
			    		// console.log(kickHat.graph);
			    		// console.log(rev);
			    		// console.log();
						// kickHat.io.graphs[2].addSend(rev);
					}
				});
		}

		$scope.me = function() {
			console.log(hat)
			// hat.play()
			// console.log(kickHat);
			// kickHat.io.graphs[2].addSend(rev);
			// socket.emit('test')
			kickHat.play();
		}

		$scope.remove = function(){
			kickHat2 = doobio.sequencer($rootScope.username).SoundPattern({
		    		sounds: ['Kick', 'Hat', 'Clap'],
		    		soundPatterns: {
		    			'Kick': [1,5,9,13],
		    			'Hat': [2,3,7,11,12,16],
		    			'Clap': [7, 15]
		    		}, tempo: 130, steps: 16, bars: 5//, route: {destination: doob.g}
		    	});
		}

		$scope.publishdoob = function(){
			doobio.broadcast('broadcast', $rootScope.username);

			// socket.emit('user:broadcast', obj);
		}
		
		$scope.subsc = function(){

			kickHat.play()
		}

		// check is we are on the right scope, since many ng's create scopes and as a result,
		// events will be triggered multiple times...
		if ($scope.$parent == $rootScope) {
			
			// console.log('$scope.$parent == $rootScope')

		// real time events
			// socket.on('new:subscriber', function(data){
			// 	if ($scope.subscribers.indexOf(data.username) == -1) {
			// 		$scope.subscriberCount++;
			// 		$scope.subscribers.push(data.username);
			// 	}
			// });

			// socket.on('new:unsubscribe', function(data){
			// 	var index = $scope.subscribers.indexOf(data.username);
			// 	if (index != -1) {
			// 		$scope.subscriberCount--;
			// 		$scope.subscribers.splice(index, 1);	
			// 	}
			// });

			// socket.on('user:broadcast', function(data){
			// 	console.log('WOW! new broadcaster: %s', data.username);
			// 	console.log(data);
			// });


		}
	}]);
});
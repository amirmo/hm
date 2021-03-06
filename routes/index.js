module.exports = function(models, sessionMaxAge, async){

	var index = function(req, res, next){
		console.log(req.headers)
		res.set({
			'Content-type': 'text/html; charset=utf-8'
		});
		req.session._idz = 'session';
		res.cookie('cooki_id', 'cookie', { maxAge: 60*60*1000, httpOnly: true });
		res.sendfile('views/index.html');

		// res.render('sendinvite', {from: 'Amir', to: 'Ghasem'});
	};

	var font = function(req, res, next){
		var ext = req.params[0].split(".")[1];

		switch (ext) {
			case 'eot': 
				res.set({'Content-type': 'application/vnd.ms-fontobject'})
				break;

			// case 'woff': 
			// 	res.set({'Content-type': 'application/x-font-woff'})
			// 	break;

			// case 'ttf': 
			// 	res.set({'Content-type': 'application/x-font-ttf'})
			// 	break;

			// case 'svg': 
			// 	res.set({'Content-type': 'application/svg+xml'})
			// 	break;
		}

		res.sendfile('public/font/'+req.params[0]);
	};

	var public = function(req, res, next){
		res.sendfile('public/'+req.params[0]);
	};

	var template = function(req, res, next){
		res.sendfile('partials/template/'+req.params[0]);
	};

	var partials = function(req, res, next){
		res.sendfile('partials/'+req.params[0]);
	};

	var ping = function(req, res, next){

		if (req.query.authenticate) {
			
			if (req.session && req.session.uid && req.session.username) {

				req.session.cookie.expires = new Date(Date.now() + sessionMaxAge);
				req.session.cookie.maxAge = sessionMaxAge;
				
			}

			return res.send(200);
		}
		
		if (req.session && req.session.uid && req.session.username) {

			req.session.cookie.expires = new Date(Date.now() + sessionMaxAge);
			req.session.cookie.maxAge = sessionMaxAge;
			
			return res.send(200);
		}
		
		return res.send(202);
	};

	var destroy = function(req, res, next){
		
		if (req.session) {

			req.session.destroy(function(error){
				if (error) console.log(error);
				return res.send(200);
			});
			
		}
		
		// 
		else return res.send(400);
	};

	var sounds = function(req, res, next){
		
		models.index.Sound.find({}, function(error, results){
			
			if (error) return res.send(500);

			var r = ")]}',\n" + JSON.stringify(results);
			res.send(r);
		});
	};

	var search = function(req, res, next) {
		if (!validateSession(req)) return res.send(401);
		var q = req.query.q;
		
		q = "^.*" + q + ".*$"
		
		async.parallel([
			function(callback) { 
				models.User.User.find({usernameLowerCase: { $regex: q, $options: 'i' }, 
					usernameLowerCase: {$ne: req.session.username.toLowerCase()} }, 
					{username: 1}, function(error, r) {
						callback(error, r);
					});
			},
			function(callback) {
				models.projects.SoundPattern.find({active: true,
					name: { $regex: q, $options: 'i' }}, 
					{name: 1, _id: 1, username: 1}, function(error, r) {
						callback(error, r);
					});
			}
		], function(error, results){
			if (error) return res.send(500);
			var r = ")]}',\n" + JSON.stringify(results);
			return res.send(r);
		});

		// models
		// setTimeout(function(){
		// 	return res.send([]);
		// 	return res.send(")]}',\n" + JSON.stringify([
		// 		[
		// 			{
		// 			username: 'KooKoo'
		// 				},{
		// 				username: 'popoooo'
		// 				}
		// 		],
		// 		[
		// 			{
		// 				name: 'dicsooo',
		// 				id: 'sjsjbsbd'
		// 				}, {
		// 				name: 'shabaaash',
		// 				id: 'smnkjsjsdjss'
		// 			}
		// 		]
		// 	]));
			
		// }, 5000);
	};

	var id = function(req, res, next) {
		
		if (!validateSession(req)) return res.send(401);

		if (req.query.count) {

			var c = parseInt(req.query.count);

			if (isNaN(c)) return res.send(400);

			var r = ")]}',\n", ids = [];
			
			for (var i = 0; i < c; ++i)
				ids.push(models.User.objectId());

			return res.send(r + JSON.stringify(ids));
			 
		}
		
		return res.send(models.User.objectId());
	};

	function validateSession(req) {
		if (!req.session || !req.session.uid || !req.session.username) {
			return false;
		}
		return true;
	};

	return {
		index: index,
		font: font,
		public: public,
		template: template,
		partials: partials,
		ping: ping,
		destroy: destroy,
		sounds: sounds,
		search: search,
		id: id
	}
};

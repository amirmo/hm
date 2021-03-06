module.exports = function(routes, app){

	app.get('/public/font/*', routes.index.font);

	app.get('/public/*', routes.index.public);

	app.get('/template/*', routes.index.template);

	app.get('/partials/*', routes.index.partials);

	app.get('/ping', routes.index.ping);

	app.get('/search', routes.index.search);

	app.get('/sounds', routes.index.sounds);

	app.get('/user/:name', routes.user.getUser);

	app.get('/user/:name/audio', routes.user.getAudio);

	app.get('/pattern/:user/:id', routes.user.pattern);

	app.get('/pattern/:user', routes.user.patterns);
	
	app.get('/me', routes.user.me);

	app.get('/destroy', routes.index.destroy);

	app.get('/id', routes.index.id);

	app.get('/:user/:number', routes.audio.audioFileLink);

	app.get('/settings', routes.user.getSettings);

	app.post('/logout', routes.user.logout);

	app.post('/invite', routes.user.invite);

	app.post('/login', routes.user.login);

	app.post('/register', routes.user.register);

	app.post('/project', routes.project.index);

	app.post('/upload', routes.audio.upload);

	app.post('/test', routes.audio.test);

	app.put('/user/follow', routes.user.follow);

	app.put('/settings', routes.user.putSettings);

	app.put('/changepassword', routes.user.changepassword);

	app.put('/changeemail', routes.user.changeEmail);

	app.put('/settings', routes.user.putSettings);

	app.put('/upload', routes.audio.newAudioFile);

	app.delete('/audio/:id', routes.audio.deleteAudio);

	app.get('/', routes.index.index);
	
};
define(['lib/io', 'lib/audio'], function(_io, _audio){

	return function(doob) {
		var io = _io(doob);
		var audio = _audio(doob);
		return (function invocation(doob){

			var SoundPattern = function (config, callback) {

				config = config || {};
				config.name = config.name && !soundPatterns[config.name] ? config.name : 
					doob.uniqueNames.SoundPattern;	

				var thisPatternGraph;			
				var properties = {
					name: {
						value: config.name,
						enumerable: true, writable: false, configurable: false
					}, 
					playStartTime: {
						value: config.playStartTime || doob.context.currentTime,
						enumerable: true, writable: true, configurable: false					
					}, 
					tempo: { 
						value: config.tempo || doob.tempo,
						enumerable: true, writable: true, configurable: false					
					}, 
					sixteenthNoteTime: { 
						value: config.sixteenthNoteTime || (function(){
							var tempo = config.tempo || tempo;
							return (60 / tempo / 1);
						}()),
						enumerable: true, writable: true, configurable: false					
					}, eightthNoteTime: { 
						value: config.eightthNoteTime || (function(){
							var tempo = config.tempo || tempo;
							return (60 / tempo / 2);
						}()),
						enumerable: true, writable: true, configurable: false					
					}, 
					fourthNoteTime: { 
						value: config.fourthNoteTime || (function(){
							var tempo = config.tempo || tempo;
							return (60 / tempo / 4);
						}()),
						enumerable: true, writable: true, configurable: false					
					}, 
					secondNoteTime: { 
						value: config.secondNoteTime || (function(){
							var tempo = config.tempo || tempo;
							return (60 / tempo / 8);
						}()),
						enumerable: true, writable: true, configurable: false					
					}, 
					soundPatterns: { 
						value: config.soundPatterns || [],
						enumerable: true, writable: true, configurable: false					
					}, 
					soundPatternSources: { 
						value: config.soundPatternSources || {},
						enumerable: true, writable: true, configurable: false					
					}, 
					soundSources: { 
						value: config.soundSources || [],
						enumerable: true, writable: true, configurable: false					
					}, 
					patternSources: { 
						value: config.patternSources || [],
						enumerable: true, writable: true, configurable: false					
					}, 
					playbackState: { 
						value: config.playbackState || 0,
						enumerable: true, writable: true, configurable: false					
					}, 
					bars: { 
						value: config.bars || 1,
						enumerable: true, writable: true, configurable: false					
					}, 
					steps: { 
						value: config.steps || 16,
						enumerable: true, writable: true, configurable: false					
					}, 
					barTime: {
						value: config.barTime || (function(){
							fourth = config.fourthNoteTime || (60 / (config.tempo || tempo) / 4);
							steps = config.steps || 16;
							return fourth * steps;
						}()),
						enumerable: true, writable: true, configurable: false					
					}, 
					scheduledBars: { 
						value: config.scheduledBars || 1,
						enumerable: true, writable: true, configurable: false					
					}, 
					gain: {
						value: config.gain || new io.Gain({name: config.name+'_gain'}),
						enumerable: true, writable: true, configurable: false
					}, 
					graph: {
						value: null,
						enumerable: true, writable: true, configurable: false
					}, 
					cleanPlayedSources: { 
						value: function(){
							this.patternSources = this.patternSources.filter(function(source) {
								return source.playbackState != 3;
							});
						}, enumerable: false, writable: false, configurable: false					
					}, 
					lastScheduledSound: {
						value: config.lastScheduledSound,
						enumerable: true, writable: true, configurable: false
					}, 
					io: {
						value: null, 
						enumerable: false, writable: true, configurable: false	
					},
					sounds: {
						value: config.sounds, 
						enumerable: false, writable: true, configurable: false	
					},
					// sounds that exist in this pattern, correct sound copies.
					patternSounds: {
						value: [], 
						enumerable: false, writable: true, configurable: false	
					},
					// track names.
					tracks: {
						value: {}, 
						enumerable: false, writable: true, configurable: false	
					}, 
					intvl: {
						value: null, 
						enumerable: false, writable: true, configurable: false	
					}

				};	
				properties.graph.value = new io.Graph({
					source: properties.gain.value, 
					connectable: properties.gain.value.connectable, 
					destination: doob.masterGain,
					node: config.name
				});

				// console.log(properties.gain.value.connectable)

				for (var i in properties.sounds.value) {

					// craete new sounds for this pattern machine based on sounds provided by the 
					// user.
					var sound = audio.duplicateSound(properties.sounds.value[i], 
						properties.sounds.value[i] + '_' + config.name);
					// connect the sound to this graph.
					sound.graph.destination = properties.gain.value.connectable;
					sound.graph.connect();
					properties.patternSounds.value.push(sound.name);

					// add new sound names to the soundPatterns and tracks objects, add them 
					// to tracks remove old names...
					if (properties.sounds.value[i] in properties.soundPatterns.value) {
						properties.soundPatterns.value[sound.name] = 
						properties.soundPatterns.value[properties.sounds.value[i]];

						delete properties.soundPatterns.value[properties.sounds.value[i]];
					}

					properties.tracks.value[properties.sounds.value[i]] = {
						name: properties.sounds.value[i],
						dummyName: sound.name,
						pattern: properties.soundPatterns.value[sound.name]
					};
				}

				config.sounds = properties.patternSounds.value;



				// console.log(doob.assets);

				// Invoked as a constructor.
				// if (this instanceof SoundPattern) {
					var o = Object.create(SoundPattern.prototype, properties); 

					// Object.defineProperties(this, properties);
					// config.graph ? _createRoutings(this, config.graph) : _createRoutings(this);
					o.io = (function(self){
						var soundObjects = {};
						var graphs = [];
						if (config.sounds && 
							Object.prototype.toString.call(config.sounds) === '[object Array]') {
							for (var i = 0, l = config.sounds.length; i < l; ++i) {
								if (!doob.assets[config.sounds[i]]) {
									soundObjects = {};
									throw 'The sound: ' + config.sounds[i] + 
									' does not exist. Did you forget to create it first?';
								}
								var graph = io.Graph({

									source: new io.Gain({name: self.name+'_'+config.sounds[i]+'_gain'}),
									//send: self.graph,
									destination: doob.assets[config.sounds[i]].graph.source,
									node: config.name
								});
								// graph.insert(self.graph);
								graph.addSend(self.graph);
								graph.connect();
								graphs.push(graph);
								soundObjects[config.sounds[i]] = {
									sound: doob.assets[config.sounds[i]], 
									graph: graph
								};
							}
						}
						return {
							get sounds() {return soundObjects},
							set sounds(s) {
								if (Object.prototype.toString.call(s) !== '[object Array]')
									throw 'Sounds can only be set to an array of sounds.';
								for (var i = 0, l = s.length; i < l; ++i) {
									if (!doob.assets[s[i]]) {
										soundObjects = {};
										throw 'The sound: ' + config.sounds[i] + 
										' does not exist. Did you forget to create it first?';
									}
									console.log('yes');

									var graph = io.Graph({
										source: new io.Gain({name: self.name+'_'+config.sounds[i]+'_gain'}),
										//send: self.graph,
										destination: doob.assets[config.sounds[i]].graph.source,
										node: self.name
									});
									graph.insert(self.graph)
									graph.connect();
									graphs.push(graph);
									soundObjects[config.sounds[i]] = {sound: doob.assets[config.sounds[i]], 
										graph: graph
									};							
								}
							},
							graphs: graphs
						}
					}(o));
					
					doob.soundPatterns[o.name] = o;
					doob.assets[o.name] = o;
					doob.assetsToJSON[o.name] = o.toJSON();
					if (callback) callback(o);
					return o;

				// {// }
								// Invoked as a factory function.
								// else {
								// 	var o = Object.create(SoundPattern.prototype, properties); 
								// 	config.graph ? _createRoutings(o, config.graph) : _createRoutings(o);
								// 	console.log(o);
								// 	o.io = (function(){
								// 		var soundObjects = {};
								// 		var graphs = [];
								// 		if (config.sounds && 
								// 			Object.prototype.toString.call(config.sounds) === '[object Array]') {
								// 			for (var i = 0, l = config.sounds.length; i < l; ++i) {
								// 				if (!doob.assets[config.sounds[i]]) {
								// 					soundObjects = {};
								// 					return {'SoundPattern' : 'The sound: ' + config.sounds[i] + 
								// 					' does not exist. Did you forget to create it first?'};
								// 				}
								// 				console.log('yes');
								// 				var graph = io.Graph({
								// 					source: new io.Gain({name: self.name+'_'+config.sounds[i]+'_gain'}),
								// 					// send: o.graph,
								// 					destination: doob.assets[config.sounds[i]].graph.source,
								// 					node: config.name
								// 				});
								// 				graph.connect();
								// 				graphs.push(graph);
								// 				soundObjects[config.sounds[i]] = {sound: doob.assets[config.sounds[i]], 
								// 					graph: graph
								// 				};
								// 			}
								// 		}
								// 		return {
								// 			get sounds() {return soundObjects},
								// 			set sounds(s) {
								// 				if (Object.prototype.toString.call(s) !== '[object Array]')
								// 					return;
								// 				for (var i = 0, l = s.length; i < l; ++i) {
								// 					if (!doob.assets[s[i]]) {
								// 						soundObjects = {};
								// 						throw {'doob.context.destination' : 'The sound: ' + s[i] + 
								// 						' does not exist. Did you forget to create it first?'};
								// 					}
								// 					var graph = io.Graph({
								// 						source: new io.Gain({name: self.name+'_'+config.sounds[i]+'_gain'}),
								// 						node: self.name,
								// 						// send: o.graph,
								// 						destination: doob.assets[config.sounds[i]].graph.source
								// 					});
								// 					graph.connect();
								// 					graphs.push(graph);
								// 					soundObjects[config.sounds[i]] = {sound: doob.assets[config.sounds[i]], 
								// 						graph: graph
								// 					};							
								// 				}
								// 			},
								// 			graphs: graphs
								// 		}
								// 	}());
								// 	doob.soundPatterns.push(o.name);
								// 	doob.assets[o.name] = o;
								// 	return o;
								// }}

				// function _createRoutings(self, graph) {

				// 	if (graph) {
				// 		self.graph = graph;
				// 	} else {
				// 		var dest = (config && config.graph && config.graph.destination) ? 
				// 		config.graph.destination : doob.masterGain;
				// 		self.graph = new io.Graph({
				// 			source: properties.gain.value, 
				// 			connectable: properties.gain.value.connectable, 
				// 			destination: dest,
				// 			node: config.name
				// 		}).connect();						
				// 	}
				// 	// console.log(self);
				// // TODO: Insert this graph to all sound's graph.
				// };
			};
			SoundPattern.prototype.play = function(mode) {
				if (this.playbackState == 1) return;
				if (mode) 
					this.enQ(true);
				else
					this.enQ();
			};
			SoundPattern.prototype.toggleNote = function(note) {
				// bad note object. good format of the note: {sound: soundName, note: noteNumber}
				if (!note || typeof note !== 'object') return;

				// the note to be toggled does not belong to a sound in this pattern
				if (!this.tracks[note.soundName]) return;

				// invalid note number
				if (note.noteNumber > this.steps || note.noteNumber < 1) return;

				this.tracks[note.soundName].dummyName

				console.log(this);
			}
			SoundPattern.prototype.changeSoundPattern = function(change){
				if (!change || typeof change !== 'object') return;
				for (var sound in change) {
					if (!this.soundPatterns[sound] || change[sound] < 1 
						|| change[sound] >= this.steps) continue;
					// If the change is deletion (the sound index exists on the sound pattern array)
					if (change[sound] in this.soundPatterns[sound]) {
						// If it's a change on the fly (we are in play state), remove scheduled sources first.
						if (this.playbackState) {
							if (this.soundPatternSources[sound] && 
								this.soundPatternSources[sound][change[sound]]
								&& this.soundPatternSources[sound][change[sound]].stop)
								this.soundPatternSources[sound][change[sound]].stop(0);
						}
						this.soundPatterns[sound].splice(this.soundPatterns[sound].indexOf(change[sound]), 1)
					}
					else {
						for (var i = 0; i < this.bars; ++i) {
							var beginIndex = this.lastScheduledSound - this.barTime; 
							var scheduled = (i * this.barTime) + (change[sound] * this.fourthNoteTime) +
							 beginIndex;
							 var source = doob.context.createBufferSource();
							 source.buffer = doob.assets[sound].buffer;
							 source.connect(gain);
							if (scheduled > this.lastScheduledSound) return;
							source.start(scheduled);
							this.patternSources.push(source);
							this.soundPatternSources[sound][change[sound]] = source;
							this.soundPatterns[sound].push(change[sound]);
							this.soundPatterns[sound].sort(function(a, b) {return a - b});	
						}

					}
				}
			};
			SoundPattern.prototype.enQ = function(loop) {
				
				if (!this.soundPatterns) return;

				var self = this;

				this.playbackState = 1;

				schedule(loop ? 1 : this.bars);
				
				function schedule(bars) {
					for (var i = 0; i < bars; ++i) {

						for (var sound in self.soundPatterns) {

							var indvSoundMappings = null;
							
							for (var j = 0; j < self.soundPatterns[sound].length; ++j) {
								if (self.soundPatterns[sound][j] < 1 
									|| self.soundPatterns[sound][j] > self.steps) continue;

								var source = audio.createSource({
									destination: doob.assets[sound].graph.connectable, 
									buffer: doob.assets[sound].buffer
								});
							
								var t = (i * self.barTime) + 
								(self.soundPatterns[sound][j] * self.fourthNoteTime + (doob.context.currentTime));
								source.start(t);
								self.lastScheduledSound = doob.context.currentTime + self.barTime;
								self.patternSources.push(source);
								indvSoundMappings = {};
								indvSoundMappings[self.soundPatterns[sound][j]] = source;
							}
							if (indvSoundMappings) self.soundPatternSources[sound] = indvSoundMappings;
						}
					}
					if (loop && self.playbackState != 0) {
						self.scheduledBars++;
						intvl = setTimeout(function() {
							schedule(1);
							self.cleanPlayedSources();
						}, self.barTime * 1000);
					}
				};
				return this;
			};
			SoundPattern.prototype.setSounds = function(sounds) {
				if (!sounds) return;
				this.io.sounds = sounds;
			};
			SoundPattern.prototype.addSound = function(sound) {
				if (!sound) return;
				this.io.sounds = sounds;
			};
			SoundPattern.prototype.initializeSounds = function(sounds) {
				if (typeof sounds === 'undefined' || sounds == null)
					return;
				this.sounds = sounds;
				for (var i = 0; i < sounds.length; ++i) {
					this.soundSources[i] = new Array();
					this.soundPatterns[i] = new Array();
				}
			};
			SoundPattern.prototype.stop = function(options) {
				if (self.intvl) clearInterval(intvl);
				for (var i = 0, l = this.patternSources.length; i < l; ++i) {
					if(this.patternSources[i]) {
						this.patternSources[i].stop(0);
					}				
				}
				this.patternSources = [];
				this.playbackState = 0;
				this.scheduledBars = 1;
				this.soundPatternSources = {};
			};
			SoundPattern.prototype.schedule = function (startTime) {
				var initTime = startTime || this.playStartTime;
				for (var j = 0; j < this.soundPatterns.length; ++j) {
					for (var i = 0; i < this.steps; ++i) {
						if (this.soundPatterns[j][i]) {
							this.soundSources[j][i] = playSound(this.sounds[j], (initTime + i * this.fourthNoteTime) 
								- this.fourthNoteTime / 16);
							this.patternSources.push(this.soundSources[j][i]);
						}
					}
				}
			};
			// SoundPattern.prototype.toggleNote = function (options) {
			// 	var e = options.domNode || null;
			// 	var i = typeof options.index === 'undefined' ? null : options.index;
			// 	var j = typeof options.soundIndex === 'undefined' ? null : options.soundIndex;
			// 	if (e == null || i == null || j == null)
			// 		return false; //THROW Proper Error
			// 	if (typeof this.soundPatterns[j][i] === 'undefined' || this.soundPatterns[j][i] == false) {
			// 		this.soundPatterns[j][i] = true;
			// 		if (this.played) {
			// 			var time = (this.playStartTime + i * this.fourthNoteTime);				
			// 			if (time > doob.context.currentTime) {
			// 				this.soundSources[j][i] = playSound(this.sounds[j], time);
			// 				this.patternSources.push(this.soundSources[j][i]);
			// 			}					
			// 		}
			// 	e.setAttribute('class', 'btn btn-large btn-success'); // Remove this. Bind it to the model...
			// 	}
			// 	else {
			// 		if(this.soundSources[j][i])
			// 			this.soundSources[j][i].stop(0);
			// 		this.soundPatterns[j][i] = false;
			// 		e.setAttribute('class', 'btn btn-large');

			// 	}
			// 	if (options.broadcast) {
			// 		options.broadcast = false;
			// 		emitEvent('toggleNote', options);
			// 	}	
			// };
			SoundPattern.prototype.resetTiming = function(tempo) {
				this.tempo = tempo;
				this.sixteenthNoteTime = ((60) / this.tempo) / 1;
				this.eighthNoteTime = ((60) / this.tempo) / 2;
				this.fourthNoteTime = ((60) / this.tempo) / 4;
				this.secondNoteTime = ((60) / this.tempo) / 8;
				this.barTime = this.fourthNoteTime * this.steps			
				if (this.played) {
					this.stop({broadcast: false});
					this.play({broadcast: false});
				}
			};	
			SoundPattern.prototype.toString = function() {
				return 'doob.io.SoundPattern object ' + this.name + '.';
			};
			SoundPattern.prototype.isEqualTo = function(soundPattern) {
				if (!soundPattern || !soundPattern instanceof SoundPattern || !soundPattern.name) return false;
				if (this === soundPattern) return true;
				if (this.name == soundPattern.name) return true;
				return false;
			};
			SoundPattern.prototype.toJSON = function() {
				var obj = {
					type: 'SoundPattern',
					name: this.name,
					tracks: this.tracks,
					graph: this.graph.name,
					gain: this.gain
				};

				// for (var i in this.)

				return obj;
			};	
			return {
				SoundPattern: SoundPattern
			}
		}(doob));	
	};
});
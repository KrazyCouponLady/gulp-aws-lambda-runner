var map = require('map-stream'),
	fs = require('fs'),
	util = require('util'),
	FS = require('q-io/fs');

module.exports = function(eventFileName) {

	eventFileName = eventFileName || 'event.json';

	return map(function(vinyl, callback) {
		FS.listTree(vinyl.path, function(path, stat){
			return path.indexOf('node_modules') == -1 && /\.(js|json)$/.test(path);
		})
		.then(function(file) {
			if (this.executed) {
				return callback(null, vinyl);
			}

			var path = file[0];
			if (path.indexOf(eventFileName) > -1) {
				console.log('Using configured test event ' + path);
				this.eventData = JSON.parse(fs.readFileSync(path).toString());
			}
			else if (typeof this.handler == 'undefined') {
				var module = require(path);
				if (module.handler) {
					console.log('Using handler found at ' + path);
					this.handler = module.handler;
				}
			}

			if ((typeof this.eventData != 'undefined') && (typeof this.handler != 'undefined')) {
				console.time('Execution');

				var context = {
					fail: function(err) {
						console.timeEnd('Execution');
						callback(err);
					},
					succeed : function(data) {
						if (typeof data == 'string') {
							console.log(data);
						}
						else {
							console.log(util.inspect(data));
						}
						console.timeEnd('Execution');
						if (Array.isArray(data)) {
							console.log('Returned ' + data.length + ' rows');
						}
						callback(null, vinyl);
					}
				};

				context.done = function (err, data) {
					if (err) {
						context.fail(err);	
					}
					else {
						context.succeed(data);
					}
				};

				this.executed = true;
				this.handler(this.eventData, context);
			}
		}, function(err) {
			callback(err);
		});
	});
};

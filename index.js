var through = require('through2'),
	fs = require('fs'),
	util = require('util'),
	FS = require('q-io/fs');

module.exports = function(options) {

	options = options || {};

	var runner = {
		handler : null,
		eventData : options.eventData || {}
	};

	function read(vinylFile, enc, cb) {
		var filePath = vinylFile.path;

		FS.listTree(filePath, function(currentPath, stat){
			return currentPath.indexOf('node_modules') == -1 && /\.(js|json)$/.test(currentPath);
		})
		.then(function(currentFile) {
			var files = [].concat(currentFile);
			for (var i = 0, length = files.length; i < length; i++) {
				var currentFilePath = files[0];
				if (runner.handler == null && currentFilePath.substr(-3) == '.js') {
					var module = require(currentFilePath);
					if (module.handler) {
						runner.handler = module.handler;
					}
				}
				else if (typeof options.eventFileName != 'undefined' && currentFilePath.indexOf(options.eventFileName) > -1) {
					runner.eventData = JSON.parse(fs.readFileSync(currentFilePath).toString());
				}
			}
			cb(null, vinylFile);
		});
	};

	function end(cb) {
		var err = null;
		if (typeof runner.handler != 'function') {
			err = '[ABORT] No handler found in the supplied modules';
			cb(err);
		}
		else {
			console.time('Execution');
			console.log('\n');

			var context = {
				fail: function(err) {
					console.timeEnd('Execution');
					cb(err);
				},
				succeed : function(data) {
					if (typeof data == 'string') {
						console.log(data);
					}
					else {
						console.log(util.inspect(data));
					}
					console.log('\n');
					console.timeEnd('Execution');
					if (Array.isArray(data)) {
						console.log('Returned ' + data.length + ' rows');
					}
					cb();
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

			runner.handler(runner.eventData, context);
		}
	}

	return through.obj(read, end);
};


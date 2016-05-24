var through = require('through2'),
	gutil = require('gulp-util'),
	PluginError = gutil.PluginError,
	path = require('path'),
	util = require('util');

module.exports = function(options) {

	options = options || {};

	var PLUGIN_NAME = 'gulp-aws-lambda-runner',
   		runner = {
			handler : null,
			eventData : options.eventData || {}
		};

	function read(file, enc, cb) {
		if (file.path.indexOf('node_modules') > -1 || !(/\.(js|json)$/.test(file.path))) {
			return cb(null, file);
		}

		if (file.path.substr(-3) == '.js') {
			var m = require(file.path);
			if (typeof m.handler == 'function') {
				runner.handler = m.handler;
			}
		}
		else if (typeof options.eventFileName != 'undefined' && file.path.indexOf(options.eventFileName) > -1) {
			runner.eventData = JSON.parse(file.contents.toString());
		}
		return cb(null, file);
	}

	function end(cb) {
		var err = null;
		if (typeof runner.handler != 'function') {
			throw new PluginError(PLUGIN_NAME, 'No handler found in the supplied modules');
		}

		var startingTime = new Date().getTime(),
			handler = this;

		var context = {
			fail: function(err) {
				if (typeof err == 'string') {
					err = new Error(err);
				}
				gutil.log('Execution: ' + (new Date().getTime() - startingTime) + 'ms');
				gutil.beep();
				handler.emit('error', err);
				throw new PluginError(PLUGIN_NAME, err, {showStack: true});
			},
			succeed : function(data) {
				if (typeof data == 'string') {
					gutil.log(gutil.colors.gray(data));
				}
				else {
					gutil.log(gutil.colors.gray(util.inspect(data)));
				}
				gutil.log(gutil.colors.magenta('Execution: ' + (new Date().getTime() - startingTime) + 'ms'));
				if (Array.isArray(data)) {
					gutil.log('Returned ' + data.length + ' rows');
				}
				gutil.beep();
				return (function() {
					handler.emit('end');
					cb();
				})();
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

        var callback = function(err, result) {
            if (err) {
                context.fail(err);
            }
            else {
                context.succeed(result);
            }
        }

		runner.handler(runner.eventData, context, callback);
	}

	return through.obj(read, end);
};


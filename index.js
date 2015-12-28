var through = require('through2'),
	gutil = require('gulp-util'),
	PluginError = gutil.PluginError,
	requireFromString = require('require-from-string'),
	util = require('util');

module.exports = function(options) {

	options = options || {};

	var PLUGIN_NAME = 'gulp_aws_lambda_runner',
   		runner = {
			handler : null,
			eventData : options.eventData || {}
		};

	function read(vinylFile, enc, cb) {
		if (vinylFile.path.indexOf('node_modules') > -1 || !(/\.(js|json)$/.test(vinylFile.path))) {
			return cb(null, vinylFile);
		}

		if (runner.handler == null && vinylFile.path.substr(-3) == '.js') {
			var module = requireFromString(vinylFile.contents.toString());
			if (typeof module.handler == 'function') {
				runner.handler = module.handler;
			}
		}
		else if (typeof options.eventFileName != 'undefined' && vinylFile.path.indexOf(options.eventFileName) > -1) {
			runner.eventData = JSON.parse(vinylFile.contents.toString());
		}
		return cb(null, vinylFile);
	}

	function end(cb) {
		var err = null;
		if (typeof runner.handler != 'function') {
			throw new PluginError(PLUGIN_NAME, 'No handler found in the supplied modules');
		}

		var startingTime = new Date().getTime();

		var context = {
			fail: function(err) {
				gutil.log('Execution: ' + (new Date().getTime() - startingTime) + 'ms');
				gutil.beep();
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
				return cb();
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

	return through.obj(read, end);
};


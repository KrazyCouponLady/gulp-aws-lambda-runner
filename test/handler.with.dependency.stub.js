var dependency = require('./dependency.stub');

exports.handler = function(event, context) {
	context.done(null, 'Success');
};

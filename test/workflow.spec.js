var assert = require('assert'),
	File = require('vinyl'),
	handlerFactory = require('./handler.fixture.js'),
	awsLambdaRunner = require('../index');

describe('gulp-aws-lambda-runner', function() {

	describe('without a valid handler module', function() {
		it('should throw an error', function(done) {
			try {
				var actual = awsLambdaRunner({eventData:{}});
				actual.end();
				fail('An exception should be thrown');
			}
			catch (error) {
				done();
			}
		});
	});

	describe('using a single file workflow', function() {
		it('should find valid handler', function(done) {
			var actual = awsLambdaRunner({eventData:{}});
			actual.write(handlerFactory());
			actual.end();
			done();
		});
	});
});

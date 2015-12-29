var assert = require('assert'),
	vfs = require('vinyl-fs'),
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
			vfs.src('./test/handler.stub.js')
				.pipe(awsLambdaRunner({eventData:{}}))
				.on('end', done);
		});
	});

	describe('including local dependencies', function() {
		it('should resolve those dependencies (https://github.com/KrazyCouponLady/gulp-aws-lambda-runner/issues/1)', function(done) {
			vfs.src('./test/handler.with.dependency.stub.js')
				.pipe(awsLambdaRunner({eventData:{}}))
				.on('end', done);
		});
	});
});

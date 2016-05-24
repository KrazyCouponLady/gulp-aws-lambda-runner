var assert = require('assert'),
	vfs = require('vinyl-fs'),
	awsLambdaRunner = require('../index');

describe('gulp-aws-lambda-runner', function() {

	it('should throw an error when no handler is found', function(done) {
		try {
			var actual = awsLambdaRunner({eventData:{}});
			actual.end();
			assert.fail('An exception should be thrown');
		}
		catch (error) {
			done();
		}
	});

	it('should report a Lambda error on context.done(err)', function(done) {
		vfs.src('./test/handler.error.stub.js')
			.pipe(awsLambdaRunner({eventData:{}}))
			.on('error', function(error) {
				done();
			}) 
			.on('end', function() {
			   	assert.fail('Expected error message to be emitted');
			});
	});

	it('should find valid handler in a single file workflow', function(done) {
		vfs.src('./test/handler.stub.js')
			.pipe(awsLambdaRunner({eventData:{}}))
			.on('end', done);
	});

	it('should resolve local dependencies (https://github.com/KrazyCouponLady/gulp-aws-lambda-runner/issues/1)', function(done) {
		vfs.src('./test/handler.with.dependency.stub.js')
			.pipe(awsLambdaRunner({eventData:{}}))
			.on('end', done);
	});

});

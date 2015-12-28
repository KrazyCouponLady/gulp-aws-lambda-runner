var File = require('vinyl');

module.exports = function() {
	return new File({
		cwd: "/",
		base: "/fake/test/path/",
		path: "/fake/test/path/handler.js",
		contents: new Buffer('exports.handler=function(event,context){context.done(null,"sucess");};')
	});
};

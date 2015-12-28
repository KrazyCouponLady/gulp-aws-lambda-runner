## Intro

While working with Nodejs modules that are intended to be AWS Lambdas, it's convenient to execute the module without having to publish to AWS first.


## Installation

Install package with NPM, and add it to your development dependencies:

```npm install --save-dev gulp-aws-lambda-runner```

## Usage
A sample workflow:

* Lambda modules are in separate folders.
* The folder names are the lambda module names.
* Sample events are included in the module (such as event.json).

```.
+-- gulpfile.js
+-- src
|   +-- MyLambda
|       +-- MyLambda.js
|       +-- event.json
```

The following task could be used to execute a module in the above workflow.

```
var gulp = require('gulp'),
    path = require('path'),
    argv = require('yargs').argv,
    runner = require('gulp-aws-lambda-runner');
    
gulp.task('run', function(cb) {
    var specificLambda = argv.lambda,
        eventName = argv.event || 'event';

    if (!specificLambda) {
        return cb('[Aborting] Missing parameter: --lambda={NAME}');
    }

    return gulp.src(path.join(__dirname, 'src/', specificLambda, '*'))
               .pipe(runner({ eventFileName : eventName + '.json' }));
});
```

### Example Output
The return result from executing a lambda locally with the gulp-aws-lambda-runner plugin includes the data from ```context.done(err, data)``` and the execution time in milliseconds.

```
$ gulp run --lambda=MyLambda
[08:13:42] Using gulpfile /path/gulpfile.js
[08:13:42] Starting 'run'...
Using handler found at /path/src/MyLambda/MyLambda.js
Using configured test event /path/src/MyLambda/event.json

{
  // stringified array, object or primitve
}
  
Execution: 317ms
```

## LICENSE

The MIT License (MIT)

Copyright (c) 2015 The Krazy Coupon Lady

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


# Error Handling in JavaScript

test-errors-1.js:

```javascript
function foo(data) {
  var sum = data.x();
  console.log('sum =', sum);
}

function bar(data) {
  foo(data);
  console.log('we never get here');
}

try {
  bar('bad data');
}
catch(error) {
  var message = 'Oopsy, something went wrong:' + error;
  throw new Error(message);
}

console.log('we do get here');
```

test-errors-2.js:

```javascript
function testError(err) {
  try {
    throw err;
  }
  catch (error) {
    console.log('ERROR:', error);
  }
}

testError("An error has occurred");
testError(true);
testError(new Error("I detect an error!"));
testError(new SyntaxError("Your syntax is no good"));
```


# Error Handling in Express

## Reading

* [Proper Error Handling in ExpressJS](http://derickbailey.com/2014/09/06/proper-error-handling-in-expressjs-route-handlers/)
* [Error Handling in Node.js](https://www.joyent.com/developers/node/design/errors)
* [Express Error Handling](http://expressjs.com/guide/error-handling.html)
* [debug](https://www.npmjs.com/package/debug)
* [Error Handler Module](https://github.com/expressjs/errorhandler)


## Introduction to Errors and Exceptions

In JavaScript (and Node.js especially), there's a difference between an _error_ and an _exception_. An _error_ is any instance of the `Error` class. Errors may be constructed and then passed directly to another function or thrown. When you `throw` an _error_, it becomes an _exception_

Here's an example of using an error as an exception:

```javascript
throw new Error('something bad happened');
```

but you can just as well use an Error without throwing it:

```javascript
callback(new Error('something bad happened'));
```

and this is much more common in Node because most errors are _asynchronous_.


## Error Handler Middleware

If you weren’t aware of it, every _ExpressJS_ app comes with an error handler (actually two error handlers, one for development mode and one for production mode). These error handlers are included in the default `app.js` file that is generated by the `express` generator:

```javascript
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
```

This code properly handles an error that was sent up the line using the `return next(err);` style of handling. Instead of putting the app in to an exception state by throwing the error, it is properly handled by the middleware, allowing you to write your own custom code, error logging, and rendered view in response to the error ocurring.

> NOTE: You define error-handling middleware functions in the same way as other middleware functions, except for error-handling functions you have four arguments instead of three: (err, req, res, next).

> NOTE: You define error-handling middleware last, after other app.use() statements.


## Calling `next(err)` and `next('route')`

Calling `next(err)` tells the Express and Connect frameworks to pass the error along until an error handling middleware of function can properly take care of it.

```javascript
currentUser.save()
.then(function() {
  res.redirect('/todos');
}, function(err) {
  return next(err);         // pass the error to the next stage in the middleware pipeline
});
```

If you pass anything to the next() function (except the string 'route'), Express regards the current request as being in error and will skip any remaining non-error handling routing and middleware functions.

If you have a route handler with multiple callback functions you can use the route parameter to skip to the next route handler. For example:

```javascript
app.get('/a_paid_only_route',
  function checkIfPaidSubscriber(req, res, next) {
    if(!req.user.hasPaid) {
      next('route');          // skips the getPaidContent handler
    }
  }, function getPaidContent(req, res, next) {
    PaidContent.find(function(err, doc) {
      if(err) return next(err);
      res.json(doc);
    });
  });
```

## Running with DEBUG parameters

Compare the difference in terminal output between:

```bash
DEBUG=todos:* npm start
```

and

```bash
DEBUG=* npm start
```

> NOTE: The latter may be useful when debugging a really tricky problem.

How does this work?

Express uses the _debug_ module internally to log information about route matches, middleware functions that are in use, application mode, and the flow of the request-response cycle.

> `debug` is like an augmented version of `console.log`, but unlike `console.log`, you don’t have to comment out `debug` logs in production code. Logging is turned off by default and can be conditionally turned on by using the `DEBUG` environment variable.

To see all the internal logs used in Express, set the _DEBUG_ environment variable to express:* when launching your app.

```bash
DEBUG=express:* npm start
```

To see the logs only from the router implementation set the value of DEBUG to express:router

```bash
DEBUG=express:router npm start
```

You can combine DEBUG parameters using a comma-separated list of parameters:

```bash
DEBUG=http,mail,express:router,todos:* npm start
```

## Adding Your Own Debug Messages

With debug you simply invoke the exported function to generate your debug function, passing it a name which will determine if a noop function is returned, or a decorated console.error, so all of the console format string goodies you're used to work fine. A unique color is selected per-function for visibility.

For example, if we edit the `routes/todos.js` file and add the following `debug` code:

```javascript
var debug = require('debug')('todos:router');
...

// INDEX
router.get('/', authenticate, function(req, res, next) {
  debug('You found the INDEX route for todos!');
  var todos = global.currentUser.todos;
  res.render('todos/index', { todos: todos, message: req.flash() });
});
```

when we hit the `/todos` route, we will see the following in the Terminal output:

```
  todos:app You found the INDEX route for todos! +42s
```

> NOTE: The above output will only print if the DEBUG flag contains the pattern "todos:router" or "todos:*"


## Running in Development or Production Mode

```bash
nodemon                     # run in development mode
NODE_ENV=production nodemon # run in production mode
```

Add this to the bottom of `app.js` just above the line `module.exports = app;`:

```javascript
debug('Running in %s mode', app.get('env'));
```

## Questions

* How to set the error status code
* How to use `new Error`

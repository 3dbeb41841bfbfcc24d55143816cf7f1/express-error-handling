function foo(data) {
  if (data.y() === 0) {
    throw "You cannot divide by zero!";
  }
  var result = data.x() / data.y();
  console.log('result = ' + result);
  return result;
}

function bar(data) {
  var x = foo(data);
  console.log('we never get here');
  return x;
}

try {
  var data = {
    x: function() { return 3; },
    y: function() { return 0; }
  }
  var answer = bar(data);
}
catch(error) {
  var message = 'Oops, something went wrong: ' + error;
  console.log(message);
  // throw error;
}

console.log('I really want to see this message, even if we failed above');

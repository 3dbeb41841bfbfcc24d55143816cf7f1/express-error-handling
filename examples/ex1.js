function foo(data) {
  var sum = data.x() + data.y();
  console.log('sum =', sum);
}

function bar(data) {
  foo(data);
  console.log('we never get here');
}

swallowException = false;

try {
  bar('bad data');
}
catch(error) {
  var message = 'Oopsy, something went wrong:' + error;
  if (swallowException) {
    console.log(message);
  }
  else {
    throw new Error(message);
  }
}

console.log('we got here');

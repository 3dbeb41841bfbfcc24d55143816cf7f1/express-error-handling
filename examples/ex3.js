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

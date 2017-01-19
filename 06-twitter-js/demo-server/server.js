// require module
var express = require('express');

// creates the server we will use
var app = express();

// some arbitrary data
var myData = ['A', 'B', 'C'];

// logging middleware, matches everything
app.use('/', function (req, res, next) {
  console.log("Request:", req.method, req.path);
  next();
});

// middleware matches data/:wildcard and adds data object to the body
app.use('/data/:index', function (req, res, next) {
  // can access values of wildcards with req.params.NAME
  if (req.params.index < myData.length) {
    // add object to body, move on
    res.body = { data: myData[req.params.index] }
    next();
  } else {
    next({ status: 401, msg: "Bad index provided"});
  }
});

// VERB-oriented (PUT, GET, POST, DELETE) middleware are
// ENDPOINTS i.e. they need to be a perfect match with the url
// and they should send a response

app.get('/', function (req, res, next) {
  res.send('This is technically enough')
});

app.get('/unknown', function (req, res, next) {
  // immediately jumps to error handling middleware!
  next({ status: 403, msg: "dunno really" })
});

app.get('/data', function (req, res, next) {
  res.json(myData);
});

app.get('/data/:index', function (req, res, next) {
  // we are guaranteed the body.data middleware was already run
  res.send(res.body.data);
});

// matches anything else, jumps to error handler
app.use('/:anything', function(req, res, next) {
  next({ status: 400, msg: "couldn't find it" })
});

// error handling middleware - we only get here if everything else fails to match
// or a previous middleware handler called next({ ... }) (first parameter is truthy for it to be considered an error)
app.use(function (err, req, res, next) {
  console.error("ERROR!", err.msg || "idk!");
  res.sendStatus(err.status || 400);
});


// initiates the server to listen on PORT 3000
app.listen(3000, function () {
  console.log('The server started');
});

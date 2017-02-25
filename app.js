'use strict';

let express    = require('express');
let app 	   = express();
let bodyParser = require('body-parser');
let morgan 	   = require('morgan');
let mongoose   = require('mongoose');
let jwt        = require('jsonwebtoken');
let config     = require('./config');
let User       = require('./models/user');
let router     = express.Router();

mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use('/api', router);

router.get('/', function(req,res) {
	res.send('Hello');
});
router.get('/setup', function(req, res) {

  // create a sample user
  var nick = new User({ 
    name: 'Nick Cerminara', 
    password: 'password',
    email: 'nick@gmail.com' 
  });

  // save the sample user
  nick.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.send('success');
  });
});
router.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

app.listen(3000, function() {
	console.log('Server started');
});

module.exports = app;

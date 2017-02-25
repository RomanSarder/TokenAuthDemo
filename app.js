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

app.get('/', function(req,res) {
	res.send('Hello');
});

router.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

router.post('/login', function(req, res) {

  // find the user
  User.findOne({
    username: req.body.username
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else if(!req.body.email && !req.body.email == user.email ) {
      	res.json({ success: false, message: 'Authentication failed. No email was provided. '})
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: "24h" // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }   

    }

  });
});
app.listen(3000, function() {
	console.log('Server started');
});

module.exports = app;

'use strict';

let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let morgan = require('morgan');
let mongoose = require('mongoose');
let jwt = require('jsonwebtoken');
let config = require('./config');
let User = require('./models/user');
let router = express.Router();

mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/api', router);

app.get('/', function(req, res) {
    res.send('Hello');
});

router.post('/register', function(req, res) {
    User.find({ email: req.body.email }, function(err, user) {
        if (err) {
            console.log(err);
        } else if (user) {
            res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        } else {
            const newUser = new User({
                email: req.body.email,
                password: req.body.password,
                name: req.body.name
            });
            newUser.save(function(err) {
                if (err) {
                    console.log('Something went wrong');
                }
                const token = jwt.sign(newUser, app.get('superSecret'), {
                    expiresIn: "24h" // expires in 24 hours
                });
                res.status(201).json({
                    success: true,
                    message: 'Register successful, token sent',
                    token: token
                });
            })
        }
    });
});

router.post('/login', function(req, res) {

    // find the user
    User.findOne({
        email: req.body.email
    }, function(err, user) {

        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {

            // check if password matches
            if (user.password != req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else if (!req.body.email) {
                res.json({ success: false, message: 'Authentication failed. No email was provided. ' });
            } else if (!req.body.email == user.email) {
                res.json({ success: false, message: 'Authentication failed. E-mail doesn\'t match. ' });
            }

            // if user is found and password is right
            // create a token
            const token = jwt.sign(user, app.get('superSecret'), {
                expiresIn: "24h" // expires in 24 hours
            });

            // return the information including token as JSON
            res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
            });
        }



    });
});
app.listen(3000, function() {
    console.log('Server started');
});

module.exports = app;
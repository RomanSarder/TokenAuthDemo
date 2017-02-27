'use strict';
//require packages
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('./config');
const User = require('./models/user');
const router = express.Router();
const expressJwt = require('express-jwt');
//connect database
mongoose.connect(config.database);
app.set('superSecret', config.secret);
//configure express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/api', router);
app.use(function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('invalid token...');
    }
});

//index route
app.get('/', function(req, res) {
    res.send('Hello');
});
//user create route
router.post('/register', function(req, res) {

    //search if user with this email exists
    User.findOne({ email: req.body.email }, function(err, user) {
        if (err) {
            console.log(err);
        } else if (user) {
            //provide status response if true
            res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        } else {
            //if email isn't provided - response with status code 400
            if (!req.body.email) {
                res.status(400).json({
                    success: false,
                    message: 'Email wasn\'t provided'
                })
            } else {
                //if everything is ok create user and save
                User.create({
                    email: req.body.email,
                    password: req.body.password,
                    name: req.body.name
                }, function(err, newUser) {
                    if (err) {
                        console.log(err);
                    } else {
                        // create a token
                        let token = jwt.sign(newUser, app.get('superSecret'), {
                            expiresIn: '2 days', // expires in 2 days 
                            issuer: newUser.name
                        });
                        // return the information including token as JSON
                        res.status(201).json({
                            success: true,
                            message: 'Register successful, token sent',
                            token: token
                        });
                    }
                });
            }
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
            //if user is not found in db
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {

            // check if password matches
            if (user.password != req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else if (!req.body.email) {
                //check if email provided
                res.json({ success: false, message: 'Authentication failed. No email was provided. ' });
            } else if (!req.body.email == user.email) {
                //check if email matches
                res.json({ success: false, message: 'Authentication failed. E-mail doesn\'t match. ' });
            }

            // if user is found and password is right
            // create a token
            let token = jwt.sign(user, app.get('superSecret'), {
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
//using express-jwt middleware to fetch out and decode token 
router.get('/profile', expressJwt({ secret: app.get('superSecret') }), function(req, res) {
    res.json({
        name: req.user._doc.name,
        email: req.user._doc.email
    });
});

app.listen(3000, function() {
    console.log('Server started');
});

module.exports = app;
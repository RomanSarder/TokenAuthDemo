let mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
    name: String,
    password: String,
    email: String
});

module.exports = mongoose.model('User', UserSchema)
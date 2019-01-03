const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        min: 1,
        unique: true, /* Unique in the database, using the same email to post a user will give back 'duplicate key error collection' error. */
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }] /* tokens is an array to allow users login with different devices */
});

UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();
    return {
        _id: userObject._id,
        email: userObject.email
    } // This helps to repsonse certain fields and hide credential related fields when the mongoose object is converted to json object before sending back from the server.
};

// Create a instance method for User instance.
UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, 'abc123').toString(); // 'abc123' is the private secret key used to encode the payload that we passed in as the first param.
    
    console.log(`token: ${token}`)
    user.tokens.push({
        access,
        token
    });
    console.log(`user: ${JSON.stringify(user, undefined, 2)}`);
    return user.save().then(() => {
        return token;
    });
}

var User = mongoose.model('User', UserSchema);

module.exports = { User };
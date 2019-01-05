const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

// Model method (Similar to class method)
UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded; //decode JWT token

    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (error) {
        return Promise.reject(error);
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

// A mongoose middleware that will be executed before the action, which is 'save' to database in this case.
UserSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        // Only need to re-hash if the password in the database is going to change.
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next(); // Call this line to make the mongoose continue doing the action.
            })
        })
    } else {
        next();
    }
});

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
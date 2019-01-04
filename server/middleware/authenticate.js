var { User } = require('./../models/user');

// Create a middleware
var authenticate = (req, res, next) => {
    console.log('Use Authenticate Middleware');
    //console.log(JSON.stringify(req, undefined, 2));

    var token = req.header('x-auth'); //Get token from the request header.

    // Try to find the user by token
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        
        req.user = user;
        req.token = token;

        next(); // Since we changed the request here, so we need to use this line of code to make the code continue executing.
    }).catch((e) => {
        res.status(401).send(e);
    });
};

module.exports = { authenticate };
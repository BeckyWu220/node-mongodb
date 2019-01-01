var mongoose = require('mongoose');

mongoose.Promise = global.Promise; // Set mangoose to use Javascript promise

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp'); // 'mongodb' is the protocal

module.exports = {
    mongoose
};
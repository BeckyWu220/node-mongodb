var mongoose = require('mongoose');

//Create a data model with mongoose. This can also be achieved via mongoose.schema
var Todo = mongoose.model('Todo', {
    text: {
        type: String,
        required: true,
        min: 1,
        trim: true, 
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = { Todo };
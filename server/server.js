var express = require('express');
var bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose'); //This is critical because it works on linking with database first.
var { Todo } = require('./models/todo');
var { User } = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    console.log(req.body); //HTTP Request body. If we can a POST to localhost:3000/todos with a json object, it will print the json object here.
    var todo = new Todo({
        text: req.body.text
    }); //Then create a new todo instance with mongoose data model Todo.
    todo.save().then((doc) => {
        res.send(doc); //Save the new todo to database and send the todo back via response.
    }, (e) => {
        res.status(400).send(e); //sendback the 400 error
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({ todos }); //todos is an array, you can send it back as response directly, but if we would like to add more data to return at the same time, we cannot do it. 
        // Wrapping the array into a JSON object will help resolve this issue. 
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    console.log(req.params.id);
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(new ObjectID(id)).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({ todo });
    }).catch((e) => {
        return res.status(400).send(e);
    })       
    
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});

// var newUser = new User({
//     email: 'wanqiao.wu@gmail.com'
// });

// newUser.save().then((doc) => {
//     console.log('New user saved: ', doc)
// }, (err) => {
//     console.log('Unable to save user', err);
// })

module.exports = { app };
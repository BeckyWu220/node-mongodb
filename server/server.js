var express = require('express');
var bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose'); //This is critical because it works on linking with database first.
var { Todo } = require('./models/todo');
var { User } = require('./models/user');

var { authenticate } = require('./middleware/authenticate');

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

// POST /user
app.post('/users', (req, res) => {
    const { email, password } = req.body;
    console.log(JSON.stringify(req.body, undefined, 2));
    var user = new User({
        email,
        password
    });
    
    user.save().then((u) => {
        return user.generateAuthToken();
    }).then((token) => {
        console.log('New user saved: ', user)
        res.header('x-auth', token).send(user); // 'x-*' custom header
    }).catch((err) => {
        console.log('Unable to save user', err);
        res.status(400).send(err);
    })
});

// Use the middileware authenticate to run the authentication check before sending back any response.
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// User Login POST /users/login { email, password }
app.post('/users/login', (req, res) => {
    const { email, password } = req.body;

    //Verify user with this email exist in the db.
    User.findByCredentials(email, password).then((user) => {
        //res.send(user);
        user.generateAuthToken().then((token) => {
            //res.send(token);
            res.header('x-auth', token).send(user);
        });
    }).catch(() => {
        res.status(400).send();
    });
})

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});

module.exports = { app };
const expect = require('expect');
const request = require('supertest');

const { mongoose } = require('./../db/mongoose');
const { app } =  require('./../server');
const { Todo } = require('./../models/todo');

//Seeder
const todos = [{
    text: 'first test todo'
}, {
    text: 'second test todo'
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        //done(); //Run before running each test case. In this case, clear the Todo table.
        Todo.insertMany(todos); //Run seeding data before running each test case.
    }).then(() => done());
}); 

describe('POST /todos', () => {
    //Test Case No.1
    it('should create a new todo', (done) => {
        var text = 'Test todo text';
        request(app)
            .post('/todos')
            .send({
                text: text
            })
            .expect(200) // Check HTTP request error code
            .expect((res) => {
                expect(res.body.text).toBe(text);
            }) // Check HTTP response body content.
            .end((err, res) => {
                // Check Database to see if a new todo is created.
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(3); //If you cleared the database before running this test case, the param should be 1, if you seeded two todos in the database already before running this test case, the param should be 3 to pass the assertion.
                    expect(todos[2].text).toBe(text); //If you cleared the database before running this test case, the param should be 0, if you seeded two todos in the database already before running this test case, the param should be 2 to pass the assertion.
                    done();
                }).catch(e => done(e));
            })
    });

    //Test Case No.2
    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2); //If you cleared the database before running this test case, the param should be 0, if you seeded two todos in the database already before running this test case, the param should be 2 to pass the assertion.
                    done();
                }).catch(e => done(e));
            })
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    })
});
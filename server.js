var bodyParser = require('body-parser');
var express = require('express');
var _ = require('underscore');
var db = require('./db.js')

var app = express();
var PORT =  process.env.PORT || 3000;

app.use(bodyParser.json());

var todos = [];
var todoNextId = 1;

app.get('/', function (req, res) {
  res.send('ToDo app test');
});

app.get('/todos', function (req, res) {

  var queryParams = req.query;
  var filteredTodos = todos;

  if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
    filteredTodos = _.where(filteredTodos, {completed: true});
  } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    filteredTodos = _.where(filteredTodos, {completed: false});
  }

  if (queryParams.hasOwnProperty('q') && queryParams.q.toLowerCase().length > 0) {

    filteredTodos = _.filter(filteredTodos, function(todo){
      return todo.description.toLowerCase().indexOf(queryParams.q.trim().toLowerCase()) > -1;
    });

  }

  res.json(filteredTodos);



});

app.get('/todos/:id', function (req, res) {
  var id = parseInt(req.params.id, 10);
  var matchTodo;

  if (typeof id === 'number') {
    matchTodo = _.findWhere(todos, {id: id});
  } else {
    res.json("please enter number id")
  }

  if (matchTodo) {
    res.json(matchTodo);
  } else {
    res.status(404).send();
  }

});


app.post('/todos', function (req, res) {
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body).then(function (todo) {
    res.json(todo);
  }).catch(function (e) {
      res.status(400).json(e);
  });

});

app.delete('/todos/:id', function (req, res) {
  var id = parseInt(req.params.id, 10);
  var matchTodo = _.findWhere(todos, {id: id});

  if (!matchTodo) {
    res.status(404).json({"error": "no todo found"});
  } else {
    todos = _.without(todos, matchTodo);
    res.json(todos);
  }

});

app.put('/todos/:id', function (req, res) {
  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};
  var id = parseInt(req.params.id, 10);
  var matchTodo = _.findWhere(todos, {id: id});

  if (!matchTodo) {
    res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.hasOwnProperty('completed')) {
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty('completed')) {
    return res.status(404).send();
  }

  if (_.isString(body.description) && body.hasOwnProperty('description') && body.description.trim().length > 0) {
    validAttributes.description = body.description;
  } else if (body.hasOwnProperty('description')) {
    return res.status(404).send();
  }

  _.extend(matchTodo, validAttributes);
  res.json(matchTodo);

});

db.sequelize.sync().then(function() {
  app.listen(PORT, function (req, res) {
    console.log('Express Server is Running ' + PORT + '!');
  });
});

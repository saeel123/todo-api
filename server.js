var bodyParser = require('body-parser');
var express = require('express');
var _ = require('underscore');
var app = express();
var PORT =  process.env.PORT || 3000;

app.use(bodyParser.json());

var todos = [];
var todoNextId = 1;

app.get('/', function (req, res) {
  res.send('ToDo app test');
});

app.get('/todos', function (req, res) {
  res.json(todos);
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

  if (!_.isBoolean(req.body.completed) || !_.isString(req.body.description) || req.body.description.trim().length === 0) {
    return res.status(404).send();
  }

  body.id = todoNextId ++;
  body.description = body.description.trim();
  todos.push(body);
  res.json(body);

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

app.listen(PORT, function (req, res) {
  console.log('Express Server is Running ' + PORT + '!');
});

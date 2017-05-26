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

  var query = req.query;
  var where = {};


  if (query.hasOwnProperty('completed') && query.completed === 'true') {
    where.completed = true;
  } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
    where.completed = false;
  }

  if (query.hasOwnProperty('q') && query.q.toLowerCase().length > 0) {
    where.description = {
      $like: '%'+ query.q +'%'
    };
  }

  db.todo.findAll({
    where:where
  }).then(function (todos) {
    if (todos) {
      res.json(todos);
    } else {
      res.status(404).send();
    }
  }).catch(function (e){
    res.status(500).send(e);
  });


});

app.get('/todos/:id', function (req, res) {
  var id = parseInt(req.params.id, 10);

  db.todo.findById(id).then(function (todo) {
    if (todo) {
      res.json(todo);
    } else {
      res.status(404).send(e);
    }
  }).catch(function (e) {
    res.status(500).json(e);
  });

});


app.post('/todos', function (req, res) {
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body).then(function (todo) {
    if (todo) {
      res.json(todo.toJSON());
    } else {
      res.status(404).send();
    }
  },function (e) {
      res.status(500).json(e);
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

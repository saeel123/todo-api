var bodyParser = require('body-parser');
var express = require('express');
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
    for (i = 0; i < todos.length; i++) {
      console.log(todos[i].id);
      if (todos[i].id === id) {
        matchTodo = todos[i];
      }
    }
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
  var body = req.body;
  body.id = todoNextId ++;


  todos.push(body);
  res.json(body);


});

app.listen(PORT, function (req, res) {
  console.log('Express Server is Running ' + PORT + '!');
});

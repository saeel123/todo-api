var express = require('express');
var app = express();
var PORT =  process.env.PORT || 3000;

var todos = [{
  id: 1,
  description: 'fix bike',
  completed: false
},{
  id: 2,
  description: 'fix Pc',
  completed: false
},{
  id: 3,
  description: 'fix',
  completed: true
}]

app.get('/', function (req, res) {
  res.send('ToDo app test');
});

app.get('/todos', function (req, res) {
  res.json(todos);
});

app.get('/todos/:id', function (req, res) {
  var id = parseInt(req.params.id, 10);
  var matchTodo;

  console.log(id);

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

app.listen(PORT, function (req, res) {
  console.log('Express Server is Running ' + PORT + '!');
});

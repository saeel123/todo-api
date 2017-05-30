var bodyParser = require('body-parser');
var express = require('express');
var _ = require('underscore');
var db = require('./db.js')
var bcrypt = require('bcrypt');

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

  db.todo.destroy({
    where: {
      id: id
    }
  }).then(function (rowsDeleted) {
    if (rowsDeleted === 0) {
      res.status(404).json({error: 'no todo with the id'});
    } else {
      res.status(204).send();
    }
  },function (e) {
    res.status(500).json(e);
  });

});

app.put('/todos/:id', function (req, res) {
  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};
  var id = parseInt(req.params.id, 10);

  if (body.hasOwnProperty('completed')) {
    validAttributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    validAttributes.description = body.description;
  }

  db.todo.findById(id).then(function (todo){
    if (todo) {
      return todo.update(validAttributes);
    } else {
      res.status(404).send;
    }
  }, function (e) {
      res.status(500).json(e);
  }).then(function (todo) {
    res.json(todo);
  }, function (e) {
      res.status(404).json(e);
  });

});

app.post('/user', function (req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.create(body).then(function (user) {
    if (user) {
      res.json(user.toPublicJSON());
    } else {
      res.status(404).send();
    }
  },function (e) {
      res.status(500).json(e);
  });
});


app.post('/user/login', function (req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.authenticate(body).then(function (user) {
    res.json(user.toPublicJSON());
  },function () {
    res.status(401).send();
  })

});


db.sequelize.sync({force: true}).then(function() {
  app.listen(PORT, function (req, res) {
    console.log('Express Server is Running ' + PORT + '!');
  });
});

let express = require('express');
let router = express.Router();

let DBConn = require('../db-conn');
let db = new DBConn();

/* GET home page. */
router.get('/', async function (req, res, next) {
  const result = await db.findAllUsers();
  console.log('result', result)
  res.render('eventos/index', {
    users: result
  });
});

/* GET home page. */
router.get('/novo', function (req, res, next) {
  res.render('eventos/novo');
});

/* Criação de usuário. */
router.post('/', function (req, res, next) {
  const MINIMUM_LENGTH_OF_FIELDS = 3;
  const message_length_error = (field) => `${field} deve conter pelo menos 3 caracteres`
  let errors = [];
  const { username, name, email, password } = req.body;
  
  if(username.length < MINIMUM_LENGTH_OF_FIELDS) errors.push(message_length_error('username'));
  if(name.length < MINIMUM_LENGTH_OF_FIELDS) errors.push(message_length_error('name'));
  if(email.length < MINIMUM_LENGTH_OF_FIELDS) errors.push(message_length_error('email'));
  if(password.length < MINIMUM_LENGTH_OF_FIELDS) errors.push(message_length_error('password'));
  if(name === '') errors.push("Nome não informado");

  if (errors.length == 0) {
    db.createUser(req.body.username, req.body.name, req.body.password, req.body.email, (err, data) => {
      if (err) {
        next(err);
      } else {
        res.redirect('/eventos');
      }
    });
  } else {
    res.render('eventos/novo', {
      "errors": errors
    });
  }
});

/* Editar o usuário */

router.get('/editar/:id', async function (req, res, next) {
  await db.getUserById(req.params.id, (err, data) => {
    if (err) next(err)
    else if (!data) res.status(404).send('Usuário não encontrado.');
    else res.render('eventos/editar', { users: data });
  });
});

router.post('/:id', function (req, res, next) {
  var errors = [];
  if (req.body.nome == "") {
    errors.push("Nome não informado.");
  }

  if (errors.length == 0) {
    db.updateUser(req.body.id, req.body.username, req.body.name, req.body.password, req.body.email, (err, data) => {
      if (err) next(err)
      else res.redirect('/eventos/' + req.body.id);
    });
  } else {
    let user = {};
    user.id = req.body.id;
    user.username = req.body.username;
    user.name = req.body.name;
    user.password = req.body.password;
    user.email = req.body.email;
    
    res.render('eventos/editar', { 
      "user": users, 
      "errors": errors 
    });
  }
});


/* Buscar pelo id */
router.get('/:id', async (req, res, next) => {
  const {
    id
  } = req.params;

  const result = await db.getUserById(id).catch(() => {
    return res.status(404).send("Usuário não encontrado.");
  });

  return res.render('eventos/detalhe', {
    users: result
  });
});


/* Rota para exclusão */
router.post('/deletar/:id', (req, res, next) => {
  db.deleteUser(req.params.id, (err, data) => {
    if (err) {
      next(err);
    } else {
      //res.send('Novo evento criado:' + req.body.nome);
      res.redirect('/eventos');
    }
  });
});

module.exports = router;
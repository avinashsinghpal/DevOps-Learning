var express = require('express');
var router = express.Router();

let user = [
  {
    id: 1,
    name: "Avinash"
  },]
let nextId = 2; 

router.get('/', function(req, res, next) {
    res.json(user);
});

router.post('/', function(req, res, next) {
  const newUser = {
    id: nextId++,
    name: req.body.name
  };
  user.push(newUser);
  res.json(newUser);
});

router.put('/:id', function(req, res, next) {
  const userId = parseInt(req.params.id);
  const updatedUser = {
    id: userId,
    name: req.body.name
  };
  const index = user.findIndex(u => u.id === userId);
  if (index !== -1) {
    user[index] = updatedUser;
    res.json(updatedUser);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

router.delete('/:id', function(req, res, next) {
  const userId = parseInt(req.params.id);
  const index = user.findIndex(u => u.id === userId);
  if (index !== -1) {
    const deletedUser = user.splice(index, 1)[0];
    res.json(deletedUser);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

module.exports = router;

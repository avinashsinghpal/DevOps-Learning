var express = require('express');
var router = express.Router();


const User = require('../models/User');

let user = [
  {
    id: 1,
    name: "Avinash"
  },]
let nextId = 2; 


router.get('/', async function(req, res, next) {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.post('/', async function(req, res, next) {
    try {
        const newUser = await User.create({
            name: req.body.name
        });

        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.put('/:id', async function(req, res, next) {
    try {
        const userId = req.params.id;
        const updatedUser = await User.findByIdAndUpdate(userId, {
            name: req.body.name
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
    
     
router.delete('/:id', async function(req, res, next) {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully', deletedUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


module.exports = router;

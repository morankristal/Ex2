const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();


router.get('/id/:id', userController.getUserById);
router.get('/username/:username', userController.getUserByUsername);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser);
router.post('/refresh-token', userController.refreshToken);
router.get('/', userController.getAllUsers);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;

var express = require('express');
const registerController = require('../controllers/registerController');
const loginController = require('../controllers/loginController');
var router = express.Router();
const authenticateService  = require('../auth/authService');
/* GET  */
router.get('/', function(req, res) {
  res.render('login');
});
router.get('/chat', authenticateService.authenticateToken, (req, res) => {
  const username = req.user.username;
  res.render('chat', { username });
});
router.get('/private', authenticateService.authenticateToken, (req, res) => {
  const username = req.user.username;
  res.render('private', { username });
});
router.get('/register', (req, res) => {
  res.render('register');
});
router.get('/profile', authenticateService.authenticateToken, (req, res) => {
  res.render('profile', { user: req.user });
});
router.post('/register' , registerController.RegisterUserController);

router.post('/login' , loginController.login);

module.exports = router;

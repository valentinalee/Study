var express = require('express');
var router = express.Router();

var homeController = require('../controllers/home');
var contactController = require('../controllers/contact');

router.get('/', homeController.index);


router.get('/contact', contactController.getContact);
router.post('/contact', contactController.postContact);

module.exports = router;

var express = require('express');
const controller = require('./../controller/controller');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Private Key 생성
router.get('/generate_key',  controller.generate_private_key);
module.exports = router;

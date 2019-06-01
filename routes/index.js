var express = require('express');
const controller = require('./../controller/controller');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Private Key 생성 (유저)
router.get('/generate_key',  controller.generate_private_key);
// Public Key 배포 (유저)
router.post('/deploy_key',  controller.deploy_public_key);
// Public Key 획득
router.get('/get_key',  controller.get_public_key);

// Request List 배포 (유저)
router.post('/register_request_list',  controller.register_request_list);
// Request List 획득 (클라우드 서버)
router.get('/get_request_list',  controller.get_request_list);

// 데이터 요청 처리 (클라우드 서버)
router.get('/get_encrypted_data',  controller.get_encrypted_data);
// 학습 결과 처리 (클라우드 서버)
router.post('/learning_result',  controller.handle_learning_result);

module.exports = router;

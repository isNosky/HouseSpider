var express = require('express');
var router = express.Router();
var service = require('../service/index.js');
var constant = require('../config/constant.js');
var logger = require('../logger').logger;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function(req, res, next) {
  service.getRegisterList(function(ret,rows){
    var result = constant.resOk;
    if(ret){
      logger.info(rows);
      result.result = rows;
      result.totalcnt = rows.length;
    }else{
      result.totalcnt = 0;
    }
    sendResponse(res,result);
  })
})

function sendResponse(res,json){
  res.contentType('json');
  res.send(JSON.stringify(json));
  res.end();
}
module.exports = router;

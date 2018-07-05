/**
 * Created by Administrator on 2018/6/27 0027.
 */
var schedule = require("node-schedule");
var logger = require('../logger').logger;
var http = require('http');
var request = require('request');
var xpath  = require('xpath')
var dom = require('xmldom').DOMParser;
var util = require('util');
var config = require('../config/config');
var fs = require('fs');
var pool = require('./dbpool.js').pool(config.dvosdbHost,config.dvosdbPort,config.dvosdbUser,config.dvosdbPassword,config.dvosdbDSN);

var sqlfmt = "INSERT INTO `house`.`tbl_house` (`name`, `company`, `regstarttime`, `regendtime`, `buildingno`, `registrationno`, `recvdocstarttime`, `recvdocendtime`, `recvdocaddr`) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')";
var sqlpublish = "INSERT INTO `house`.`tbl_publish` (`index_no`, `title`, `publishtime`, `filelink`, `trid`) VALUES ('%s', '%s', '%s', '%s', '%s')";

function getTime(str){
    //var reg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d$/;
    //var regExp = new RegExp(reg);
    //var time = regExp.exec(str);
    //return time;
    var time = str.split("至 ");
    return time;
}

function GetTrid(str){
    return str.substring(str.lastIndexOf("=")+1);
}

function GetFunction(doc,single){
    var select = xpath.useNamespaces({"bookml":"http://www.w3.org/1999/xhtml"});

    return function(xpath){
        var node = select(xpath,doc,single);
        var arr = [];
        if(null != node){
            node.forEach(function(value,index,array){
                if(value.nodeValue != undefined){
                    arr.push(value.nodeValue.trim());
                }else{
                    arr.push(value.firstChild.data.trim());
                }
            });
        }
        return arr;
    };
}

//登记信息
var bFinished = false;
var pagenum = 1;
var j = schedule.scheduleJob('30 * * * *', function(){
    while(!bFinished && pagenum < 30){
        request('http://124.115.228.93/zfrgdjpt/xmgs.aspx?page='+pagenum++, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.

            var str = body.replace(/\r\n/g, "");
            str = str.replace(/<!DOCTYPE html>/g, "");
            str = str.replace(/&nbsp;/g, "");
            if(error == null){
                var doc = new dom().parseFromString(str);
                var select = GetFunction(doc);
                var nodes = xpath.select("//html", doc)
                var name = select(config.XPATH_PROJECT_NAME,doc);
                var company = select(config.XPATH_COMPANY_NAME,doc);
                var regtime = select(config.XPATH_REGISTER_TIME,doc);
                var buildingno = select(config.XPATH_BUILDING_NO,doc);
                var reggistrionno = select(config.XPATH_REGISTION_NO,doc);
                var recvdoctime = select(config.XPATH_RECEIVE_DOC_TIME,doc);
                var recvdocaddr = select(config.XPATH_RECEIVE_DOC_ADDR,doc);

                if(name.length == 0){
                    bFinished = true;
                }else{
                    pool.getConnection(function(err, connection) {
                        if (err) {
                            logger.error(err);
                        }else {
                            for(var i = 0 ; i < name.length ; i++){
                                var arrregtime = getTime(regtime[i]);
                                var arrrecvdoctime = getTime(recvdoctime[i]);
                                var sql = util.format(sqlfmt,name[i],company[i],arrregtime[0],arrregtime[1],buildingno[i],reggistrionno[i],arrrecvdoctime[0],arrrecvdoctime[1],recvdocaddr[i]);
                                logger.info(sql);
                                connection.query(sql, function (err, rows) {
                                    if (err) {
                                        logger.error(err);
                                    }
                                });
                            }
                            connection.release();
                        }
                    });
                }
            }
        });
    }
});

//价格公示
var k = schedule.scheduleJob('30 2 * * *', function(){
    request('http://wjj.xa.gov.cn//ptl/def/def/index_1285_8357.jsp?_cimake=false&searchvalue=%E5%95%86%E5%93%81%E4%BD%8F%E6%88%BF%E4%BB%B7%E6%A0%BC%E5%85%AC%E7%A4%BA', function (error, response, body) {
        //console.log('error:', error); // Print the error if one occurred
        //console.log('statusCode:', response && response.statusCode); // Print th response status code if a response was received
        //console.log('body:', body); // Print the HTML for the Google homepage.

        var str = body.replace(/\r\n/g, "");
        str = str.replace(/<!DOCTYPE html>/g, "");
        str = str.replace(/&nbsp;/g, "");
        if(error == null){
            var doc = new dom().parseFromString(str);
            var select = GetFunction(doc);
            var index = select(config.XPATH_INDEX_NO,doc);
            var title = select(config.XPATH_TITLE,doc);
            var publishtime = select(config.XPATH_PUBLISH_TIME,doc);
            var filelink = select(config.XPATH_FILE_PAGE_LINK,doc,true);

            pool.getConnection(function(err, connection) {
                if (err) {
                    logger.error(err);
                }else {
                    for(var i = 0 ; i < index.length ; i++){
                        var sql = util.format(sqlpublish,index[i],title[i],publishtime[i],'http://wjj.xa.gov.cn//websac/cat/'+GetTrid(filelink[i])+'.html');
                        logger.info(sql);
                        connection.query(sql, function (err, rows) {
                            if (err) {
                                logger.error(err);
                            }
                        });
                    }
                    connection.release();
                }
            });
        }
    });
});

//公示文件下载
var id = 0;
var k = schedule.scheduleJob('30 3 * * *', function(){
    pool.getConnection(function(err, connection) {
        if (err) {
            logger.error(err);
        }else {
            var sql = "select * from tbl_publish where got = 0";
            logger.info(sql);
            connection.query(sql, function (err, rows) {
                if (err) {
                    logger.error(err);
                }else{
                    rows.forEach(function(value,index,array){
                        id = value.id;
                        request(value.filelink, function (error, response, body) {
                            var str = body.replace(/\r\n/g, "");
                            str = str.replace(/<!DOCTYPE html>/g, "");
                            str = str.replace(/&nbsp;/g, "");
                            logger.info(str);
                            if(error == null) {
                                var doc = new dom().parseFromString(str);
                                var select = GetFunction(doc);
                                var url = "http://wjj.xa.gov.cn/"+select(config.XPATH_FILE_LINK,doc);

                                var name = url.substring(url.lastIndexOf('/')+1);
                                if(name != ""){
                                    request(url).pipe(fs.createWriteStream('../file/'+name)).on("close", function (err) {
                                        logger.info("文件[" + name + "]下载完毕");
                                        var sql2 = "update tbl_publish set got = 1 where id = " + id;
                                        connection.query(sql, function (err, rows) {
                                            if (err) {
                                                logger.error(err);
                                            } else {
                                                logger.info("文件[" + name + "]已保存");
                                            }
                                        });
                                    });;
                                }
                            }
                        });
                    });
                }
                connection.release();
            });

        }
    });
});
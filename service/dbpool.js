/**
 * Created by nosky_000 on 2016/11/10.
 */

var mysql = require('mysql');
var config = require('../config/config');

//定义pool池
var pool;

exports.pool = function(host,port,user,password,dsn){
    pool = mysql.createPool(
        {
            connectionLimit : 1000,
            connectTimeout  : 60 * 1000,
            aquireTimeout   : 60 * 1000,
            timeout         : 60 * 1000,
            host        : host,
            user        : user,
            password    : password,
            database    : dsn,
            port        : port
        }
    );
    return pool;
}
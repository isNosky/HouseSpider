/**
 * Created by Administrator on 2018/7/2 0002.
 */

var config = require('../config/config');
var logger = require('../logger').logger;
var util = require('util');

var pool = require('./dbpool.js').pool(config.dvosdbHost,config.dvosdbPort,config.dvosdbUser,config.dvosdbPassword,config.dvosdbDSN);

exports.getRegisterList = function(cb){
    pool.getConnection(function(err, connection) {
        if (err) {
            cb(false, null);
            logger.error(err);
        } else {
            var totalSQL = "SELECT 	id, 	`name`, 	company, 	DATE_FORMAT(regstarttime,'%Y-%m-%d') regstarttime, 	DATE_FORMAT(regendtime,'%Y-%m-%d') regendtime, 	GetStatus (regstarttime, regendtime) regstatus, 	buildingno, 	registrationno, 	DATE_FORMAT(recvdocstarttime,'%Y-%m-%d') recvdocstarttime, 	DATE_FORMAT(recvdocendtime,'%Y-%m-%d') recvdocendtime, 	GetStatus ( 		recvdocstarttime, 		recvdocendtime 	) recvdocstatus, 	recvdocaddr FROM 	tbl_house ORDER BY 	regendtime DESC, 	recvdocendtime DESC";
            logger.info(totalSQL);
            connection.query(totalSQL, function (err, rows) {
                if (err) {
                    cb(false);
                    logger.error(err);
                } else {
                    cb(true, rows);
                    connection.release();
                }
            });
        }
    });
};
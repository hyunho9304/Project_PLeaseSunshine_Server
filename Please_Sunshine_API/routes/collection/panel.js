/*
	URL : /collection/company
	Description : 업체 리스트
	Content-type : x-www-form-urlencoded
	method : GET
*/

const express = require('express');
const router = express.Router();
const pool = require('../../config/dbPool'); //	경로하나하나
const calculActualPrice = require( '../../modules/calculActualPrice' ) ;
const async = require('async');
const moment = require('moment');

router.get('/', function(req, res) {

    let c_id = req.query.c_id ;

    let task = [

        function(callback) {
            pool.getConnection(function(err, connection) {
                if (err) {
                    res.status(500).send({
                        status: "fail",
                        message: "internal server err"
                    });
                    callback("getConnection err");
                } else {
                    callback(null, connection);
                }
            });
        },

        function(connection, callback) {

            let selectCompanyDetailQuery = 'SELECT * FROM Company C , PanelInfo PI WHERE C.c_id = PI.c_id AND C.c_id = ? ORDER BY if(ASCII(SUBSTRING(C.c_name , 1)) < 128, 9, 1) ASC , C.c_name ASC';

            connection.query(selectCompanyDetailQuery, c_id , function(err, result) {
                if (err) {
                    res.status(500).send({
                        status: "fail",
                        message: "internal server err"
                    });
                    connection.release();
                    callback("selectCompanyDetailQuery err");
                } else {

                    let list = [];

                    for (let i = 0; i < result.length; i++) {

                        let data = {

                            c_module : result[i].c_moudle ,
                            c_inverter : result[i].c_inverter ,
                            c_phoneNum : result[i].c_phoneNum ,
                            c_site : result[i].c_site ,

                            pi_id : result[i].pi_id ,
                            pi_watt : result[i].pi_watt ,
                            pi_type : result[i].pi_type ,
                            pi_installPrice : result[i].pi_installPrice ,
                            pi_supportPrice : result[i].pi_installPrice - calculActualPrice( result[i].pi_watt , result[i].pi_installPrice ) ,
                            pi_actualPrice : calculActualPrice( result[i].pi_watt , result[i].pi_installPrice ) ,
                            pi_size : result[i].pi_size
                        }
                        list.push( data ) ;
                    }
                    connection.release();
                    callback(null, list );
                }
            });
        },

        function(list, callback) {

            res.status(200).send({
                status: "success",
                data: list,
                message: "successful get CompanyDetail"
            });
            callback(null, "successful get CompanyDetail");
        }
    ];

    async.waterfall(task, function(err, result) {

        let logtime = moment().format('MMMM Do YYYY, h:mm:ss a');

        if (err)
            console.log(' [ ' + logtime + ' ] ' + err);
        else
            console.log(' [ ' + logtime + ' ] ' + result);
    }); //async.waterfall
});

module.exports = router;
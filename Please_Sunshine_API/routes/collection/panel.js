/*
    URL : /collection/panel
    Description : 업체 디테일
    Content-type : x-www-form-urlencoded
    method : GET
    query = /?c_id={업체인덱스}
*/

const express = require('express');
const router = express.Router();
const pool = require('../../config/dbPool');
const calculActualPrice = require('../../modules/calculActualPrice');
const async = require('async');
const moment = require('moment');

router.get('/', function(req, res) {

    let c_id = req.query.c_id;

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

            let selectCompanyDetailQuery = 'SELECT * FROM Company C , PanelInfo PI WHERE C.c_id = PI.c_id AND C.c_id = ? ORDER BY PI.pi_watt ASC';

            connection.query(selectCompanyDetailQuery, c_id, function(err, result) {
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
                            pi_id: result[i].pi_id,
                            pi_watt: result[i].pi_watt,
                            pi_type: result[i].pi_type,
                            pi_installPrice: result[i].pi_installPrice.toLocaleString() + "원" ,
                            pi_supportPrice: ( result[i].pi_installPrice - calculActualPrice(result[i].pi_watt, result[i].pi_installPrice) ).toLocaleString() + "원",
                            pi_actualPrice: ( calculActualPrice(result[i].pi_watt, result[i].pi_installPrice) ).toLocaleString() + "원" ,
                            pi_size: result[i].pi_size + "mm"
                        }
                        list.push(data);
                    }
                    connection.release();
                    callback(null, list , result[0].c_module , result[0].c_inverter , result[0].c_phoneNum , result[0].c_site );
                }
            });
        },

        function(list, c_module , c_inverter , c_phoneNum , c_site , callback) {

            res.status(200).send({
                status: "success",
                data: {
                    c_module : c_module ,
                    c_inverter : c_inverter ,
                    c_phoneNum : c_phoneNum ,
                    c_site : c_site ,
                    detail : list
                } ,
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
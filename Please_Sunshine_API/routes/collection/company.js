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

            let selectComapnyListQuery = 'SELECT * FROM Company C , PanelInfo PI WHERE C.c_id = PI.c_id ORDER BY if(ASCII(SUBSTRING(C.c_name , 1)) < 128, 9, 1) ASC , C.c_name ASC';

            connection.query(selectComapnyListQuery, function(err, result) {
                if (err) {
                    res.status(500).send({
                        status: "fail",
                        message: "internal server err"
                    });
                    connection.release();
                    callback("selectComapnyListQuery err");
                } else {

                    let list = [];

                    let index = result[0].c_id;
                    let minWatt = result[0].pi_watt;
                    let maxWatt = result[0].pi_watt;
                    let minPrice = calculActualPrice( result[0].pi_watt , result[0].pi_installPrice ) ;
                    let maxPrice = calculActualPrice( result[0].pi_watt , result[0].pi_installPrice ) ;

                    for (let i = 0; i < result.length; i++) {

                        if (index == result[i].c_id) {

                        	let tmpWatt = result[i].pi_watt ;
                        	let tmpPrice = calculActualPrice( result[i].pi_watt , result[i].pi_installPrice ) ;

                            if (maxWatt < tmpWatt )
                                maxWatt = tmpWatt ;

                            if (minWatt > tmpWatt )
                                minWatt = tmpWatt ;

                            if( maxPrice <  tmpPrice )
                            	maxPrice = tmpPrice ;

                            if( minPrice > tmpPrice )
                            	minPrice = tmpPrice ;

                        } else {

                        	let minMaxWatt = minWatt + "~" + maxWatt + "W" ;
                        	let minMaxPrice = minPrice + "~" + maxPrice + "원" ;

                        	let data = {
                        		c_id : index ,
                        		c_name : result[i-1].c_name ,
                        		c_summaryInfo1 : minMaxWatt ,
                        		c_summaryInfo2 : minMaxPrice ,
                        		c_summaryInfo3 : result[i-1].c_phoneNum
                        	}
                        	list.push( data ) ;

                        	index = result[i].c_id;
                    		minWatt = result[i].pi_watt;
                    		maxWatt = result[i].pi_watt;
                    		minPrice = calculActualPrice( result[i].pi_watt , result[i].pi_installPrice ) ;
                    		maxPrice = calculActualPrice( result[i].pi_watt , result[i].pi_installPrice ) ;
                        }

                        if( i == result.length - 1 ) {

                        	let minMaxWatt = minWatt + "~" + maxWatt + "W" ;
                        	let minMaxPrice = minPrice + "~" + maxPrice + "원" ;

                        	let data = {
                        		c_id : index ,
                        		c_name : result[i].c_name ,
                        		c_summaryInfo1 : minMaxWatt ,
                        		c_summaryInfo2 : minMaxPrice ,
                        		c_summaryInfo3 : result[i].c_phoneNum
                        	}
                        	list.push( data ) ;
                        }
                    }
                    connection.release();
                    callback(null, list);
                }
            });
        },

        function(list, callback) {

            res.status(200).send({
                status: "success",
                data: list,
                message: "successful get CompanyList"
            });
            callback(null, "successful get CompanyList");
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
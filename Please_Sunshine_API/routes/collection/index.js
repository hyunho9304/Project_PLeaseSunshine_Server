var express = require('express');
var router = express.Router();

//	company 관련
const company = require( './company' ) ;
router.use( '/company' , company ) ;

//	panel 관련
const panel = require( './panel' ) ;
router.use( '/panel' , panel ) ;

module.exports = router;

/*
	Description : 총금액 - 보조금액 = 실질금액
*/

module.exports = function( watt , installPrice ) {

	if( watt == 250 )
		return installPrice - 510000 ;
	else if( watt == 260 )
		return installPrice - 530000 ;
	else if( watt == 270 )
		return installPrice - 550000 ;
	else if( watt == 300 )
		return installPrice - 610000 ;
	else
		return installPrice ;
}
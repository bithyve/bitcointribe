export const UsNumberFormat = ( amount, decimalCount = 0, decimal = ".", thousands = "," ) => {
    try {
        decimalCount = Math.abs( decimalCount );
        decimalCount = isNaN( decimalCount ) ? 2 : decimalCount;
        const negativeSign = amount < 0 ? "-" : "";
        let i = parseInt( amount = Math.abs( Number( amount ) || 0 ).toFixed( decimalCount ) ).toString();
        let j = ( i.length > 3 ) ? i.length % 3 : 0;
        return negativeSign + ( j ? i.substr( 0, j ) + thousands : '' ) + i.substr( j ).replace( /(\d{3})(?=\d)/g, "$1" + thousands ) + ( decimalCount ? decimal + Math.abs( amount - i ).toFixed( decimalCount ).slice( 2 ) : "" );
    } catch ( e ) {
        console.log( e )
    }
};  

export const timeConvert = (valueInMinutes) => {
    var num = valueInMinutes;
    var hours = Math.round(num / 60);
    var days = Math.round(hours / 24);
    if (valueInMinutes < 60) {
        return valueInMinutes + ' minutes';
    } else if (hours < 24) {
        return hours + ' hours';
    } else if (days > 0) {
        return days == 1 ? days + ' day' : days + ' days';
    }
}